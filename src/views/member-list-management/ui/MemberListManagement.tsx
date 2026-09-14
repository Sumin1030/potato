"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, IconButton } from "@/shared/ui";

interface MemberGroup {
  id: string;
  label: string;
  members: string[];
}

interface MemberListManagementProps {
  onBack?: () => void;
  onAddMember?: () => void;
}

const initialGroups: MemberGroup[] = [
  { id: "regular", label: "정회원", members: ["감자1", "감자2", "감자3"] },
  { id: "general", label: "일반회원", members: ["감자4", "감자5", "감자6", "감자7"] },
  { id: "unassigned", label: "미지정", members: ["감자8", "감자9", "감자10"] },
];

export default function MemberListManagement({ onAddMember, onBack }: MemberListManagementProps) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);

  function removeMember(groupId: string, member: string) {
    setGroups((current) => current.map((group) => group.id === groupId
      ? { ...group, members: group.members.filter((name) => name !== member) }
      : group));
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
        <button type="button" className="cursor-pointer text-body font-semibold text-primary" onClick={onAddMember}>
          회원 추가
        </button>
      </header>

      <div className="flex flex-col gap-md px-lg pt-md">
        <Alert icon={<Image src="/assets/alert-circle.svg" alt="" width={16} height={16} />}>
          회원 유형, 회비관련 수정사항은 다음 운동기록부터 자동 적용됩니다.
        </Alert>

        {groups.map((group) => (
          <section key={group.id} className="flex flex-col gap-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-body font-bold text-primary">{group.label}</h2>
              <span className="text-caption text-text-muted">{group.members.length}명</span>
            </div>
            <div className="flex flex-col gap-xs rounded-md border border-border bg-background-interactive p-xs">
              {group.members.map((member) => (
                <div key={member} className="flex h-[37px] items-center justify-between rounded-sm border border-border bg-background-component px-md">
                  <span className="flex items-center gap-md text-body font-medium">
                    <Image src="/assets/grip-horizontal.svg" alt="" width={16} height={16} />
                    {member}
                  </span>
                  <button type="button" className="cursor-pointer" aria-label={`${member} 삭제`} onClick={() => removeMember(group.id, member)}>
                    <Image src="/assets/x.svg" alt="" width={16} height={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-auto p-xl">
        <Button fullWidth>저장 완료</Button>
      </div>
    </main>
  );
}
