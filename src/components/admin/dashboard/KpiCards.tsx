"use client";

import {
  BookOpen,
  FileText,
  Images,
  Inbox,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

import type { DashboardSummary } from "@/lib/api/dashboard";

import { CARD, CARD_LIFT, INK, PULSE } from "./styles";

/**
 * Each card reads its figure, and the line under it, straight from the
 * summary. The API reports where things stand, not how they have moved, so
 * that line gives the breakdown rather than a change.
 */
const KPIS: {
  id: string;
  label: string;
  icon: LucideIcon;
  value: (summary: DashboardSummary) => number;
  note: (summary: DashboardSummary) => string;
}[] = [
  {
    id: "courses",
    label: "Total Courses",
    icon: BookOpen,
    value: ({ courses }) => courses.total,
    note: ({ courses }) =>
      `${courses.published} published · ${courses.draft} draft`,
  },
  {
    id: "enquiries",
    label: "Total Enquiries",
    icon: MessageSquare,
    value: ({ enquiries }) => enquiries.total,
    note: () => "All time",
  },
  {
    id: "new-enquiries",
    label: "New Enquiries",
    icon: Inbox,
    value: ({ enquiries }) => enquiries.new,
    note: () => "Waiting for a reply",
  },
  {
    id: "blogs",
    label: "Published Blogs",
    icon: FileText,
    value: ({ blogs }) => blogs.published,
    note: ({ blogs }) => `${blogs.draft} in draft`,
  },
  {
    id: "media",
    label: "Gallery Media",
    icon: Images,
    // `gallery.total` counts galleries; the media in them is these two.
    value: ({ gallery }) => gallery.images + gallery.videos,
    note: ({ gallery }) =>
      `In ${gallery.total} ${gallery.total === 1 ? "gallery" : "galleries"}`,
  },
];

/**
 * Five cards never fill a row of two or three evenly, so the grid changes
 * shape instead: 2 + 2 + 1 wide on a phone, 3 + 2 on a tablet, one row from
 * `xl`.
 */
const SPANS = [
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-2",
  "sm:col-span-3",
  "col-span-2 sm:col-span-3",
];

interface KpiCardsProps {
  /** `null` while the summary is loading. */
  summary: DashboardSummary | null;
}

/** The headline figures. */
export default function KpiCards({ summary }: KpiCardsProps) {
  return (
    <section
      aria-label="Key figures"
      aria-busy={summary === null}
      className="grid grid-cols-2 gap-3 sm:grid-cols-6 sm:gap-4 xl:grid-cols-5"
    >
      {KPIS.map(({ id, label, icon: Icon, value, note }, index) => (
        <article
          key={id}
          className={`group relative flex flex-col overflow-hidden p-4 sm:p-5 xl:col-span-1 ${CARD} ${CARD_LIFT} ${SPANS[index]}`}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-brand-gradient transition-transform duration-500 group-hover:scale-x-100"
          />

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon size={19} />
          </span>

          {summary ? (
            <p
              className={`mt-4 text-[28px] font-bold leading-none tracking-[-0.03em] sm:text-3xl ${INK}`}
            >
              {value(summary).toLocaleString("en-IN")}
            </p>
          ) : (
            <span
              aria-hidden="true"
              className={`mt-4 block h-7 w-16 sm:h-[30px] ${PULSE}`}
            />
          )}

          <h2 className="mt-2 text-sm font-semibold text-text">
            {label}
          </h2>

          {summary ? (
            <p className="mt-0.5 text-[11px] text-muted">
              {note(summary)}
            </p>
          ) : (
            <span
              aria-hidden="true"
              className={`mt-1.5 block h-3 w-24 ${PULSE}`}
            />
          )}
        </article>
      ))}
    </section>
  );
}
