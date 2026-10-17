"use client";

import { INK } from "./styles";

/** The page's title row. Kept short so the figures start near the top. */
export default function DashboardHeader() {
  return (
    <header>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary min-[360px]:text-[11px] sm:tracking-[0.18em]">
        Admin Dashboard
      </p>

      <h1
        className={`mt-1 text-xl font-bold tracking-[-0.02em] min-[360px]:text-2xl sm:mt-2 sm:text-3xl sm:tracking-[-0.03em] ${INK}`}
      >
        Welcome back, Ayadi Admin
      </h1>

      <p className="mt-0.5 text-xs text-muted min-[360px]:mt-1 min-[360px]:text-sm sm:mt-1.5">
        An overview of your courses, enquiries and content.
      </p>
    </header>
  );
}
