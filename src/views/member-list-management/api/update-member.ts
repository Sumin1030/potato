"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function updateMember(id: number, memberType: number, name?: string) {
  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(memberType) || memberType <= 0) {
    return { error: "회원 정보가 올바르지 않습니다." };
  }

  if (name !== undefined && (typeof name !== "string" || !name.trim())) return { error: "회원 이름을 입력해 주세요." };

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("members")
      .update({ member_type: memberType, ...(name !== undefined ? { name: name.trim() } : {}) })
      .eq("id", id)
      .select("id")
      .single();

    if (error) throw error;
    revalidatePath("/members");
    revalidatePath("/");
    return { data };
  } catch (error) {
    console.error("회원 수정 실패:", error);
    return { error: "회원 정보를 수정하지 못했습니다." };
  }
}
