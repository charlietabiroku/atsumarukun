import { cn } from "@/lib/utils";

export function Logo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-end gap-2">
        <span
          className={cn(
            "font-heading font-extrabold tracking-[-0.06em] text-primary",
            compact ? "text-3xl" : "text-5xl",
          )}
        >
          集
        </span>
        <span
          className={cn(
            "font-heading font-extrabold tracking-[-0.05em] text-foreground",
            compact ? "text-3xl" : "text-5xl",
          )}
        >
          丸くん
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-primary" />
        <p
          className={cn(
            "font-semibold uppercase tracking-[0.34em] text-foreground/80",
            compact ? "text-[10px]" : "text-xs",
          )}
        >
          Atsumarukun
        </p>
      </div>
    </div>
  );
}
