"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";
import type { DiscountTypeInput, DiscountTypeResult } from "../lib/validate-discount-type";

export async function createDiscountType(input: DiscountTypeInput): Promise<DiscountTypeResult> {
  try {
    const supabase = createSupabaseClient();
    const fields = { name: input.name.trim(), fee: Number(input.amount.replaceAll(",", "")) };
    const { data, error } = await supabase.from("membership_discount")
    .insert({ ...fields, is_active: true })
    .select("id, name, fee").single<{ id: number; name: string; fee: number }>();
    if (error) throw error;
    revalidatePath("/discount-types");
    return { data: { id: data.id, name: data.name, amount: data.fee.toLocaleString("ko-KR", { maximumFractionDigits: 20 }) } };
  } catch (error) {
    console.error("할인 유형 create 실패:", error);
    return { error: "저장 중 오류가 발생했습니다. 일부 변경은 반영되었을 수 있으니 새로고침하여 확인해 주세요.", requiresReload: true };
  }
}
