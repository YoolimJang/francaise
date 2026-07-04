import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center border border-ink px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em]",
        className
      )}
      {...props}
    />
  );
}
