import "server-only";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function getMainData(date: string) {
  const supabase = createSupabaseClient();
  const next = new Date(`${date}T00:00:00+09:00`); next.setDate(next.getDate() + 1);
  const [members, discountTypes, record] = await Promise.all([
    supabase.from("members").select("id, name").order("id"),
    supabase.from("membership_discount").select("id, name, fee").eq("is_active", true).order("id"),
    supabase.from("daily_record").select("id, date, attendance_records, discounts")
      .gte("date", `${date}T00:00:00+09:00`).lt("date", next.toISOString()).maybeSingle(),
  ]);
  if (members.error) throw members.error; if (discountTypes.error) throw discountTypes.error; if (record.error) throw record.error;
  return { members: members.data, discountTypes: discountTypes.data, record: record.data };
}
