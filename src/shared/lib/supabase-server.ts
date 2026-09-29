import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { isLoginExpired, SESSION_MAX_AGE_SECONDS } from "./session-lifetime";

/** 로그인/로그아웃과 서버 페이지에서 사용하는 요청별 쿠키 클라이언트. */
export async function createSessionClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase 연결 환경변수를 설정해 주세요.");

  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookieOptions: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_MAX_AGE_SECONDS },
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

// React 서버 렌더링 요청 안에서만 인증 결과를 재사용한다.
// Server Action 등 캐시 문맥 밖에서는 매번 검증한다. 사용자 간 공유하지 않는다.
const getRequestAdmin = cache(async () => {
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (error || !userId) throw new Error("로그인이 필요합니다.");
  if (isLoginExpired(data.claims)) throw new Error("로그인 시간이 만료되었습니다. 다시 로그인해 주세요.");

  const { data: admin, error: adminError } = await supabase.from("admin").select("role").eq("id", userId).maybeSingle();
  if (adminError || !admin || !["ADMIN", "SUPER_ADMIN", "TEST"].includes(admin.role)) {
    throw new Error("관리자 접근 권한이 없습니다.");
  }
  return { role: admin.role };
});

/** 각 API는 쿠키 기반 클라이언트를 새로 생성하고, 권한 확인만 요청 내 재사용한다. */
export async function createSupabaseClient(requiredRole?: "SUPER_ADMIN") {
  const admin = await getRequestAdmin();
  if (requiredRole && admin.role !== requiredRole) {
    throw new Error("대표운영진만 접근할 수 있습니다.");
  }
  return createSessionClient();
}
