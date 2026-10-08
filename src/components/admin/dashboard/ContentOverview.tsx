"use client";

import {
  FileCheck,
  FilePenLine,
  Image as ImageIcon,
  Video,
  type LucideIcon,
} from "lucide-react";

import type { DashboardSummary } from "@/lib/api/dashboard";

import DashboardCard from "./DashboardCard";
import { INK, PULSE } from "./styles";

const ITEMS: {
  label: string;
  icon: LucideIcon;
  value: (summary: DashboardSummary) => number;
}[] = [
  {
    label: "Published Blogs",
    icon: FileCheck,
    value: ({ blogs }) => blogs.published,
  },
  {
    label: "Draft Blogs",
    icon: FilePenLine,
    value: ({ blogs }) => blogs.draft,
  },
  {
    label: "Images",
    icon: ImageIcon,
    value: ({ gallery }) => gallery.images,
  },
  {
    label: "Videos",
    icon: Video,
    value: ({ gallery }) => gallery.videos,
  },
];

interface ContentOverviewProps {
  /** `null` while the summary is loading. */
  summary: DashboardSummary | null;
  className?: string;
}

/** Blog posts and gallery media, counted. Four figures, so no chart. */
export default function ContentOverview({
  summary,
  className = "",
}: ContentOverviewProps) {
  return (
    <DashboardCard
      title="Content Overview"
      description="Blog posts and gallery media"
      className={className}
    >
      <dl
        aria-busy={summary === null}
        className="grid flex-1 auto-rows-fr grid-cols-2 gap-2.5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6 md:grid-cols-4 xl:grid-cols-2"
      >
        {ITEMS.map(({ label, icon: Icon, value }) => (
          <div
            key={label}
            className="flex flex-col justify-center rounded-xl bg-page/70 p-3 ring-1 ring-inset ring-border"
          >
            <dt className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
              <Icon size={13} className="shrink-0 text-primary" />
              <span className="truncate">{label}</span>
            </dt>

            <dd
              className={`mt-2 text-xl font-bold leading-none tracking-[-0.02em] ${INK}`}
            >
              {summary ? (
                value(summary).toLocaleString("en-IN")
              ) : (
                <span className={`block h-5 w-10 ${PULSE}`} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}
