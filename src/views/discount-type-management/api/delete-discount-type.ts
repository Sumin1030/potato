"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function deleteDiscountType(id: number): Promise<{ error?: string; requiresReload?: boolean }> {
  if (!Number.isSafeInteger(id) || id <= 0) return { error: "할인 유형 정보가 올바르지 않습니다." };
  try {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.from("membership_discount")
    .update({ is_active: false }).eq("id", id).select("id").single<{ id: number }>();
    if (error) throw error;
    revalidatePath("/discount-types");
    return {};
  } catch (error) {
    console.error("할인 유형 삭제 실패:", error);
    return { error: "삭제 중 오류가 발생했습니다. 새로고침하여 확인해 주세요.", requiresReload: true };
  }
}
