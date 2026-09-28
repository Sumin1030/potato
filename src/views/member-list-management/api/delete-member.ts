"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function deleteMember(id: number) {
  try {
    const { error } = await createSupabaseClient().from("members").delete().eq("id", id).select("id").single();
    if (error) throw error; revalidatePath("/members"); revalidatePath("/"); return {};
  } catch (error) { console.error("회원 삭제 실패:", error); return { error: "회원을 삭제하지 못했습니다." }; }
}
