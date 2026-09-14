import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
}

export function Alert({ children, className, icon, role = "status", ...props }: AlertProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-sm rounded-sm border border-danger/[0.13] bg-danger/[0.06] p-md text-caption text-danger",
        className,
      )}
      role={role}
      {...props}
    >
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
