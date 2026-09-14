"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Alert, Button, Dialog, IconButton, TextField } from "@/shared/ui";

interface MemberType {
  id: number;
  name: string;
  fee: string;
}

interface MemberTypeManagementProps {
  onBack?: () => void;
}

const initialTypes: MemberType[] = [
  { id: 1, name: "정회원", fee: "30,000" },
  { id: 2, name: "일반회원", fee: "15,000" },
  { id: 3, name: "비회원", fee: "5,000" },
];

export default function MemberTypeManagement({ onBack }: MemberTypeManagementProps) {
  const router = useRouter();
  const [types, setTypes] = useState(initialTypes);
  const [dirty, setDirty] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  function updateType(id: number, key: "name" | "fee", value: string) {
    setTypes((current) => current.map((type) => type.id === id ? { ...type, [key]: value } : type));
    setDirty(true);
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
    <main className="flex min-h-dvh min-w-(--layout-content-min-width) flex-col bg-background-page text-text-primary">
      <header className="flex h-14 items-center gap-md px-xl">
        <IconButton
          label="뒤로 가기"
          size="sm"
          onClick={requestBack}
          icon={<Image src="/assets/page-chevron-left.svg" alt="" width={24} height={24} />}
        />
        <h1 className="text-heading">회원 유형 관리</h1>
      </header>

      <div className="flex flex-col gap-md px-lg pt-md">
        <Alert icon={<Image src="/assets/alert-circle.svg" alt="" width={16} height={16} />}>
          회원 유형, 회비관련 수정사항은 다음 운동기록부터 자동 적용됩니다.
        </Alert>

        <div className="flex flex-col gap-sm">
          {types.map((type) => (
            <div key={type.id} className="flex items-center gap-sm">
              <div className="min-w-0 flex-1">
                <TextField
                  aria-label="회원 유형 이름"
                  value={type.name}
                  onChange={(event) => updateType(type.id, "name", event.target.value)}
                />
              </div>
              <div className="w-[110px] shrink-0">
                <TextField
                  aria-label="월 회비"
                  suffix="원"
                  inputMode="numeric"
                  value={type.fee}
                  onChange={(event) => updateType(type.id, "fee", event.target.value)}
                />
              </div>
              <IconButton
                label={`${type.name} 삭제`}
                variant="danger"
                onClick={() => { setTypes((current) => current.filter((item) => item.id !== type.id)); setDirty(true); }}
                icon={<Image src="/assets/trash.svg" alt="" width={18} height={18} />}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          className="flex cursor-pointer items-center justify-center gap-sm rounded-sm border border-dashed border-border p-md text-body font-semibold text-text-muted"
          onClick={() => { setTypes((current) => [...current, { id: Date.now(), name: "", fee: "" }]); setDirty(true); }}
        >
          <Image src="/assets/plus-circle.svg" alt="" width={16} height={16} />
          유형 추가
        </button>
      </div>

      <div className="mt-auto p-xl">
        <Button fullWidth disabled={!dirty} onClick={() => setDirty(false)}>저장하기</Button>
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
