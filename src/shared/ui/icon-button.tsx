import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type IconButtonVariant = "default" | "danger";
type IconButtonSize = "sm" | "md";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: ReactNode;
  label: string;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
}

const variantClasses: Record<IconButtonVariant, string> = {
  default: "bg-transparent text-text-primary",
  danger: "bg-danger/10 text-danger",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "size-8",
  md: "size-11",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      className,
      icon,
      label,
      size = "md",
      type = "button",
      variant = "default",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-sm transition-[filter,opacity]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          "enabled:cursor-pointer enabled:hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        aria-label={label}
        {...props}
      >
        {icon}
      </button>
    );
  },
);
