"use client";

import { useId, type ReactNode } from "react";

import { CARD, INK } from "./styles";

interface DashboardCardProps {
  title: string;
  description?: string;
  /** A link or control, shown beside the title. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** A titled dashboard section. The body brings its own padding. */
export default function DashboardCard({
  title,
  description,
  action,
  className = "",
  children,
}: DashboardCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={`flex flex-col ${CARD} ${className}`}
    >
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-5 pt-5 sm:px-6">
        <div className="min-w-0">
          <h2
            id={titleId}
            className={`text-base font-bold tracking-[-0.01em] ${INK}`}
          >
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-xs text-muted">{description}</p>
          )}
        </div>

        {action}
      </header>

      {children}
    </section>
  );
}
