"use client";

import type { DashboardCourseSummary } from "@/lib/api/dashboard";

import DashboardCard from "./DashboardCard";
import { INK, PULSE } from "./styles";

/** The ring, in the units of its 100 by 100 view box. */
const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ROW = "flex items-center justify-between gap-3 text-sm";
const SWATCH = "h-2.5 w-2.5 shrink-0 rounded-[3px]";
const BLANK = `block h-4 w-7 ${PULSE}`;

interface CourseOverviewProps {
  /** `null` while the summary is loading. */
  courses: DashboardCourseSummary | null;
  className?: string;
}

/**
 * How much of the catalogue is live. One ratio, so one ring: the filled arc is
 * the published share and the faded track is what is still in draft.
 */
export default function CourseOverview({
  courses,
  className = "",
}: CourseOverviewProps) {
  const share =
    courses && courses.total > 0
      ? courses.published / courses.total
      : 0;

  return (
    <DashboardCard
      title="Course Overview"
      description="How much of the catalogue is live"
      className={className}
    >
      <div
        aria-busy={courses === null}
        className="flex flex-1 items-center gap-5 px-5 pb-5 pt-5 sm:px-6 sm:pb-6"
      >
        <div
          role="img"
          aria-label={
            courses
              ? `${courses.published} of ${courses.total} courses are published`
              : "Loading course figures"
          }
          className="relative h-24 w-24 shrink-0"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            className="h-full w-full -rotate-90"
          >
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth="10"
              strokeOpacity={0.18}
              style={{ stroke: "var(--series-1)" }}
            />

            {/* A rounded end would leave a dot behind at nought. */}
            {share > 0 && (
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${share * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                style={{ stroke: "var(--series-1)" }}
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {courses ? (
              <span className={`text-lg font-bold leading-none ${INK}`}>
                {Math.round(share * 100)}%
              </span>
            ) : (
              <span className={`block h-[18px] w-9 ${PULSE}`} />
            )}

            <span className="mt-1 text-[10px] font-medium text-muted">
              published
            </span>
          </div>
        </div>

        <dl className="min-w-0 flex-1 space-y-2.5">
          <div className={`${ROW} border-b border-border pb-2.5`}>
            <dt className="text-muted">Total Courses</dt>
            <dd className={`text-lg font-bold leading-none ${INK}`}>
              {courses ? courses.total : <span className={BLANK} />}
            </dd>
          </div>

          <div className={ROW}>
            <dt className="flex items-center gap-2 text-muted">
              <span
                aria-hidden="true"
                style={{ backgroundColor: "var(--series-1)" }}
                className={SWATCH}
              />
              Published
            </dt>
            <dd className="font-bold tabular-nums text-text">
              {courses ? courses.published : <span className={BLANK} />}
            </dd>
          </div>

          <div className={ROW}>
            <dt className="flex items-center gap-2 text-muted">
              <span
                aria-hidden="true"
                style={{ backgroundColor: "var(--series-1)" }}
                className={`${SWATCH} opacity-[0.18]`}
              />
              Draft
            </dt>
            <dd className="font-bold tabular-nums text-text">
              {courses ? courses.draft : <span className={BLANK} />}
            </dd>
          </div>
        </dl>
      </div>
    </DashboardCard>
  );
}
