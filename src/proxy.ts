import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  const isLogin = request.nextUrl.pathname === "/login";

  function redirectToLogin() {
    const target = request.nextUrl.clone();
    target.pathname = "/login";
    target.search = "";
    const redirect = NextResponse.redirect(target, 303);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    redirect.headers.set("Cache-Control", "private, no-store");
    return redirect;
  }

  if (!url || !key) return isLogin ? response : redirectToLogin();

  const supabase = createServerClient(url, key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // getUser verifies the session with Supabase Auth and refreshes expired tokens.
  const { data: { user }, error } = await supabase.auth.getUser();
  response.headers.set("Cache-Control", "private, no-store");
  if (isLogin) return response;
  if (error || !user) return redirectToLogin();

  const { data: admin, error: adminError } = await supabase.from("admin").select("role").eq("id", user.id).maybeSingle();
  if (adminError || !admin || !["ADMIN", "SUPER_ADMIN", "TEST"].includes(admin.role)) return redirectToLogin();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets/|favicon.ico).*)"],
};
