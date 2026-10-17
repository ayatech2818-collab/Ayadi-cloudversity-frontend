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
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 px-3.5 pt-3.5 min-[360px]:px-4 min-[360px]:pt-4 sm:gap-x-4 sm:gap-y-3 sm:px-6 sm:pt-5">
        <div className="min-w-0">
          <h2
            id={titleId}
            className={`text-sm font-bold tracking-[-0.01em] min-[360px]:text-base ${INK}`}
          >
            {title}
          </h2>

          {description && (
            <p className="mt-0.5 text-[11px] text-muted min-[360px]:text-xs">
              {description}
            </p>
          )}
        </div>

        {action}
      </header>

      {children}
    </section>
  );
}
