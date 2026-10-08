"use client";

import {
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import type { EnquiryAnalyticsPoint } from "@/lib/api/dashboard";

import {
  SERIES,
  areaPath,
  axisScale,
  formatDay,
  linePath,
  pointX,
  pointY,
  spreadLabels,
} from "./chart-utils";

/** Shared by the plot and the gutters either side of it. */
const PLOT_HEIGHT = "h-52 sm:h-60";

/** Room for the y-axis numbers, and for the names at the line ends. */
const AXIS_GUTTER = "w-7";
const LABEL_GUTTER = "sm:w-[76px]";

/** The least two end labels may be apart, as a percentage of the plot. */
const LABEL_GAP = 7;

/** How many days apart the x-axis labels sit, for a range of `count` days. */
const labelEvery = (count: number): number =>
  count <= 7 ? 1 : count <= 30 ? 5 : 15;

const MARKER =
  "pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface";

interface EnquiryChartProps {
  /** Oldest first, one per day. */
  points: EnquiryAnalyticsPoint[];
}

/**
 * Enquiries per day, one line per form.
 *
 * The lines are an SVG stretched to the plot; everything with text or a fixed
 * size (axis labels, markers, tooltip) is HTML placed by percentage over it, so
 * nothing is distorted and the chart needs no measuring to be responsive.
 *
 * Pointing anywhere on the plot reads the nearest day. With the plot focused,
 * the arrow keys step through the days.
 */
export default function EnquiryChart({ points }: EnquiryChartProps) {
  const [active, setActive] = useState<number | null>(null);

  const count = points.length;
  const last = count - 1;

  if (count === 0) return null;

  const { top, ticks } = axisScale(
    Math.max(
      ...points.flatMap((point) => [point.enrollment, point.contact])
    )
  );

  const every = labelEvery(count);
  const labelled = points
    .map((_, index) => index)
    .filter((index) => (last - index) % every === 0);

  const read = active === null ? null : points[active];

  // The line ends are always marked; the day being read is marked as well.
  const marked =
    active === null || active === last ? [last] : [last, active];

  const labelTops = spreadLabels(
    SERIES.map((series) => pointY(points[last][series.key], top)),
    LABEL_GAP
  );

  const follow = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const share = (event.clientX - box.left) / box.width;

    setActive(
      Math.round(Math.min(1, Math.max(0, share)) * last)
    );
  };

  const step = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = active ?? last;

    const to =
      event.key === "ArrowLeft"
        ? from - 1
        : event.key === "ArrowRight"
          ? from + 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;

    if (to === null) return;

    event.preventDefault();
    setActive(Math.min(last, Math.max(0, to)));
  };

  return (
    <div>
      <div className="flex">
        {/* Y axis */}
        <div
          aria-hidden="true"
          className={`relative shrink-0 ${AXIS_GUTTER} ${PLOT_HEIGHT}`}
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              style={{ top: `${pointY(tick, top)}%` }}
              className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-muted"
            >
              {tick}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div
          role="group"
          tabIndex={0}
          aria-label={`Enquiries per day over the last ${count} days. Use the left and right arrow keys to read each day.`}
          onPointerMove={follow}
          onPointerDown={follow}
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive((current) => current ?? last)}
          onBlur={() => setActive(null)}
          onKeyDown={step}
          className={`relative min-w-0 flex-1 cursor-crosshair touch-pan-y rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${PLOT_HEIGHT}`}
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              aria-hidden="true"
              style={{ top: `${pointY(tick, top)}%` }}
              className={`pointer-events-none absolute inset-x-0 h-px ${
                tick === 0 ? "bg-border" : "bg-border/60"
              }`}
            />
          ))}

          {active !== null && (
            <span
              aria-hidden="true"
              style={{ left: `${pointX(active, count)}%` }}
              className="pointer-events-none absolute inset-y-0 w-px -translate-x-1/2 bg-muted/50"
            />
          )}

          <svg
            aria-hidden="true"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          >
            {SERIES.map((series) => {
              const values = points.map((point) => point[series.key]);

              return (
                <g key={series.key}>
                  <path
                    d={areaPath(values, top)}
                    fillOpacity={0.1}
                    style={{ fill: series.color }}
                  />
                  <path
                    d={linePath(values, top)}
                    fill="none"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ stroke: series.color }}
                  />
                </g>
              );
            })}
          </svg>

          {marked.flatMap((index) =>
            SERIES.map((series) => (
              <span
                key={`${series.key}-${index}`}
                aria-hidden="true"
                style={{
                  left: `${pointX(index, count)}%`,
                  top: `${pointY(points[index][series.key], top)}%`,
                  backgroundColor: series.color,
                }}
                className={MARKER}
              />
            ))
          )}

          {read && active !== null && (
            <div
              aria-hidden="true"
              style={{ left: `${pointX(active, count)}%` }}
              className={`pointer-events-none absolute top-1 z-10 min-w-32 rounded-xl bg-surface px-3 py-2.5 text-xs shadow-[0_12px_32px_-12px_rgba(15,23,42,0.45)] ring-1 ring-border dark:bg-[#1a2444] ${
                pointX(active, count) > 50
                  ? "-ml-3 -translate-x-full"
                  : "ml-3"
              }`}
            >
              <p className="whitespace-nowrap font-semibold text-muted">
                {formatDay(read.date, true)}
              </p>

              <ul className="mt-2 space-y-1.5">
                {SERIES.map((series) => (
                  <li
                    key={series.key}
                    className="flex items-center gap-2"
                  >
                    <span
                      style={{ backgroundColor: series.color }}
                      className="h-0.5 w-3 shrink-0 rounded-full"
                    />
                    <span className="font-bold tabular-nums text-text">
                      {read[series.key]}
                    </span>
                    <span className="text-muted">{series.label}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-2 flex items-center gap-2 border-t border-border pt-2">
                <span className="w-3 shrink-0" />
                <span className="font-bold tabular-nums text-text">
                  {read.enrollment + read.contact}
                </span>
                <span className="text-muted">Total</span>
              </p>
            </div>
          )}
        </div>

        {/* The series' names, at the end of their lines */}
        <div
          aria-hidden="true"
          className={`relative hidden shrink-0 sm:block ${LABEL_GUTTER} ${PLOT_HEIGHT}`}
        >
          {SERIES.map((series, index) => (
            <span
              key={series.key}
              style={{ top: `${labelTops[index]}%` }}
              className="absolute left-2.5 -translate-y-1/2 text-[11px] font-medium text-muted"
            >
              {series.label}
            </span>
          ))}
        </div>
      </div>

      {/* X axis */}
      <div className="mt-2 flex">
        <div className={`shrink-0 ${AXIS_GUTTER}`} />

        <div aria-hidden="true" className="relative h-4 min-w-0 flex-1">
          {labelled.map((index) => (
            <span
              key={index}
              style={{ left: `${pointX(index, count)}%` }}
              className={`absolute top-0 whitespace-nowrap text-[10px] tabular-nums text-muted ${
                index === 0
                  ? ""
                  : index === last
                    ? "-translate-x-full"
                    : "-translate-x-1/2"
              }`}
            >
              {formatDay(points[index].date)}
            </span>
          ))}
        </div>

        <div className={`hidden shrink-0 sm:block ${LABEL_GUTTER}`} />
      </div>

      {/* What the tooltip shows, for a screen reader stepping with the keys */}
      <p aria-live="polite" className="sr-only">
        {read
          ? `${formatDay(read.date, true)}: ${SERIES.map(
              (series) => `${read[series.key]} ${series.label}`
            ).join(", ")}`
          : ""}
      </p>
    </div>
  );
}
