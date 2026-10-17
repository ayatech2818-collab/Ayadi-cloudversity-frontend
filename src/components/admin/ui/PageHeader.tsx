"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export interface PageStat {
  label: string;
  icon: LucideIcon;
  /** `null` while the number is still loading. */
  value: number | null;
}

interface PageHeaderProps {
  eyebrow: string;
  /** Plain lead-in, e.g. "Blog" in "Blog Authors". */
  title: string;
  /** The word that carries the brand-gradient underline. */
  highlight: string;
  description: string;
  stats: PageStat[];
  /** The page's actions, shown beside the title. */
  children: ReactNode;
}

/**
 * The hero panel at the top of an admin page: navy accent gradient with a
 * brand-gradient glow, the title, the page's actions and a row of counts.
 */
export default function PageHeader({
  eyebrow,
  title,
  highlight,
  description,
  stats,
  children,
}: PageHeaderProps) {
  return (
    <section className="px-3 pt-3.5 min-[360px]:px-4 min-[360px]:pt-5 sm:px-6 sm:pt-6 lg:px-8">
      <div className="relative isolate overflow-hidden rounded-2xl bg-accent-gradient px-4 py-4.5 text-white shadow-[0_30px_60px_-30px_rgba(20,29,63,0.75)] min-[360px]:px-5 min-[360px]:py-5 sm:rounded-3xl sm:px-8 sm:py-8 dark:ring-1 dark:ring-white/10">
        {/* Decor */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-brand-gradient opacity-45 blur-3xl" />
          <div className="absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-brand-end opacity-25 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[22px_22px] [mask-image:radial-gradient(ellipse_at_85%_0%,black_10%,transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/40 to-transparent" />
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white/85 ring-1 ring-inset ring-white/15 min-[360px]:gap-2 min-[360px]:px-3 min-[360px]:py-1 min-[360px]:text-[11px] sm:tracking-[0.18em]">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-gradient" />
              {eyebrow}
            </span>

            <h1 className="mt-2.5 text-xl font-bold tracking-[-0.03em] min-[360px]:mt-3 min-[360px]:text-2xl sm:mt-4 sm:text-4xl sm:tracking-[-0.035em]">
              {title}{" "}
              <span className="relative inline-block">
                {highlight}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-brand-gradient"
                />
              </span>
            </h1>

            <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-white/70 sm:mt-3 sm:text-sm">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {children}
          </div>
        </div>

        {/* Stats */}
        <div
          className={`mt-4 grid gap-2 sm:mt-7 sm:gap-3 ${
            stats.length > 3
              ? "grid-cols-2 sm:grid-cols-4 lg:max-w-3xl"
              : "grid-cols-3 lg:max-w-2xl"
          }`}
        >
          {stats.map(({ label, icon: Icon, value }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 rounded-xl bg-white/[0.07] px-2.5 py-2 ring-1 ring-inset ring-white/10 min-[360px]:px-3 min-[360px]:py-2.5 sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3"
            >
              <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-lg shadow-brand-start/30 sm:flex">
                <Icon size={16} />
              </span>

              <div className="min-w-0">
                <p className="text-base font-bold leading-none tabular-nums min-[360px]:text-lg sm:text-xl">
                  {value ?? "–"}
                </p>

                <p className="mt-1 truncate text-[10px] font-medium text-white/60 sm:mt-1.5 sm:text-[11px]">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
