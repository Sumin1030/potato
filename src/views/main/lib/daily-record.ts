export interface MainMember { id: number; name: string }
export interface DailyDiscount { discount_type_id: number; name: string; amount: number; member_ids: string[] }
export interface DailyRecordInput { date: string; attendance_records: string[]; discounts: { discounts: DailyDiscount[] } }
