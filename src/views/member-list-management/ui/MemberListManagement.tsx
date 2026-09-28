"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Alert, Button, IconButton, TextField } from "@/shared/ui";
import { createMember } from "../api/create-member";
import { deleteMember } from "../api/delete-member";
import { updateMember } from "../api/update-member";

export interface MemberGroup {
  id: string;
  label: string;
  members: { id: number; name: string }[];
}

interface MemberListManagementProps {
  initialGroups: MemberGroup[];
  loadError?: string;
  onBack?: () => void;
  onAddMember?: () => void;
}

export default function MemberListManagement({ initialGroups, loadError, onAddMember, onBack }: MemberListManagementProps) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [savedMemberTypes, setSavedMemberTypes] = useState(() => Object.fromEntries(
    initialGroups.flatMap((group) => group.members.map((member) => [member.id, group.id])),
  ));
  const nextTemporaryId = useRef(-1);
  const [draggedMemberId, setDraggedMemberId] = useState<number>();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState<string>();

  async function removeMember(groupId: string, memberId: number) {
    if (memberId < 0) {
      setGroups((current) => current.map((group) => group.id === groupId
        ? { ...group, members: group.members.filter((member) => member.id !== memberId) }
        : group));
      return;
    }
    const result = await deleteMember(memberId); if (result.error) { setMessage(result.error); return; }
    setGroups((current) => current.map((group) => group.id === groupId
      ? { ...group, members: group.members.filter((member) => member.id !== memberId) }
      : group));
  }

  function addMember() {
    if (onAddMember) { onAddMember(); return; }
    const defaultGroup = groups.reduce<MemberGroup | undefined>((lowest, group) => (
      !lowest || Number(group.id) < Number(lowest.id) ? group : lowest
    ), undefined);
    if (!defaultGroup) { setMessage("회원 유형을 먼저 추가해 주세요."); return; }
    const member = { id: nextTemporaryId.current--, name: "" };
    setGroups(current => current.map(group => group.id === defaultGroup.id
      ? { ...group, members: [...group.members, member] }
      : group));
    setDirty(true); setMessage(undefined);
  }

  function updateMemberName(memberId: number, name: string) {
    setGroups(current => current.map(group => ({
      ...group,
      members: group.members.map(member => member.id === memberId ? { ...member, name } : member),
    })));
    setDirty(true);
  }

  function moveMember(targetGroupId: string) {
    if (draggedMemberId === undefined) return;
    let draggedMember: { id: number; name: string } | undefined;
    for (const group of groups) draggedMember ??= group.members.find(member => member.id === draggedMemberId);
    if (!draggedMember) return;
    setGroups(current => current.map(group => {
      const members = group.members.filter(member => member.id !== draggedMemberId);
      return group.id === targetGroupId ? { ...group, members: [...members, draggedMember] } : { ...group, members };
    }));
    setDraggedMemberId(undefined); setDirty(true); setMessage(undefined);
  }

  function finishTouchDrag(x: number, y: number) {
    const target = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-member-group]");
    if (target?.dataset.memberGroup) moveMember(target.dataset.memberGroup);
    else setDraggedMemberId(undefined);
  }

  async function saveMembers() {
    const entries = groups.flatMap(group => group.members.map(member => ({ groupId: group.id, member })));
    if (entries.some(({ member }) => !member.name.trim())) { setMessage("회원 이름을 입력해 주세요."); return; }
    setSaving(true); setMessage(undefined);
    const nextSaved = { ...savedMemberTypes };
    let nextGroups = [...groups];
    for (const { groupId, member } of entries) {
      if (member.id < 0) {
        const result = await createMember(member.name, Number(groupId));
        if (!result.data) { setMessage(result.error); setSaving(false); return; }
        nextGroups = nextGroups.map(group => ({ ...group, members: group.members.map(item => item.id === member.id ? result.data : item) }));
        delete nextSaved[member.id]; nextSaved[result.data.id] = groupId;
      } else if (nextSaved[member.id] !== groupId) {
        const result = await updateMember(member.id, Number(groupId));
        if (result.error) { setMessage(result.error); setSaving(false); return; }
        nextSaved[member.id] = groupId;
      }
    }
    setGroups(nextGroups); setSavedMemberTypes(nextSaved); setDirty(false); setSaving(false); setMessage("저장했습니다.");
  }

  return (
    <main className="flex min-h-dvh min-w-(--layout-content-min-width) flex-col bg-background-page text-text-primary">
      <header className="flex h-14 items-center justify-between px-xl">
        <div className="flex items-center gap-md">
          <IconButton
            label="뒤로 가기"
            size="sm"
            onClick={() => { if (onBack) onBack(); else router.back(); }}
            icon={<Image src="/assets/page-chevron-left.svg" alt="" width={24} height={24} />}
          />
          <h1 className="text-heading">회원 목록 관리</h1>
        </div>
        <button type="button" disabled={saving || Boolean(loadError)} className="cursor-pointer text-body font-semibold text-primary disabled:opacity-50" onClick={addMember}>
          회원 추가
        </button>
      </header>

      <div className="flex flex-col gap-md px-lg pt-md">
        {loadError && <p role="alert" className="text-body text-text-muted">{loadError}</p>}
        <Alert icon={<Image src="/assets/alert-circle.svg" alt="" width={16} height={16} />}>
          회원 유형, 회비관련 수정사항은 다음 운동기록부터 자동 적용됩니다.
        </Alert>

        {groups.map((group) => (
          <section
            key={group.id}
            data-member-group={group.id}
            className="flex flex-col gap-sm"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => moveMember(group.id)}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-body font-bold text-primary">{group.label}</h2>
              <span className="text-caption text-text-muted">{group.members.length}명</span>
            </div>
            <div className="flex flex-col gap-xs rounded-md border border-border bg-background-interactive p-xs">
              {group.members.map((member) => (
                <div
                  key={member.id}
                  draggable
                  onDragStart={() => setDraggedMemberId(member.id)}
                  onDragEnd={() => setDraggedMemberId(undefined)}
                  onTouchStart={() => setDraggedMemberId(member.id)}
                  onTouchEnd={(event) => {
                    const touch = event.changedTouches[0];
                    if (touch) finishTouchDrag(touch.clientX, touch.clientY);
                  }}
                  className="flex min-h-[45px] items-center justify-between gap-md rounded-sm border border-border bg-background-component px-md"
                >
                  <span className="flex min-w-0 flex-1 items-center gap-md text-body font-medium">
                    <Image src="/assets/grip-horizontal.svg" alt="" width={16} height={16} />
                    {member.id < 0 ? (
                      <TextField
                        autoFocus
                        aria-label="회원 이름"
                        placeholder="회원 이름"
                        value={member.name}
                        onChange={(event) => updateMemberName(member.id, event.target.value)}
                      />
                    ) : member.name}
                  </span>
                  <button type="button" className="cursor-pointer" aria-label={`${member.name} 삭제`} onClick={() => removeMember(group.id, member.id)}>
                    <Image src="/assets/x.svg" alt="" width={16} height={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-auto p-xl">
        {message && <p role="alert" className="mb-sm text-body text-text-muted">{message}</p>}
        <Button fullWidth loading={saving} disabled={!dirty || Boolean(loadError)} onClick={saveMembers}>저장하기</Button>
      </div>
    </main>
  );
}
