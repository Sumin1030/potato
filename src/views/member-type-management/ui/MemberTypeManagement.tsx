"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { Alert, Button, Checkbox, Dialog, IconButton, TextField } from "@/shared/ui";
import { createMemberType } from "../api/create-member-type";
import { deleteMemberType } from "../api/delete-member-type";
import { updateMemberType } from "../api/update-member-type";
import { validateMemberType, type MemberType } from "../lib/member-type";

interface MemberTypeManagementProps {
  initialTypes: MemberType[];
  loadError?: string;
  onBack?: () => void;
}

export default function MemberTypeManagement({ initialTypes, loadError, onBack }: MemberTypeManagementProps) {
  const router = useRouter();
  const [types, setTypes] = useState(initialTypes);
  const [savedTypes, setSavedTypes] = useState(initialTypes);
  const nextId = useRef(-1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [dirty, setDirty] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  function updateType(id: number, key: "name" | "fee", value: string) {
    setTypes((current) => current.map((type) => type.id === id ? { ...type, [key]: value } : type));
    setDirty(true);
  }

  function updateDiscountAvailability(id: number, appliesDiscount: boolean) {
    setTypes((current) => current.map((type) => type.id === id ? { ...type, isFixedFee: !appliesDiscount } : type));
    setDirty(true);
  }

  async function saveTypes() {
    const changes = types.map(type => ({ type, operation: savedTypes.some(saved => saved.id === type.id) ? "update" as const : "create" as const }))
      .filter(({ type, operation }) => operation === "create" || JSON.stringify(type) !== JSON.stringify(savedTypes.find(saved => saved.id === type.id)));
    for (const change of changes) { const error = validateMemberType(change.type, change.operation); if (error) { setMessage(error); return; } }
    setSaving(true); setMessage(undefined);
    let nextTypes = [...types]; let nextSaved = [...savedTypes];
    for (const change of changes) {
      const result = change.operation === "create" ? await createMemberType(change.type) : await updateMemberType(change.type);
      if (!result.data) { setMessage(result.error); setSaving(false); return; }
      nextTypes = nextTypes.map(v => v.id === change.type.id ? result.data : v);
      nextSaved = [...nextSaved.filter(v => v.id !== change.type.id), result.data];
    }
    setTypes(nextTypes); setSavedTypes(nextSaved); setDirty(false); setSaving(false); setMessage("저장했습니다.");
  }

  async function removeType(type: MemberType) {
    if (type.id < 0) { setTypes(current => current.filter(v => v.id !== type.id)); return; }
    setSaving(true); const result = await deleteMemberType(type.id); setSaving(false);
    if (result.error) { setMessage(result.error); return; }
    setTypes(current => current.filter(v => v.id !== type.id)); setSavedTypes(current => current.filter(v => v.id !== type.id)); setMessage("삭제했습니다.");
  }

  function requestBack() {
    if (dirty) setExitDialogOpen(true);
    else goBack();
  }

  function goBack() {
    if (onBack) onBack();
    else router.back();
  }

  return (
    <main className="flex min-h-dvh min-w-0 w-full flex-col bg-background-page text-text-primary">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 bg-background-page items-center gap-md px-xl">
        <IconButton
          label="뒤로 가기"
          size="sm"
          onClick={requestBack}
          icon={<Image src="/assets/page-chevron-left.svg" alt="" width={24} height={24} />}
        />
        <h1 className="text-heading">회원 유형 관리</h1>
      </header>

      <fieldset disabled={saving || Boolean(loadError)} className="flex min-w-0 w-full flex-col gap-md px-lg pt-md">
        <Alert className="min-w-0 whitespace-normal [overflow-wrap:anywhere]" icon={<Image src="/assets/alert-circle.svg" alt="" width={16} height={16} />}>
          회원 유형, 회비관련 수정사항은 다음 운동기록부터 자동 적용됩니다.
        </Alert>

        <div className="flex flex-col gap-sm">
          {loadError && <p role="alert" className="text-body text-text-muted">{loadError}</p>}
          {types.map((type) => (
            <div key={type.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] items-center gap-sm">
              <div className="min-w-0 flex-1">
                <TextField
                  aria-label="회원 유형 이름"
                  value={type.name}
                  onChange={(event) => updateType(type.id, "name", event.target.value)}
                />
              </div>
              <div className="min-w-0">
                <TextField
                  aria-label="월 회비"
                  suffix="원"
                  inputMode="numeric"
                  value={type.fee}
                  onChange={(event) => updateType(type.id, "fee", event.target.value)}
                />
              </div>
              <Checkbox
                className="shrink-0 whitespace-nowrap"
                label={<span className="text-caption">할인 적용</span>}
                checked={!type.isFixedFee}
                onCheckedChange={(checked) => updateDiscountAvailability(type.id, checked)}
              />
              <IconButton
                label={`${type.name} 삭제`}
                variant="danger"
                onClick={() => removeType(type)}
                icon={<Image src="/assets/trash.svg" alt="" width={18} height={18} />}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="flex cursor-pointer items-center justify-center gap-sm rounded-sm border border-dashed border-border p-md text-body font-semibold text-text-muted"
          onClick={() => { setTypes((current) => [...current, { id: nextId.current--, name: "", fee: "", isFixedFee: false }]); setDirty(true); }}
        >
          <Image src="/assets/plus-circle.svg" alt="" width={16} height={16} />
          유형 추가
        </button>
      </fieldset>

      <div className="mt-auto shrink-0 px-xl pt-xl pb-[calc(var(--spacing-lg)*2+env(safe-area-inset-bottom))]">
        {message && <p role="status" className="mb-sm text-body text-text-muted">{message}</p>}
        <Button fullWidth loading={saving} disabled={!dirty || Boolean(loadError)} onClick={saveTypes}>저장하기</Button>
      </div>

      <Dialog
        open={exitDialogOpen}
        title="변경사항을 저장하지 않을까요?"
        description="이 페이지에서 수정한 내용이 사라집니다."
        confirmLabel="나가기"
        confirmVariant="danger"
        onOpenChange={setExitDialogOpen}
        onConfirm={() => { setExitDialogOpen(false); goBack(); }}
      />
    </main>
  );
}
