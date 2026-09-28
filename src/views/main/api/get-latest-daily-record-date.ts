import "server-only";

import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function getLatestDailyRecordDate() {
  return createSupabaseClient()
    .from("daily_record")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle<{ date: string }>();
}
