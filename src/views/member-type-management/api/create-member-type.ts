"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";
import type { MemberType } from "../lib/member-type";

export async function createMemberType(value: MemberType) {
  try {
    const { data, error } = await createSupabaseClient().from("member_types")
      .insert({ name: value.name.trim(), membership_fee: Number(value.fee.replaceAll(",", "")), is_fixed_fee: value.isFixedFee })
      .select("id, name, membership_fee, is_fixed_fee").single();
    if (error) throw error;
    revalidatePath("/member-types");
    return { data: { id: data.id, name: data.name, fee: data.membership_fee.toLocaleString("ko-KR"), isFixedFee: data.is_fixed_fee } as MemberType };
  } catch (error) { console.error("회원 유형 생성 실패:", error); return { error: "회원 유형을 저장하지 못했습니다." }; }
}
