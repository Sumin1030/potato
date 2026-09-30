"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";
import { validateDailyRecord, type DailyRecordInput } from "../lib/daily-record";

export async function createDailyRecord(input: DailyRecordInput) {
  const validationError = validateDailyRecord(input);
  if (validationError) return { error: validationError };
  try {
    const supabase = await createSupabaseClient();
    const next = new Date(`${input.date}T00:00:00+09:00`); next.setDate(next.getDate() + 1);
    const existing = await supabase.from("daily_record").select("id").gte("date", `${input.date}T00:00:00+09:00`).lt("date", next.toISOString()).maybeSingle();
    if (existing.error) throw existing.error;
    if (existing.data) return { error: "이미 기록된 날짜입니다. 새로고침 후 수정해 주세요." };
    const values = { date: `${input.date}T00:00:00+09:00`, attendance_records: input.attendance_records, discounts: input.discounts };
    const result = await supabase.from("daily_record").insert(values).select("id").single();
    if (result.error) throw result.error; revalidatePath("/"); return { data: result.data };
  } catch (error) { console.error("운동 기록 저장 실패:", error); return { error: "운동 기록을 저장하지 못했습니다." }; }
}
