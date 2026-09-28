export interface DiscountTypeInput {
  id: number;
  name: string;
  amount: string;
}

export type DiscountTypeResult =
  | { data: DiscountTypeInput; error?: undefined; requiresReload?: false }
  | { data?: undefined; error: string; requiresReload?: boolean };

export function validateDiscountType(input: DiscountTypeInput, operation: "create" | "update") {
  if (!input || !Number.isSafeInteger(input.id)
    || (operation === "create" ? input.id >= 0 : input.id <= 0)) {
    return "할인 유형 정보가 올바르지 않습니다.";
  }
  if (typeof input.name !== "string" || !input.name.trim()) return "할인 유형 이름을 입력해 주세요.";
  if (typeof input.amount !== "string"
    || !/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(input.amount.trim())
    || !Number.isFinite(Number(input.amount.replaceAll(",", "")))
    || Number(input.amount.replaceAll(",", "")) > Number.MAX_SAFE_INTEGER) {
    return "할인 금액은 0 이상의 유효한 숫자로 입력해 주세요.";
  }
}
