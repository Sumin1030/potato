"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, Dialog } from "@/shared/ui";
import { createDailyRecord } from "../api/create-daily-record";
import { updateDailyRecord } from "../api/update-daily-record";
import { deleteDailyRecord } from "../api/delete-daily-record";
import type { DailyDiscount, MainMember } from "../lib/daily-record";

import { AttendanceSection } from "./AttendanceSection";
import { DateSelector } from "./DateSelector";
import { DiscountSection, type DiscountCategory } from "./DiscountSection";
import { MainHeader } from "./MainHeader";

interface MainProps { dateString: string; recordId: number | null; members: MainMember[]; attendanceRecords: string[]; discounts: DailyDiscount[]; loadError?: string }

export default function Main({ dateString, recordId: initialRecordId, members, attendanceRecords, discounts, loadError }: MainProps) {
  const router = useRouter();
  const [date] = useState(() => new Date(`${dateString}T12:00:00`));
  const [selectedMembers, setSelectedMembers] = useState(() => new Set(attendanceRecords));
  const [discountSelections, setDiscountSelections] = useState<Record<string, Set<string>>>(() => Object.fromEntries(discounts.map(v => [String(v.discount_type_id), new Set(v.member_ids)])));
  const [saving, setSaving] = useState(false);
  const [recordId, setRecordId] = useState(initialRecordId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [message, setMessage] = useState<string>();
  const discountCategories: DiscountCategory[] = discounts.map(v => ({ id: String(v.discount_type_id), label: v.name }));

  function changeDate(nextDate: Date) {
    const value = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}-${String(nextDate.getDate()).padStart(2, "0")}`;
    router.push(`/?date=${value}`);
  }

  async function saveRecord() {
    setSaving(true); setMessage(undefined);
    const input = {
      date: dateString,
      attendance_records: [...selectedMembers],
      discounts: { discounts: discounts.map(type => ({ ...type, member_ids: [...(discountSelections[String(type.discount_type_id)] ?? [])] })) },
    };
    const result = recordId === null
      ? await createDailyRecord(input)
      : await updateDailyRecord(recordId, input);
    setSaving(false);
    if (result.data) setRecordId(result.data.id);
    setMessage(result.error ?? "저장했습니다.");
  }

  async function deleteRecord() {
    if (!recordId) return;
    setDeleteDialogOpen(false); setSaving(true); setMessage(undefined);
    const result = await deleteDailyRecord(recordId);
    setSaving(false);
    if (result.error) { setMessage(result.error); return; }
    setRecordId(null);
    setSelectedMembers(new Set());
    setDiscountSelections(Object.fromEntries(discounts.map(type => [String(type.discount_type_id), new Set<string>()])));
    setMessage("삭제했습니다.");
  }

  return (
    <main className="flex min-h-dvh w-full flex-col bg-background-page text-text-primary">
      <MainHeader />
      <div className="flex min-w-0 w-full px-lg">
        <div className="flex min-w-0 w-full flex-1 flex-col gap-lg">
          <DateSelector date={date} onChange={changeDate} />
          {loadError && <p role="alert" className="text-body text-text-muted">{loadError}</p>}
          <AttendanceSection members={members} selectedMembers={selectedMembers} onSelectedMembersChange={setSelectedMembers} />
          {discountCategories.length > 0 && (
            <DiscountSection categories={discountCategories} members={members} selections={discountSelections} onSelectionsChange={setDiscountSelections} />
          )}
        </div>
      </div>
      <div className="mt-auto shrink-0 px-xl pt-xl pb-[calc(var(--spacing-lg)*2+env(safe-area-inset-bottom))]">
          {message && <p role="status" className="text-body text-text-muted">{message}</p>}
          {recordId ? (
            <div className="flex gap-sm">
              <Button fullWidth variant="secondary" disabled={saving || Boolean(loadError)} onClick={() => setDeleteDialogOpen(true)}>기록 삭제</Button>
              <Button fullWidth loading={saving} disabled={Boolean(loadError)} onClick={saveRecord}>기록 수정</Button>
            </div>
          ) : (
            <Button fullWidth loading={saving} disabled={Boolean(loadError)} onClick={saveRecord}>기록하기</Button>
          )}
      </div>
      <Dialog
        open={deleteDialogOpen}
        title="운동 기록을 삭제할까요?"
        description="선택한 날짜의 출석 및 할인 기록이 삭제됩니다."
        confirmLabel="삭제"
        confirmVariant="danger"
        onOpenChange={setDeleteDialogOpen}
        onConfirm={deleteRecord}
      />
    </main>
  );
}
