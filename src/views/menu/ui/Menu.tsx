"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Dialog, TextField } from "@/shared/ui";
import { getDefaultPaymentMonth } from "../api/get-default-payment-month";
import { deleteSession } from "../api/delete-session";
import { getPaymentReport, type PaymentReportData } from "../api/get-payment-report";
import { PaymentReport } from "./PaymentReport";

const menuItems = [
  { label: "회원 유형 관리", icon: "user-square", href: "/member-types" },
  { label: "회원 목록 관리", icon: "users", href: "/members" },
  { label: "할인 유형 관리", icon: "ticket-percent", href: "/discount-types" },
] as const;

export default function Menu({ canChangePassword = false }: { canChangePassword?: boolean }) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<PaymentReportData>();
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<string>();
  const [signingOut, setSigningOut] = useState(false);
  const [monthDialogOpen, setMonthDialogOpen] = useState(false);
  const [paymentMonth, setPaymentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!report || !reportRef.current) return;
    const reportData = report;
    let cancelled = false;

    async function downloadReport() {
      try {
        await document.fonts.ready;
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (cancelled || !reportRef.current) return;
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(reportRef.current, { backgroundColor: "#ffffff", pixelRatio: 2 });
        const link = document.createElement("a");
        link.download = `${reportData.year}-${String(reportData.month).padStart(2, "0")}-회비-납부표.png`;
        link.href = dataUrl;
        link.click();
        setMessage("이미지를 생성했습니다.");
      } catch (error) {
        console.error("회비 납부 이미지 생성 실패:", error);
        setMessage("이미지를 생성하지 못했습니다.");
      } finally {
        if (!cancelled) { setGenerating(false); setReport(undefined); }
      }
    }

    downloadReport();
    return () => { cancelled = true; };
  }, [report]);

  async function createPaymentImage() {
    if (!paymentMonth) {
      setMessage("회비월을 선택해 주세요.");
      return;
    }
    setMonthDialogOpen(false);
    setGenerating(true);
    setMessage(undefined);
    const result = await getPaymentReport(paymentMonth);
    if (!result.data) {
      setGenerating(false);
      setMessage(result.error);
      return;
    }
    setReport(result.data);
  }

  async function openMonthDialog() {
    setMessage(undefined);
    const result = await getDefaultPaymentMonth();
    if (result.data) setPaymentMonth(result.data);
    if (result.error) setMessage(result.error);
    setMonthDialogOpen(true);
  }

  async function signOut() {
    setSigningOut(true);
    try {
      const result = await deleteSession();
      setMessage(result.error);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <main className="flex min-h-dvh min-w-(--layout-content-min-width) flex-col bg-background-page text-text-primary">
      <header className="flex h-14 items-center px-xl">
        <Link href="/" aria-label="뒤로 가기" className="inline-flex size-8 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <Image src="/assets/page-chevron-left.svg" alt="" width={24} height={24} />
        </Link>
      </header>

      <nav className="flex flex-col gap-sm px-xl" aria-label="관리 메뉴">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex cursor-pointer items-center justify-between rounded-md border border-border bg-background-component p-lg text-left"
          >
            <span className="flex items-center gap-md text-emphasis">
              <Image src={`/assets/${item.icon}.svg`} alt="" width={22} height={22} />
              {item.label}
            </span>
            <Image src="/assets/menu-chevron-right.svg" alt="" width={16} height={16} />
          </Link>
        ))}
      </nav>

      <div className="mt-auto px-xl pb-xl">
        <div className="mb-lg flex items-center justify-center gap-xl">
          {canChangePassword && (
            <Link href="/change-password" className="rounded-sm py-sm text-body text-text-muted">
              비밀번호 변경
            </Link>
          )}
          <button type="button" disabled={signingOut} onClick={signOut} className="rounded-sm py-sm text-body text-text-muted disabled:opacity-50">
            {signingOut ? "로그아웃 중" : "로그아웃"}
          </button>
        </div>
        {message && <p role="status" className="mb-sm text-body text-text-muted">{message}</p>}
        <button
          type="button"
          disabled={generating}
          onClick={openMonthDialog}
          className="flex w-full cursor-pointer items-center justify-center gap-md rounded-md border-strong border-primary bg-primary/15 p-lg text-action text-primary"
        >
          <Image src="/assets/file-image.svg" alt="" width={20} height={20} />
          {generating ? "이미지 생성 중" : "회비 납부 이미지 생성"}
        </button>
      </div>
      {report && <div className="fixed top-0 left-[-20000px]"><PaymentReport ref={reportRef} report={report} /></div>}
      <Dialog
        open={monthDialogOpen}
        title="회비월 선택"
        description={(
          <div className="flex flex-col gap-md">
            <p>선택한 회비월의 전월 운동 기록으로 이미지를 생성합니다.</p>
            <TextField
              aria-label="회비월"
              type="month"
              value={paymentMonth}
              onChange={(event) => setPaymentMonth(event.target.value)}
            />
          </div>
        )}
        confirmLabel="이미지 생성"
        onOpenChange={setMonthDialogOpen}
        onConfirm={createPaymentImage}
      />
    </main>
  );
}
