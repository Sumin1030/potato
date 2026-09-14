"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "type"> {
  label?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    { checked, className, disabled, label, onCheckedChange, ...props },
    ref,
  ) {
    return (
      <label
        className={cn(
          "inline-flex items-center gap-sm text-emphasis text-text-primary",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          className,
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange?.(event.target.checked)}
          {...props}
        />
        <span
          aria-hidden="true"
          className={cn(
            "inline-flex size-5 shrink-0 items-center justify-center rounded-xs border-strong border-border",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
            "peer-checked:border-primary peer-checked:bg-primary peer-checked:[&_span]:block",
          )}
        >
          <span className="hidden text-sm leading-none font-bold text-text-inverse">
            ✓
          </span>
        </span>
        {label}
      </label>
    );
  },
);
