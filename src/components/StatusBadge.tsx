import { cn } from "@/lib/utils";
import type { ProductStatus } from "@/lib/types";

const styles: Record<ProductStatus, string> = {
  available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  sold_out: "bg-slate-100 text-slate-600 ring-slate-500/20",
  draft: "bg-amber-50 text-amber-700 ring-amber-600/20",
  hidden: "bg-slate-100 text-slate-500 ring-slate-500/20",
};

const labels: Record<ProductStatus, string> = {
  available: "Available",
  sold_out: "Sold Out",
  draft: "Draft",
  hidden: "Hidden",
};

export function StatusBadge({
  status,
  className,
}: {
  status: ProductStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
