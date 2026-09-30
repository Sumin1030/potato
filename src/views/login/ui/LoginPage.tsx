"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { Alert, Button, PasswordField, SegmentedControl } from "@/shared/ui";
import { createSession } from "../api/create-session";

const accounts = [
  { value: "ADMIN", label: "운영진" },
  { value: "SUPER_ADMIN", label: "대표운영진" },
  { value: "TEST", label: "임시로그인" },
] as const;

export default function LoginPage() {
  const [role, setRole] = useState<string>("ADMIN");
  const [state, formAction, pending] = useActionState(createSession, {});
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!pending) passwordRef.current?.focus({ preventScroll: true });
  }, [pending]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background-page px-xl py-2xl text-text-primary">
      <div className="w-full max-w-[370px]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">운영진 로그인</h1>
          <p className="mt-sm text-body text-text-muted">계정을 선택하고 비밀번호를 입력해 주세요.</p>
          <p className="mt-sm text-body text-text-muted">임시 로그인 비밀번호: 123456</p>
        </div>
        <form action={formAction} className="flex flex-col gap-xl">
          <fieldset disabled={pending} className="flex flex-col gap-xl">
            <SegmentedControl
              label="계정"
              name="role"
              value={role}
              options={accounts}
              onValueChange={(value) => {
                setRole(value);
                passwordRef.current?.focus({ preventScroll: true });
              }}
            />
            <PasswordField
              ref={passwordRef}
              autoFocus
              id="password"
              name="password"
              label="비밀번호"
              placeholder="비밀번호를 입력해 주세요"
              required
            />
          </fieldset>
          {state.error && (
            <Alert role="alert" icon={<Image src="/assets/alert-circle.svg" alt="" width={16} height={16} />}>
              {state.error}
            </Alert>
          )}
          <Button type="submit" fullWidth loading={pending}>로그인</Button>
        </form>
      </div>
    </main>
  );
}
