"use server";

import { createSupabaseClient } from "@/shared/lib/supabase-server";

export async function getDefaultPaymentMonth() {
  try {
    const { data, error } = await createSupabaseClient()
      .from("daily_record")
      .select("date")
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return {};

    const parts = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "numeric",
    }).formatToParts(new Date(data.date));
    const recordYear = Number(parts.find((part) => part.type === "year")?.value);
    const recordMonth = Number(parts.find((part) => part.type === "month")?.value);
    const year = recordMonth === 12 ? recordYear + 1 : recordYear;
    const month = recordMonth === 12 ? 1 : recordMonth + 1;

    return { data: `${year}-${String(month).padStart(2, "0")}` };
  } catch (error) {
    console.error("기본 회비월 조회 실패:", error);
    return { error: "기본 회비월을 불러오지 못했습니다." };
  }
}
