import { connection } from "next/server";
import { getMainData } from "../api/get-main-data";
import type { DailyDiscount } from "../lib/daily-record";
import Main from "./Main";

export default async function MainPage({ date }: { date: string }) {
  await connection();
  let members: { id: number; name: string }[] = [];
  let recordId: number | null = null;
  let attendanceRecords: string[] = [];
  let discounts: DailyDiscount[] = [];
  let loadError: string | undefined;
  try {
    const data = await getMainData(date);
    members = data.members;
    recordId = data.record?.id ?? null;
    const stored = data.record?.discounts as { discounts?: DailyDiscount[] } | null;
    discounts = stored?.discounts ?? data.discountTypes.map(type => ({ discount_type_id: type.id, name: type.name, amount: type.fee, member_ids: [] }));
    attendanceRecords = data.record?.attendance_records ?? [];
  } catch (error) {
    console.error("운동 기록 조회 실패:", error);
    loadError = "운동 기록을 불러오지 못했습니다.";
  }
  return <Main key={date} dateString={date} recordId={recordId} members={members} attendanceRecords={attendanceRecords} discounts={discounts} loadError={loadError} />;
}
