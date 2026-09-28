"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";
import type { DailyRecordInput } from "../lib/daily-record";

export async function createDailyRecord(input: DailyRecordInput) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !Array.isArray(input.attendance_records) || !Array.isArray(input.discounts?.discounts)) return { error: "운동 기록 정보가 올바르지 않습니다." };
  try {
    const supabase = await createSupabaseClient();
    const next = new Date(`${input.date}T00:00:00+09:00`); next.setDate(next.getDate() + 1);
    const existing = await supabase.from("daily_record").select("id").gte("date", `${input.date}T00:00:00+09:00`).lt("date", next.toISOString()).maybeSingle();
    if (existing.error) throw existing.error;
    const values = { date: `${input.date}T00:00:00+09:00`, attendance_records: input.attendance_records, discounts: input.discounts };
    const result = existing.data
      ? await supabase.from("daily_record").update(values).eq("id", existing.data.id).select("id").single()
      : await supabase.from("daily_record").insert(values).select("id").single();
    if (result.error) throw result.error; revalidatePath("/"); return { data: result.data };
  } catch (error) { console.error("운동 기록 저장 실패:", error); return { error: "운동 기록을 저장하지 못했습니다." }; }
}
