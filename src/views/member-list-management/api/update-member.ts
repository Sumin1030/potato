"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function updateMember(id: number, memberType: number) {
  if (!Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(memberType) || memberType <= 0) {
    return { error: "회원 정보가 올바르지 않습니다." };
  }

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
      .from("members")
      .update({ member_type: memberType })
      .eq("id", id)
      .select("id")
      .single();

    if (error) throw error;
    revalidatePath("/members");
    revalidatePath("/");
    return { data };
  } catch (error) {
    console.error("회원 유형 변경 실패:", error);
    return { error: "회원 유형을 변경하지 못했습니다." };
  }
}
