import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** 로그인/로그아웃과 서버 페이지에서 사용하는 요청별 쿠키 클라이언트. */
export async function createSessionClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase 연결 환경변수를 설정해 주세요.");

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components에서는 쓰기가 불가능하다. Proxy에서 세션을 갱신한다.
        }
      },
    },
  });
}

/** 각 데이터 API에서 호출: 사용자 인증과 관리자 등록 확인 후 쿼리를 실행한다. */
export async function createSupabaseClient(requiredRole?: "SUPER_ADMIN") {
  const supabase = await createSessionClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("로그인이 필요합니다.");

  const { data: admin, error: adminError } = await supabase.from("admin").select("role").eq("id", user.id).maybeSingle();
  if (adminError || !admin || !["ADMIN", "SUPER_ADMIN", "TEST"].includes(admin.role)) {
    throw new Error("관리자 접근 권한이 없습니다.");
  }
  if (requiredRole && admin.role !== requiredRole) {
    throw new Error("대표운영진만 접근할 수 있습니다.");
  }
  return supabase;
}
