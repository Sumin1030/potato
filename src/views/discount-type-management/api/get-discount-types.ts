import "server-only";

import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function getDiscountTypes() {
  const supabase = await createSupabaseClient();
  return supabase.from("membership_discount")
    .select("id, name, fee, is_active")
    .eq("is_active", true)
    .order("id", { ascending: true })
    .returns<{ id: number; name: string; fee: number; is_active: boolean }[]>();
}
