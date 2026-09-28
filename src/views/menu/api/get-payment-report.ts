"use server";

import { createSupabaseClient } from "@/shared/lib/supabase-server";

export interface PaymentReportMember {
  id: number;
  name: string;
  memberTypeName: string;
  membershipFee: number;
  isFixedFee: boolean;
}

export interface PaymentReportRecord {
  date: string;
  attendanceRecords: string[];
  discounts: {
    discount_type_id: number;
    name: string;
    amount: number;
    member_ids: string[];
  }[];
}

export interface PaymentReportData {
  year: number;
  month: number;
  members: PaymentReportMember[];
  records: PaymentReportRecord[];
}

export async function getPaymentReport(paymentMonth: string): Promise<{ data?: PaymentReportData; error?: string }> {
  try {
    if (!/^\d{4}-\d{2}$/.test(paymentMonth)) return { error: "회비월을 선택해 주세요." };
    const supabase = await createSupabaseClient();
    const [year, month] = paymentMonth.split("-").map(Number);
    const activityYear = month === 1 ? year - 1 : year;
    const activityMonth = month === 1 ? 12 : month - 1;
    const start = `${activityYear}-${String(activityMonth).padStart(2, "0")}-01T00:00:00+09:00`;
    const nextMonth = `${year}-${String(month).padStart(2, "0")}-01T00:00:00+09:00`;

    const [memberRows, memberTypeRows, recordRows] = await Promise.all([
      supabase.from("members").select("id, name, member_type").order("id"),
      supabase.from("member_types").select("id, name, membership_fee, is_fixed_fee").order("id"),
      supabase.from("daily_record").select("date, attendance_records, discounts").gte("date", start).lt("date", nextMonth).order("date"),
    ]);
    if (memberRows.error) throw memberRows.error;
    if (memberTypeRows.error) throw memberTypeRows.error;
    if (recordRows.error) throw recordRows.error;
    if (recordRows.data.length === 0) return { error: `${activityYear}년 ${activityMonth}월 운동 기록이 없습니다.` };

    const memberTypes = new Map(memberTypeRows.data.map((type) => [type.id, type]));
    const members = memberRows.data.flatMap((member) => {
      const type = memberTypes.get(member.member_type);
      return type ? [{
        id: member.id,
        name: member.name,
        memberTypeName: type.name,
        membershipFee: type.membership_fee,
        isFixedFee: type.is_fixed_fee,
      }] : [];
    });
    const records = recordRows.data.map((record) => {
      const stored = record.discounts as { discounts?: PaymentReportRecord["discounts"] } | null;
      return {
        date: record.date,
        attendanceRecords: record.attendance_records ?? [],
        discounts: stored?.discounts ?? [],
      };
    });

    return { data: { year, month, members, records } };
  } catch (error) {
    console.error("회비 납부 이미지 데이터 조회 실패:", error);
    return { error: "회비 납부 정보를 불러오지 못했습니다." };
  }
}
