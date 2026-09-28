"use client";

import { forwardRef, useId, useState } from "react";
import { TextField, type TextFieldProps } from "./text-field";

export type PasswordFieldProps = Omit<TextFieldProps, "type">;

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField({ id, disabled, autoComplete = "current-password", ...props }, ref) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const [visible, setVisible] = useState(false);

    return (
      <div className="flex min-w-0 flex-col gap-sm">
        <TextField
          {...props}
          ref={ref}
          id={inputId}
          disabled={disabled}
          autoComplete={autoComplete}
          type={visible ? "text" : "password"}
        />
        <button
          type="button"
          disabled={disabled}
          aria-controls={inputId}
          aria-pressed={visible}
          className="self-end cursor-pointer rounded-xs text-caption text-text-muted focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? "비밀번호 숨기기" : "비밀번호 보기"}
        </button>
      </div>
    );
  },
);
