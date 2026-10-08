"use client";

import { INK } from "./styles";

/** The page's title row. Kept short so the figures start near the top. */
export default function DashboardHeader() {
  return (
    <header>
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
        Admin Dashboard
      </p>

      <h1
        className={`mt-2 text-2xl font-bold tracking-[-0.03em] sm:text-3xl ${INK}`}
      >
        Welcome back, Ayadi Admin
      </h1>

      <p className="mt-1.5 text-sm text-muted">
        An overview of your courses, enquiries and content.
      </p>
    </header>
  );
}
