import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { cn } from "@/shared/lib/cn";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  suffix?: ReactNode;
  error?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { className, disabled, error, id, label, suffix, ...props },
    ref,
  ) {
    const errorId = id && error ? `${id}-error` : undefined;

    return (
      <label className="flex min-w-0 flex-col gap-xs text-body text-text-primary">
        {label && <span className="text-emphasis">{label}</span>}
        <span
          className={cn(
            "flex h-11 min-w-0 items-center rounded-sm border bg-background-component px-md",
            "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary",
            error ? "border-danger" : "border-border",
            disabled && "cursor-not-allowed opacity-50",
          )}
        >
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-0 min-w-0 flex-1 bg-transparent text-base text-text-primary outline-none",
              "placeholder:text-text-muted disabled:cursor-not-allowed",
              className,
            )}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={errorId}
            {...props}
          />
          {suffix && (
            <span className="shrink-0 text-body text-text-secondary">
              {suffix}
            </span>
          )}
        </span>
        {error && (
          <span id={errorId} className="text-caption text-danger">
            {error}
          </span>
        )}
      </label>
    );
  },
);
