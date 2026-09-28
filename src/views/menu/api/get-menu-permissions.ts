import "server-only";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function getMenuPermissions() {
  try {
    await createSupabaseClient("SUPER_ADMIN");
    return true;
  } catch {
    return false;
  }
}
