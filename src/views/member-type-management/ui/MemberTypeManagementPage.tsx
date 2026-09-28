import { connection } from "next/server";
import { getMemberTypes } from "../api/get-member-types";
import type { MemberType } from "../lib/member-type";
import MemberTypeManagement from "./MemberTypeManagement";

export default async function MemberTypeManagementPage() {
  await connection();
  let types: MemberType[] = []; let loadError: string | undefined;
  try { const { data, error } = await getMemberTypes(); if (error) throw error; types = data.map(v => ({ id: v.id, name: v.name, fee: v.membership_fee.toLocaleString("ko-KR"), isFixedFee: v.is_fixed_fee })); }
  catch (error) { console.error("회원 유형 조회 실패:", error); loadError = "회원 유형을 불러오지 못했습니다."; }
  return <MemberTypeManagement initialTypes={types} loadError={loadError} />;
}
