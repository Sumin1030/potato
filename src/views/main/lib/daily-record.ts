export interface MainMember { id: number; name: string }
export interface DailyDiscount { discount_type_id: number; name: string; amount: number; member_ids: string[] }
export interface DailyRecordInput { date: string; attendance_records: string[]; discounts: { discounts: DailyDiscount[] } }

export function validateDailyRecord(input: DailyRecordInput) {
  if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
      !Array.isArray(input.attendance_records) || !Array.isArray(input.discounts?.discounts)) {
    return "운동 기록 정보가 올바르지 않습니다.";
  }
}
