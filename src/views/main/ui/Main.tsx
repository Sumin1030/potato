"use client";

import { useState } from "react";

import { Button } from "@/shared/ui";

import { AttendanceSection } from "./AttendanceSection";
import { DateSelector } from "./DateSelector";
import { DiscountSection, type DiscountCategory } from "./DiscountSection";
import { MainHeader } from "./MainHeader";

const members = Array.from({ length: 10 }, (_, index) => `감자${index + 1}`);
const discountMembers = ["이감자", "김감자", "박감자", "최감자", "정감자", "홍감자"];
const discountCategories: DiscountCategory[] = [
  { id: "vest", label: "조끼" },
  { id: "ball", label: "공" },
  { id: "stadium", label: "구장 예약" },
];

const initialDiscountSelections: Record<string, Set<string>> = {
  vest: new Set(["이감자"]),
  ball: new Set(["김감자"]),
  stadium: new Set(["박감자"]),
};

export default function Main() {
  const [date, setDate] = useState(() => new Date(2026, 2, 15));
  const [selectedMembers, setSelectedMembers] = useState(() => new Set(["감자1", "감자4", "감자5", "감자9"]));
  const [discountSelections, setDiscountSelections] = useState(initialDiscountSelections);

  return (
    <main className="flex min-h-dvh w-full flex-col bg-background-page text-text-primary">
      <MainHeader />
      <div className="flex w-full flex-1 overflow-x-auto px-lg pb-xl">
        <div className="flex min-w-(--layout-content-min-width) flex-1 flex-col gap-lg">
          <DateSelector date={date} onChange={setDate} />
          <AttendanceSection members={members} selectedMembers={selectedMembers} onSelectedMembersChange={setSelectedMembers} />
          <DiscountSection categories={discountCategories} members={discountMembers} selections={discountSelections} onSelectionsChange={setDiscountSelections} />
          <Button fullWidth className="mt-auto">기록 저장</Button>
        </div>
      </div>
      <div className="flex h-[34px] shrink-0 items-center justify-center" aria-hidden="true">
        <span className="h-[5px] w-[140px] rounded-full bg-white/25" />
      </div>
    </main>
  );
}
