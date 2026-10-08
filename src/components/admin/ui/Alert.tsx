"use client";

import type { ReactNode } from "react";
import { CircleAlert } from "lucide-react";

/** Inline error banner for a form or a dialog body. */
export default function Alert({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3.5 text-xs font-medium leading-relaxed text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:ring-rose-500/30"
    >
      <CircleAlert
        size={16}
        className="mt-px shrink-0 text-rose-600 dark:text-rose-400"
      />
      {children}
    </div>
  );
}
