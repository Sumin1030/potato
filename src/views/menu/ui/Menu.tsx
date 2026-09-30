"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button, Dialog, TextField } from "@/shared/ui";
import { getDefaultPaymentMonth } from "../api/get-default-payment-month";
import { deleteSession } from "../api/delete-session";
import {
  getPaymentReport,
  type PaymentReportData,
} from "../api/get-payment-report";
import { PaymentReport } from "./PaymentReport";

const menuItems = [
  { label: "회원 유형 관리", icon: "user-square", href: "/member-types" },
  { label: "회원 목록 관리", icon: "users", href: "/members" },
  { label: "할인 유형 관리", icon: "ticket-percent", href: "/discount-types" },
] as const;

export default function Menu({
  canChangePassword = false,
}: {
  canChangePassword?: boolean;
}) {
  const sheetRef = useRef<HTMLDialogElement>(null);
  const [useFileShare, setUseFileShare] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<PaymentReportData>();
  const [generating, setGenerating] = useState(false);
  const [preparedImage, setPreparedImage] = useState<{
    file: File;
    url: string;
  }>();
  const [sharing, setSharing] = useState(false);
  const sharingRef = useRef(false);
  const [message, setMessage] = useState<string>();
  const [signingOut, setSigningOut] = useState(false);
  const [monthDialogOpen, setMonthDialogOpen] = useState(false);
  const [paymentMonth, setPaymentMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    const sheet = sheetRef.current;
    if (preparedImage && sheet && !sheet.open) sheet.showModal();
    if (!preparedImage && sheet?.open) sheet.close();
  }, [preparedImage]);

  useEffect(() => {
    return () => {
      if (preparedImage) URL.revokeObjectURL(preparedImage.url);
    };
  }, [preparedImage]);

  useEffect(() => {
    if (!report || !reportRef.current) return;
    const reportData = report;
    let cancelled = false;

    async function prepareReport() {
      try {
        await document.fonts.ready;
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        if (cancelled || !reportRef.current) return;
        const { toBlob } = await import("html-to-image");
        const blob = await toBlob(reportRef.current, {
          backgroundColor: "#ffffff",
          pixelRatio: 2,
        });
        if (cancelled) return;
        if (!blob) throw new Error("이미지를 생성하지 못했습니다.");
        const name = `${reportData.year}-${String(reportData.month).padStart(2, "0")}-회비-납부표.png`;
        const file = new File([blob], name, { type: "image/png" });
        const mobile =
          /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        let canShareFile = false;
        try {
          canShareFile =
            mobile &&
            typeof navigator.share === "function" &&
            typeof navigator.canShare === "function" &&
            navigator.canShare({ files: [file] });
        } catch {}
        setUseFileShare(canShareFile);
        setPreparedImage({ file, url: URL.createObjectURL(file) });
        setMessage(undefined);
      } catch (error) {
        if (cancelled) return;
        console.error("회비 납부 이미지 생성 실패:", error);
        setMessage("이미지를 생성하지 못했습니다.");
      } finally {
        if (!cancelled) {
          setGenerating(false);
          setReport(undefined);
        }
      }
    }

    prepareReport();
    return () => {
      cancelled = true;
    };
  }, [report]);

  async function createPaymentImage() {
    if (!paymentMonth) {
      setMessage("회비월을 선택해 주세요.");
      return;
    }
    setMonthDialogOpen(false);
    setGenerating(true);
    setMessage(undefined);
    setPreparedImage(undefined);
    let result;
    try {
      result = await getPaymentReport(paymentMonth);
    } catch {
      setGenerating(false);
      setMessage("회비 납부 정보를 불러오지 못했습니다. 다시 시도해 주세요.");
      return;
    }
    if (!result.data) {
      setGenerating(false);
      setMessage(result.error);
      return;
    }
    setReport(result.data);
  }

  function downloadImage() {
    if (!preparedImage) return;
    const link = document.createElement("a");
    link.download = preparedImage.file.name;
    link.href = preparedImage.url;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function shareImage() {
    if (!preparedImage || sharingRef.current) return;
    sharingRef.current = true;
    setSharing(true);
    try {
      const files = [preparedImage.file];
      if (!navigator.share || !navigator.canShare?.({ files })) {
        downloadImage();
        return;
      }
      await navigator.share({ files });
      setMessage(
        "공유 메뉴 처리가 완료됐습니다. 선택한 앱에서 결과를 확인해 주세요.",
      );
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessage("공유를 취소했습니다. 다시 공유할 수 있습니다.");
      } else {
        setUseFileShare(false);
        setMessage(
          "공유 메뉴를 열지 못했습니다. 다시 시도하거나 다운로드를 이용해 주세요.",
        );
      }
    } finally {
      sharingRef.current = false;
      setSharing(false);
    }
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
    <main className="flex min-h-dvh min-w-0 w-full flex-col bg-background-page text-text-primary">
      <header className="sticky top-0 z-20 flex h-14 shrink-0 bg-background-page items-center px-xl">
        <Link
          href="/"
          aria-label="뒤로 가기"
          className="inline-flex size-8 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <Image
            src="/assets/page-chevron-left.svg"
            alt=""
            width={24}
            height={24}
          />
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
              <Image
                src={`/assets/${item.icon}.svg`}
                alt=""
                width={22}
                height={22}
              />
              {item.label}
            </span>
            <Image
              src="/assets/menu-chevron-right.svg"
              alt=""
              width={16}
              height={16}
            />
          </Link>
        ))}
      </nav>

      <div className="mt-auto shrink-0 px-xl pt-xl pb-[max(var(--spacing-xl),env(safe-area-inset-bottom))]">
        <div className="mb-lg flex items-center justify-center gap-xl">
          {canChangePassword && (
            <Link
              href="/change-password"
              className="rounded-sm py-sm text-body text-text-muted"
            >
              비밀번호 변경
            </Link>
          )}
          <button
            type="button"
            disabled={signingOut}
            onClick={signOut}
            className="rounded-sm py-sm text-body text-text-muted disabled:opacity-50"
          >
            {signingOut ? "로그아웃 중" : "로그아웃"}
          </button>
        </div>
        {message && !preparedImage && (
          <p role="status" className="mb-sm text-body text-text-muted">
            {message}
          </p>
        )}
        <button
          type="button"
          disabled={generating || sharing}
          onClick={openMonthDialog}
          className={`${preparedImage ? "invisible" : ""} flex w-full cursor-pointer items-center justify-center gap-md rounded-md border-strong border-primary bg-primary/15 p-lg text-action text-primary`}
        >
          <Image src="/assets/file-image.svg" alt="" width={20} height={20} />
          {generating ? "이미지 생성 중" : "회비 납부 이미지 생성"}
        </button>
      </div>
      <dialog
        ref={sheetRef}
        aria-label="회비 납부 이미지 저장"
        className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto w-full max-w-[30rem] max-h-[80dvh] overflow-y-auto rounded-t-lg border border-border bg-background-component px-xl pt-[calc(var(--spacing-2xl)*2)] pb-[max(calc(var(--spacing-2xl)*2),env(safe-area-inset-bottom))] text-text-primary shadow-modal backdrop:bg-black/40"
        onCancel={(event) => {
          if (sharingRef.current) event.preventDefault();
          else {
            setPreparedImage(undefined);
            setMessage(undefined);
          }
        }}
        onClose={() => {
          setPreparedImage(undefined);
          setMessage(undefined);
        }}
      >
        {preparedImage && (
          <>
            <p className="mb-lg text-body text-text-muted">
              생성이 완료되었습니다.
              <br />
              {useFileShare
                ? "이미지를 저장하려면 공유하기 버튼을 눌러주세요."
                : "이미지를 저장하려면 다운로드 버튼을 눌러주세요."}
            </p>
            {message && (
              <p role="status" className="mb-sm text-body text-text-muted">
                {message}
              </p>
            )}
            <div className="flex gap-sm">
              <Button
                fullWidth
                loading={sharing}
                onClick={useFileShare ? shareImage : downloadImage}
              >
                {useFileShare ? "공유하기" : "다운로드"}
              </Button>
              <Button
                fullWidth
                variant="secondary"
                disabled={sharing}
                onClick={() => {
                  setPreparedImage(undefined);
                  setMessage(undefined);
                }}
              >
                취소
              </Button>
            </div>
          </>
        )}
      </dialog>
      {report && (
        <div className="fixed top-0 left-[-20000px]">
          <PaymentReport ref={reportRef} report={report} />
        </div>
      )}
      <Dialog
        open={monthDialogOpen}
        title="회비월 선택"
        description={
          <div className="flex flex-col gap-md">
            <p>선택한 회비월의 전월 운동 기록으로 이미지를 생성합니다.</p>
            <TextField
              aria-label="회비월"
              type="month"
              value={paymentMonth}
              onChange={(event) => setPaymentMonth(event.target.value)}
            />
          </div>
        }
        confirmLabel="이미지 생성"
        onOpenChange={setMonthDialogOpen}
        onConfirm={createPaymentImage}
      />
    </main>
  );
}
