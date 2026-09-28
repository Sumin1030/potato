"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "./button";

export interface DialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
}

export function Dialog({
  cancelLabel = "취소",
  confirmLabel = "확인",
  confirmVariant = "primary",
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="m-auto w-[calc(100%-3rem)] max-w-[354px] rounded-lg border border-border bg-background-component p-2xl text-text-primary shadow-modal backdrop:bg-black/70"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={() => onOpenChange(false)}
      onClose={() => onOpenChange(false)}
    >
      <div className="flex flex-col gap-xl">
        <div className="flex flex-col gap-sm">
          <h2 id={titleId} className="text-heading">
            {title}
          </h2>
          {description && (
            <div id={descriptionId} className="text-body text-text-muted">
              {description}
            </div>
          )}
        </div>
        <div className="flex gap-md">
          <Button
            className="flex-1"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>
          <Button
            className="flex-1"
            variant={confirmVariant}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
