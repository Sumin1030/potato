import { connection } from "next/server";
import { getDiscountTypes } from "../api/get-discount-types";
import type { DiscountTypeInput } from "../lib/validate-discount-type";
import DiscountTypeManagement from "./DiscountTypeManagement";

function toDiscountType(row: { id: number; name: string; fee: number }): DiscountTypeInput {
  return { id: row.id, name: row.name, amount: row.fee.toLocaleString("ko-KR", { maximumFractionDigits: 20 }) };
}

export default async function DiscountTypeManagementPage() {
  await connection();

  let types: DiscountTypeInput[] = [];
  let loadError: string | undefined;
  try {
    const { data, error } = await getDiscountTypes();
    if (error) throw error;
    types = data.map(toDiscountType);
  } catch (error) {
    console.error("할인 유형 조회 실패:", error);
    loadError = "할인 유형을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.";
  }

  return <DiscountTypeManagement initialTypes={types} loadError={loadError} />;
}
