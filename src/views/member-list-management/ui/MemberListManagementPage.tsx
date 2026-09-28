import { connection } from "next/server";
import { getMembers } from "../api/get-members";
import MemberListManagement, { type MemberGroup } from "./MemberListManagement";

export default async function MemberListManagementPage() {
  await connection(); let groups: MemberGroup[] = []; let loadError: string | undefined;
  try {
    const { members, memberTypes } = await getMembers(); if (members.error) throw members.error; if (memberTypes.error) throw memberTypes.error;
    const map = new Map<string, MemberGroup>(memberTypes.data.map(type => [String(type.id), { id: String(type.id), label: type.name, members: [] }]));
    for (const row of members.data) {
      const key = String(row.member_type);
      const group: MemberGroup = map.get(key) ?? { id: key, label: "미지정", members: [] };
      group.members.push({ id: row.id, name: row.name }); map.set(key, group);
    }
    groups = [...map.values()];
  } catch (error) { console.error("회원 조회 실패:", error); loadError = "회원 목록을 불러오지 못했습니다."; }
  return <MemberListManagement initialGroups={groups} loadError={loadError} />;
}
