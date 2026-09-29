import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isLoginExpired, SESSION_MAX_AGE_SECONDS } from "@/shared/lib/session-lifetime";

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
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE_SECONDS },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // 비대칭 서명 키에서는 캐시된 공개키로 검증하며, 만료 세션은 갱신한다.
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  response.headers.set("Cache-Control", "private, no-store");
  if (isLogin) return response;
  if (error || !userId) return redirectToLogin();
  if (isLoginExpired(data.claims)) {
    await supabase.auth.signOut({ scope: "local" });
    return redirectToLogin();
  }

  const { data: admin, error: adminError } = await supabase.from("admin").select("role").eq("id", userId).maybeSingle();
  if (adminError || !admin || !["ADMIN", "SUPER_ADMIN", "TEST"].includes(admin.role)) return redirectToLogin();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets/|favicon.ico).*)"],
};
