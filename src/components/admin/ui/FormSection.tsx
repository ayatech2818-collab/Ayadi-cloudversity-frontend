"use client";

import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  /** Small note on the right of the title. */
  aside?: ReactNode;
  children: ReactNode;
}

/** A titled white panel that groups related fields inside a long form. */
export default function FormSection({
  title,
  aside,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-2xl bg-surface p-4 ring-1 ring-inset ring-border sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-accent">
          <span
            aria-hidden="true"
            className="h-3.5 w-1 rounded-full bg-brand-gradient"
          />
          {title}
        </h3>

        {aside && (
          <span className="text-[11px] font-medium text-muted">
            {aside}
          </span>
        )}
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}
