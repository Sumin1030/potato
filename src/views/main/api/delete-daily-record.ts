"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function deleteDailyRecord(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "운동 기록 정보가 올바르지 않습니다." };

  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase
      .from("daily_record")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error) throw error;
    revalidatePath("/");
    return {};
  } catch (error) {
    console.error("운동 기록 삭제 실패:", error);
    return { error: "운동 기록을 삭제하지 못했습니다." };
  }
}
