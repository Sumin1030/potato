import "server-only";

import { createClient } from "@supabase/supabase-js";

/** Server Components, Server Actions, Route Handlers에서 사용한다. */
export function createSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase 연결에 SUPABASE_URL과 SUPABASE_PUBLISHABLE_KEY가 필요합니다. 로컬에서는 .env.local, Vercel에서는 환경변수를 설정하세요.",
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
