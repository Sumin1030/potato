import "server-only";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function getMembers() {
  const supabase = createSupabaseClient();
  const [members, memberTypes] = await Promise.all([
    supabase.from("members").select("id, name, member_type").order("id"),
    supabase.from("member_types").select("id, name").order("id"),
  ]);
  return { members, memberTypes };
}
