import "server-only";

import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function getLatestDailyRecordDate() {
  const supabase = await createSupabaseClient();
  return supabase
    .from("daily_record")
    .select("date")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle<{ date: string }>();
}
