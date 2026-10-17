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
        className="grid flex-1 auto-rows-fr grid-cols-2 gap-2 px-3.5 pb-3.5 pt-3.5 min-[360px]:gap-2.5 min-[360px]:px-4 min-[360px]:pb-4 min-[360px]:pt-4 sm:px-6 sm:pb-6 sm:pt-5 md:grid-cols-4 xl:grid-cols-2"
      >
        {ITEMS.map(({ label, icon: Icon, value }) => (
          <div
            key={label}
            className="flex flex-col justify-center rounded-lg bg-page/70 p-2 ring-1 ring-inset ring-border min-[360px]:rounded-xl min-[360px]:p-2.5 sm:p-3"
          >
            <dt className="flex items-center gap-1.5 text-[10px] font-medium text-muted min-[360px]:text-[11px]">
              <Icon className="h-3 w-3 shrink-0 text-primary min-[360px]:h-[13px] min-[360px]:w-[13px]" />
              <span className="truncate">{label}</span>
            </dt>

            <dd
              className={`mt-1.5 text-base font-bold leading-none tracking-[-0.02em] min-[360px]:mt-2 min-[360px]:text-lg sm:text-xl ${INK}`}
            >
              {summary ? (
                value(summary).toLocaleString("en-IN")
              ) : (
                <span className={`block h-4 w-8 min-[360px]:h-5 min-[360px]:w-10 ${PULSE}`} />
              )}
            </dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}
