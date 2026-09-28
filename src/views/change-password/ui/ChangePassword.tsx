"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Alert, Button, PasswordField, SegmentedControl } from "@/shared/ui";
import { updatePassword } from "../api/update-password";

const accounts = [
  { value: "ADMIN", label: "운영진" },
  { value: "SUPER_ADMIN", label: "대표운영진" },
] as const;

export default function ChangePassword() {
  const [role, setRole] = useState("ADMIN");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ error?: string; success?: string }>({});

  async function submit(formData: FormData) {
    setPending(true);
    setResult({});
    try {
      setResult(await updatePassword(formData));
    } catch {
      setResult({ error: "요청을 처리하지 못했습니다. 다시 시도해 주세요." });
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-background-page text-text-primary">
      <header className="flex h-14 items-center gap-md px-xl">
        <Link href="/menu" aria-label="메뉴로 돌아가기" className="inline-flex size-8 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-primary">
          <Image src="/assets/page-chevron-left.svg" alt="" width={24} height={24} />
        </Link>
        <h1 className="text-heading">비밀번호 변경</h1>
      </header>
      <form action={submit} className="mx-auto flex w-full max-w-[410px] flex-1 flex-col gap-xl px-xl py-lg">
        <p className="text-body text-text-muted">변경할 계정을 선택하고 해당 계정의 현재 비밀번호를 입력해 주세요.</p>
        <fieldset disabled={pending} className="flex flex-col gap-xl">
          <SegmentedControl label="계정" name="role" value={role} options={accounts} onValueChange={(value) => { setRole(value); setResult({}); }} />
          <div key={role} className="flex flex-col gap-xl">
            <PasswordField name="currentPassword" label="현재 비밀번호" required autoComplete="current-password" />
            <PasswordField name="password" label="새 비밀번호" required autoComplete="new-password" />
            <PasswordField name="confirmation" label="새 비밀번호 확인" required autoComplete="new-password" />
          </div>
        </fieldset>
        {result.error && <Alert role="alert" icon={<Image src="/assets/alert-circle.svg" alt="" width={16} height={16} />}>{result.error}</Alert>}
        {result.success && <p role="status" className="text-body text-primary">{result.success}</p>}
        <Button type="submit" fullWidth loading={pending} className="mt-auto">저장하기</Button>
      </form>
    </main>
  );
}
