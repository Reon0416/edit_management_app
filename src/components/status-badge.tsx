import type { ProjectStatus } from "@/lib/types";
import { statusStyles } from "@/lib/status";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", statusStyles[status], className)}>
      {status}
    </span>
  );
}
