import Image from "next/image";

import { IconButton } from "@/shared/ui";

interface DateSelectorProps {
  date: Date;
  onChange: (date: Date) => void;
}

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function moveDate(date: Date, amount: number, unit: "day" | "month") {
  const nextDate = new Date(date);

  if (unit === "day") nextDate.setDate(nextDate.getDate() + amount);
  if (unit === "month") nextDate.setMonth(nextDate.getMonth() + amount);

  return nextDate;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}

function DateIcon({ name }: { name: string }) {
  return <Image src={`/assets/${name}.svg`} alt="" width={18} height={18} />;
}

export function DateSelector({ date, onChange }: DateSelectorProps) {
  return (
    <nav className="flex w-full items-center justify-between rounded-md p-md" aria-label="운동 기록 날짜 선택">
      <div className="flex gap-xs">
        <IconButton size="sm" label="이전 달" icon={<DateIcon name="chevrons-left" />} onClick={() => onChange(moveDate(date, -1, "month"))} />
        <IconButton size="sm" label="이전 날" icon={<DateIcon name="chevron-left" />} onClick={() => onChange(moveDate(date, -1, "day"))} />
      </div>
      <strong className="text-heading whitespace-nowrap">{formatDate(date)}</strong>
      <div className="flex gap-xs">
        <IconButton size="sm" label="다음 날" icon={<DateIcon name="chevron-right" />} onClick={() => onChange(moveDate(date, 1, "day"))} />
        <IconButton size="sm" label="다음 달" icon={<DateIcon name="chevrons-right" />} onClick={() => onChange(moveDate(date, 1, "month"))} />
      </div>
    </nav>
  );
}
