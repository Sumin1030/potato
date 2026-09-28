"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function deleteMemberType(id: number) {
  try {
    const { error } = await createSupabaseClient().from("member_types").delete().eq("id", id).select("id").single();
    if (error) throw error;
    revalidatePath("/member-types"); revalidatePath("/members");
    return {};
  } catch (error) { console.error("회원 유형 삭제 실패:", error); return { error: "사용 중인 회원 유형은 삭제할 수 없습니다." }; }
}
