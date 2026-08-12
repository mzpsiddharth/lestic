import { cn } from "@/lib/utils";
import { LEAD_STATUSES } from "@/lib/constants";
import type { LeadStatus } from "@/lib/types";

export function LeadStatusBadge({
  status,
  className,
}: {
  status: LeadStatus;
  className?: string;
}) {
  const config = LEAD_STATUSES.find((s) => s.value === status) ?? LEAD_STATUSES[0];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ring-slate-200",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
