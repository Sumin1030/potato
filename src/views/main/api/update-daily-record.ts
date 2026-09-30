"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";
import { validateDailyRecord, type DailyRecordInput } from "../lib/daily-record";

export async function updateDailyRecord(id: number, input: DailyRecordInput) {
  const validationError = validateDailyRecord(input);
  if (validationError) return { error: validationError };
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "운동 기록 ID가 올바르지 않습니다." };

  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.from("daily_record")
      .update({ attendance_records: input.attendance_records, discounts: input.discounts })
      .eq("id", id)
      .select("id")
      .single();
    if (error) throw error;
    revalidatePath("/");
    return { data };
  } catch (error) {
    console.error("운동 기록 수정 실패:", error);
    return { error: "운동 기록을 수정하지 못했습니다." };
  }
}
