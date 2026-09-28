"use server";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function updatePassword(formData: FormData): Promise<{ error?: string; success?: string }> {
  try {
    await createSupabaseClient("SUPER_ADMIN");
  } catch {
    return { error: "대표운영진으로 로그인해야 비밀번호를 변경할 수 있습니다." };
  }

  const role = formData.get("role");
  const currentPassword = formData.get("currentPassword");
  const password = formData.get("password");
  const confirmation = formData.get("confirmation");
  if ((role !== "ADMIN" && role !== "SUPER_ADMIN") || typeof currentPassword !== "string" || !currentPassword || typeof password !== "string" || !password) {
    return { error: "계정을 선택하고 현재 비밀번호와 새 비밀번호를 입력해 주세요." };
  }
  if (password !== confirmation) return { error: "새 비밀번호가 일치하지 않습니다." };
  if (password === currentPassword) return { error: "현재 비밀번호와 다른 비밀번호를 입력해 주세요." };

  const email = role === "ADMIN" ? process.env.SUPABASE_ADMIN_EMAIL : process.env.SUPABASE_SUPER_ADMIN_EMAIL;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!email || !url || !key) return { error: "변경할 계정이 설정되지 않았습니다." };

  // 대상 계정을 검증하는 임시 세션. 요청자의 로그인 쿠키와 분리한다.
  const target = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  let signedIn = false;
  try {
    const { data, error } = await target.auth.signInWithPassword({ email, password: currentPassword });
    if (error || !data.user) return { error: "선택한 계정의 현재 비밀번호를 확인해 주세요." };
    signedIn = true;

    const { data: admin, error: roleError } = await target.from("admin").select("role").eq("id", data.user.id).maybeSingle();
    if (roleError || admin?.role !== role) return { error: "선택한 계정의 관리자 권한을 확인할 수 없습니다." };

    const { error: updateError } = await target.auth.updateUser({ password, current_password: currentPassword });
    if (updateError) {
      if (updateError.code === "weak_password") return { error: "새 비밀번호가 보안 기준에 맞지 않습니다. 길이와 문자 조합을 확인해 주세요." };
      return { error: "비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요." };
    }
    return { success: `${role === "ADMIN" ? "운영진" : "대표운영진"} 비밀번호를 변경했습니다.` };
  } catch {
    return { error: "비밀번호를 변경하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  } finally {
    if (signedIn) {
      // 정리 실패가 이미 완료된 비밀번호 변경 결과를 덮어쓰지 않도록 한다.
      await target.auth.signOut({ scope: "local" }).catch(() => undefined);
    }
  }
}
