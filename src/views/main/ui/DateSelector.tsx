import Image from "next/image";
import { useRef } from "react";

import { IconButton } from "@/shared/ui";

interface DateSelectorProps {
  date: Date;
  onChange: (date: Date) => void;
}

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

function moveDate(date: Date, amount: number) {
  const nextDate = new Date(date);

  nextDate.setDate(nextDate.getDate() + amount);

  return nextDate;
}

function formatDate(date: Date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}

function DateIcon({ name }: { name: string }) {
  return <Image src={`/assets/${name}.svg`} alt="" width={18} height={18} />;
}

export function DateSelector({ date, onChange }: DateSelectorProps) {
  const dateInputRef = useRef<HTMLInputElement>(null);
  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  function openCalendar() {
    const input = dateInputRef.current;
    if (!input) return;

    try {
      input.showPicker();
    } catch {
      input.focus();
      input.click();
    }
  }

  return (
    <nav className="flex w-full items-center justify-between rounded-md p-md" aria-label="운동 기록 날짜 선택">
      <div className="flex gap-xs">
        <IconButton size="sm" label="이전 주" icon={<DateIcon name="chevrons-left" />} onClick={() => onChange(moveDate(date, -7))} />
        <IconButton size="sm" label="이전 날" icon={<DateIcon name="chevron-left" />} onClick={() => onChange(moveDate(date, -1))} />
      </div>
      <div className="relative">
        <button
          type="button"
          className="cursor-pointer text-heading whitespace-nowrap rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={openCalendar}
        >
          {formatDate(date)}
        </button>
        <input
          ref={dateInputRef}
          type="date"
          aria-label="날짜 선택"
          value={value}
          className="pointer-events-none absolute size-px text-base opacity-0"
          onChange={(event) => {
            if (event.target.value) onChange(new Date(`${event.target.value}T12:00:00`));
          }}
        />
      </div>
      <div className="flex gap-xs">
        <IconButton size="sm" label="다음 날" icon={<DateIcon name="chevron-right" />} onClick={() => onChange(moveDate(date, 1))} />
        <IconButton size="sm" label="다음 주" icon={<DateIcon name="chevrons-right" />} onClick={() => onChange(moveDate(date, 7))} />
      </div>
    </nav>
  );
}
