import Image from "next/image";

import { Checkbox } from "@/shared/ui";

interface AttendanceSectionProps {
  members: { id: number; name: string }[];
  selectedMembers: Set<string>;
  onSelectedMembersChange: (members: Set<string>) => void;
}

const checkIcon = <Image src="/assets/check.svg" alt="" width={14} height={14} />;

export function AttendanceSection({ members, onSelectedMembersChange, selectedMembers }: AttendanceSectionProps) {
  const allSelected = members.length > 0 && members.every((member) => selectedMembers.has(String(member.id)));

  function toggleMember(member: string, checked: boolean) {
    const nextMembers = new Set(selectedMembers);

    if (checked) nextMembers.add(member);
    else nextMembers.delete(member);

    onSelectedMembersChange(nextMembers);
  }

  return (
    <section className="rounded-md border border-border bg-background-section p-lg">
      <div className="mb-md flex items-center justify-between">
        <h2 className="text-heading">출석 체크</h2>
        <button
          type="button"
          className="cursor-pointer rounded-sm border border-primary/40 bg-primary/10 px-sm py-xs text-caption font-semibold text-primary"
          onClick={() => onSelectedMembersChange(allSelected ? new Set() : new Set(members.map(member => String(member.id))))}
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-md gap-y-md">
        {members.map((member) => {
          const memberId = String(member.id);
          const checked = selectedMembers.has(memberId);

          return (
            <Checkbox
              key={member.id}
              checked={checked}
              checkedIcon={checkIcon}
              label={member.name}
              className={checked ? "text-text-primary" : "text-text-muted"}
              onCheckedChange={(nextChecked) => toggleMember(memberId, nextChecked)}
            />
          );
        })}
      </div>
    </section>
  );
}
