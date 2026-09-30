"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { createDiscountType } from "../api/create-discount-type";
import { updateDiscountType } from "../api/update-discount-type";
import { deleteDiscountType } from "../api/delete-discount-type";
import { Alert, Button, Dialog, IconButton, TextField } from "@/shared/ui";
import { validateDiscountType } from "../lib/validate-discount-type";

interface DiscountType {
  id: number;
  name: string;
  amount: string;
}

interface DiscountTypeManagementProps {
  initialTypes: DiscountType[];
  loadError?: string;
  onBack?: () => void;
}

export default function DiscountTypeManagement({ initialTypes, loadError, onBack }: DiscountTypeManagementProps) {
  const router = useRouter();
  const [types, setTypes] = useState(initialTypes);
  const [savedTypes, setSavedTypes] = useState(initialTypes);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const nextTemporaryId = useRef(-1);
  const [saveError, setSaveError] = useState<string>();
  const [saveMessage, setSaveMessage] = useState<string>();
  const [requiresReload, setRequiresReload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiscountType | null>(null);
  const [dirty, setDirty] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const hasUnsavedChanges = types.some(type => {
    const saved = savedTypes.find(item => item.id === type.id);
    return !saved || saved.name !== type.name || saved.amount !== type.amount;
  });

  function goBack() {
    if (onBack) onBack();
    else router.back();
  }

  function requestBack() {
    if (hasUnsavedChanges || requiresReload) setExitDialogOpen(true);
    else goBack();
  }

  function updateType(id: number, key: "name" | "amount", value: string) {
    setTypes((current) => current.map((type) => type.id === id ? { ...type, [key]: value } : type));
    setDirty(true);
    setSaveMessage(undefined);
  }

  async function deleteType() {
    if (!deleteTarget || savingRef.current || requiresReload) return;
    const targetId = deleteTarget.id;
    setDeleteTarget(null);
    setSaveError(undefined);
    setSaveMessage(undefined);

    function removeFromList() {
      const remainingTypes = types.filter((type) => type.id !== targetId);
      const remainingSaved = savedTypes.filter((type) => type.id !== targetId);
      setTypes(remainingTypes);
      setSavedTypes(remainingSaved);
      setDirty(remainingTypes.some((type) => {
        const saved = remainingSaved.find((item) => item.id === type.id);
        return !saved || saved.name !== type.name || saved.amount !== type.amount;
      }));
    }

    // 저장하지 않은 새 항목은 DB에 존재하지 않는다.
    if (targetId < 0) {
      removeFromList();
      return;
    }

    savingRef.current = true;
    setSaving(true);
    try {
      const result = await deleteDiscountType(targetId);
      if (result.error) {
        setSaveError(result.error);
        if ("requiresReload" in result && result.requiresReload) setRequiresReload(true);
        return;
      }
      removeFromList();
      setSaveMessage("삭제했습니다.");
    } catch {
      setRequiresReload(true);
      setSaveError("삭제 결과를 확인하지 못했습니다. 새로고침하여 확인해 주세요.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  async function saveTypes() {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(undefined);
    setSaveMessage(undefined);

    const changes: (DiscountType & { kind: "create" | "update" })[] = [];
    for (const type of types) {
      const saved = savedTypes.find((item) => item.id === type.id);
      if (!saved) changes.push({ kind: "create", ...type });
      else if (saved.name !== type.name || saved.amount !== type.amount) {
        changes.push({ kind: "update", ...type });
      }
    }
    try {
      if (changes.length > 100) {
        setSaveError("한 번에 저장할 수 있는 변경은 100개까지입니다.");
        return;
      }
      // 어느 요청도 보내기 전에 모든 입력을 확인한다. 각 Action에서도 다시 검증한다.
      for (const change of changes) {
        const error = validateDiscountType(change, change.kind);
        if (error) { setSaveError(error); return; }
      }
      let nextTypes = [...types];
      let nextSaved = [...savedTypes];
      for (const change of changes) {
        const result = change.kind === "create"
          ? await createDiscountType(change)
          : await updateDiscountType(change);
        if (result.error !== undefined) {
          setSaveError(result.error);
          setDirty(true);
          if (result.requiresReload) setRequiresReload(true);
          return;
        }
        const value = result.data;
        nextSaved = [...nextSaved.filter((type) => type.id !== change.id), value];
        nextTypes = nextTypes.map((type) => type.id === change.id ? value : type);
        // 후속 요청이 실패해도 이미 저장된 항목과 실제 ID를 보존한다.
        setTypes(nextTypes);
        setSavedTypes(nextSaved);
      }
      setDirty(false);
      setSaveMessage("저장했습니다.");
    } catch {
      setRequiresReload(true);
      setSaveError("저장 결과를 확인하지 못했습니다. 중복 추가를 방지하려면 새로고침하여 저장된 내용을 확인해 주세요.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <main className="flex min-h-dvh min-w-0 w-full flex-col bg-background-page text-text-primary">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 bg-background-page items-center gap-md px-xl">
        <IconButton
          label="뒤로 가기"
          size="sm"
          disabled={saving}
          onClick={requestBack}
          icon={<Image src="/assets/page-chevron-left.svg" alt="" width={24} height={24} />}
        />
        <h1 className="text-heading">할인 유형 관리</h1>
      </header>

      <fieldset disabled={saving || requiresReload || Boolean(loadError)} className="flex min-w-0 flex-col gap-md px-lg pt-md">
        <Alert icon={<Image src="/assets/alert-circle.svg" alt="" width={16} height={16} />}>
          할인 유형 수정 및 삭제는 다음 운동기록부터 자동 적용됩니다.
        </Alert>

        <div className="flex flex-col gap-sm">
          {loadError ? (
            <p role="alert" className="text-body text-text-muted">{loadError}</p>
          ) : types.length === 0 ? (
            <p className="text-body text-text-muted">등록된 할인 유형이 없습니다.</p>
          ) : null}
          {types.map((type) => (
            <div key={type.id} className="flex items-center gap-sm">
              <div className="min-w-0 flex-1">
                <TextField aria-label="할인 유형 이름" value={type.name} onChange={(event) => updateType(type.id, "name", event.target.value)} />
              </div>
              <div className="w-[110px] shrink-0">
                <TextField
                  aria-label="할인 금액"
                  suffix="원"
                  inputMode="numeric"
                  value={type.amount}
                  onChange={(event) => updateType(type.id, "amount", event.target.value)}
                />
              </div>
              <IconButton
                label={`${type.name} 삭제`}
                variant="danger"
                onClick={() => setDeleteTarget(type)}
                icon={<Image src="/assets/trash.svg" alt="" width={18} height={18} />}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          disabled={Boolean(loadError)}
          className="flex cursor-pointer items-center justify-center gap-sm rounded-sm border border-dashed border-border p-md text-body font-semibold text-text-muted"
          onClick={() => {
            const id = nextTemporaryId.current--;
            setTypes((current) => [...current, { id, name: "", amount: "" }]);
            setDirty(true);
            setSaveMessage(undefined);
          }}
        >
          <Image src="/assets/plus-circle.svg" alt="" width={16} height={16} />
          유형 추가
        </button>
      </fieldset>

      <div className="mt-auto shrink-0 px-xl pt-xl pb-[calc(var(--spacing-lg)*2+env(safe-area-inset-bottom))]">
        {saveError && <p role="alert" className="mb-sm text-body text-text-muted">{saveError}</p>}
        {saveMessage && <p role="status" className="mb-sm text-body text-text-muted">{saveMessage}</p>}
        <Button fullWidth loading={saving} disabled={!dirty || Boolean(loadError) || requiresReload} onClick={saveTypes}>저장하기</Button>
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        title="할인 유형을 삭제할까요?"
        description={deleteTarget ? `‘${deleteTarget.name}’ 할인 기록은 이후 운동기록에서 사용할 수 없습니다.` : undefined}
        confirmLabel="삭제"
        confirmVariant="danger"
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={deleteType}
      />
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
