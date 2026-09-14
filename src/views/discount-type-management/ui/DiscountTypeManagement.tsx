"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, Dialog, IconButton, TextField } from "@/shared/ui";

interface DiscountType {
  id: number;
  name: string;
  amount: string;
}

interface DiscountTypeManagementProps {
  onBack?: () => void;
}

const initialTypes: DiscountType[] = [
  { id: 1, name: "조끼", amount: "2,000" },
  { id: 2, name: "공", amount: "3,000" },
  { id: 3, name: "구장 예약", amount: "5,000" },
];

export default function DiscountTypeManagement({ onBack }: DiscountTypeManagementProps) {
  const router = useRouter();
  const [types, setTypes] = useState(initialTypes);
  const [deleteTarget, setDeleteTarget] = useState<DiscountType | null>(null);
  const [dirty, setDirty] = useState(false);

  function updateType(id: number, key: "name" | "amount", value: string) {
    setTypes((current) => current.map((type) => type.id === id ? { ...type, [key]: value } : type));
    setDirty(true);
  }

  return (
    <main className="flex min-h-dvh min-w-(--layout-content-min-width) flex-col bg-background-page text-text-primary">
      <header className="flex h-14 items-center gap-md px-xl">
        <IconButton
          label="뒤로 가기"
          size="sm"
          onClick={() => { if (onBack) onBack(); else router.back(); }}
          icon={<Image src="/assets/page-chevron-left.svg" alt="" width={24} height={24} />}
        />
        <h1 className="text-heading">할인 유형 관리</h1>
      </header>

      <div className="flex flex-col gap-md px-lg pt-md">
        <Alert icon={<Image src="/assets/alert-circle.svg" alt="" width={16} height={16} />}>
          할인 유형 수정 및 삭제는 다음 운동기록부터 자동 적용됩니다.
        </Alert>

        <div className="flex flex-col gap-sm">
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
          className="flex cursor-pointer items-center justify-center gap-sm rounded-sm border border-dashed border-border p-md text-body font-semibold text-text-muted"
          onClick={() => { setTypes((current) => [...current, { id: Date.now(), name: "", amount: "" }]); setDirty(true); }}
        >
          <Image src="/assets/plus-circle.svg" alt="" width={16} height={16} />
          유형 추가
        </button>
      </div>

      <div className="mt-auto p-xl">
        <Button fullWidth disabled={!dirty} onClick={() => setDirty(false)}>저장하기</Button>
      </div>

      <Dialog
        open={Boolean(deleteTarget)}
        title="할인 유형을 삭제할까요?"
        description={deleteTarget ? `‘${deleteTarget.name}’ 할인 기록은 이후 운동기록에서 사용할 수 없습니다.` : undefined}
        confirmLabel="삭제"
        confirmVariant="danger"
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onConfirm={() => {
          if (deleteTarget) setTypes((current) => current.filter((type) => type.id !== deleteTarget.id));
          setDeleteTarget(null);
          setDirty(true);
        }}
      />
    </main>
  );
}
