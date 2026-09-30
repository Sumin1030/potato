"use server";

import { logServerEvent } from "@/shared/lib/server-request-log";
import { redirect } from "next/navigation";
import { createSessionClient } from "@/shared/lib/supabase-server";

export async function createSession(_previous: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  logServerEvent("login.start");
  const role = formData.get("role");
  const password = formData.get("password");
  if ((role !== "ADMIN" && role !== "SUPER_ADMIN" && role !== "TEST") || typeof password !== "string" || !password) {
    logServerEvent("login.rejected", { reason: "invalid_input" });
    return { error: "계정을 선택하고 비밀번호를 입력해 주세요." };
  }
  const email = role === "TEST"
    ? process.env.SUPABASE_TEST_EMAIL
    : role === "ADMIN" ? process.env.SUPABASE_ADMIN_EMAIL : process.env.SUPABASE_SUPER_ADMIN_EMAIL;
  if (!email) {
    logServerEvent("login.rejected", { reason: "missing_account_environment" });
    return { error: "로그인 계정이 아직 설정되지 않았습니다. 운영자에게 문의해 주세요." };
  }

  try {
    const supabase = await createSessionClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    logServerEvent("login.authentication", { success: !error && Boolean(data.user), status: error?.status, code: error?.code });
    if (error || !data.user) return { error: "계정 선택 또는 비밀번호를 확인해 주세요." };

    const { data: admin, error: adminError } = await supabase.from("admin").select("role").eq("id", data.user.id).maybeSingle();
    logServerEvent("login.authorization", { found: Boolean(admin), roleMatches: admin?.role === role, code: adminError?.code });
    if (adminError || !admin || admin.role !== role) {
      await supabase.auth.signOut({ scope: "local" });
      return { error: "관리자 권한을 확인할 수 없습니다. 계정 등록과 접근 정책을 확인해 주세요." };
    }
  } catch {
    logServerEvent("login.exception");
    return { error: "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }
  logServerEvent("login.redirect", { to: "/" });
  redirect("/");
}
