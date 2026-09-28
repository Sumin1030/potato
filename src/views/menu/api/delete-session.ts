"use server";

import { redirect } from "next/navigation";
import { createSessionClient } from "@/shared/lib/supabase-server";

export async function deleteSession(): Promise<{ error: string }> {
  try {
    const supabase = await createSessionClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: "로그아웃에 실패했습니다. 다시 시도해 주세요." };
  } catch {
    return { error: "로그아웃에 실패했습니다. 다시 시도해 주세요." };
  }
  redirect("/login");
}
