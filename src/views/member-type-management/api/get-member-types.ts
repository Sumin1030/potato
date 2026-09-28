import "server-only";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function getMemberTypes() {
  return createSupabaseClient().from("member_types").select("id, name, membership_fee, is_fixed_fee").order("id")
    .returns<{ id: number; name: string; membership_fee: number; is_fixed_fee: boolean }[]>();
}
