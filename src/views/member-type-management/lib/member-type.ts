export interface MemberType {
  id: number;
  name: string;
  fee: string;
  isFixedFee: boolean;
}

export function validateMemberType(value: MemberType, operation: "create" | "update") {
  if (!Number.isSafeInteger(value.id) || (operation === "create" ? value.id >= 0 : value.id <= 0)) return "회원 유형 정보가 올바르지 않습니다.";
  if (!value.name.trim()) return "회원 유형 이름을 입력해 주세요.";
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value.fee.trim())) return "회비는 0 이상의 숫자로 입력해 주세요.";
}
