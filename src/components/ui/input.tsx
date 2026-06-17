import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-border bg-white px-4 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
