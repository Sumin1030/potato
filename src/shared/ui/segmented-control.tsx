"use client";

import { useId, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface SegmentedControlProps {
  label: ReactNode;
  name?: string;
  value: string;
  options: readonly { value: string; label: ReactNode; disabled?: boolean }[];
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SegmentedControl({ label, name, value, options, onValueChange, disabled, className }: SegmentedControlProps) {
  const generatedName = useId();

  return (
    <fieldset disabled={disabled} className={cn("min-w-0 text-text-primary", className)}>
      <legend className="mb-sm text-emphasis">{label}</legend>
      <div className="flex gap-xs rounded-sm border border-border bg-background-component p-xs">
        {options.map((option) => (
          <label key={option.value} className="min-w-0 flex-1">
            <input
              className="peer sr-only"
              type="radio"
              name={name ?? generatedName}
              value={option.value}
              checked={value === option.value}
              disabled={option.disabled}
              onChange={() => onValueChange(option.value)}
            />
            <span className="flex min-h-11 cursor-pointer items-center justify-center rounded-xs px-sm py-xs text-emphasis text-text-muted peer-checked:bg-primary peer-checked:text-text-inverse peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
