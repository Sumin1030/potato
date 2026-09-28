"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function createMember(name: string, memberType: number) {
  if (!name.trim() || !Number.isSafeInteger(memberType) || memberType <= 0) return { error: "회원 이름과 유형을 확인해 주세요." };
  try {
    const { data, error } = await createSupabaseClient().from("members").insert({ name: name.trim(), member_type: memberType }).select("id, name, member_type").single();
    if (error) throw error; revalidatePath("/members"); revalidatePath("/"); return { data };
  } catch (error) { console.error("회원 생성 실패:", error); return { error: "회원을 추가하지 못했습니다." }; }
}
