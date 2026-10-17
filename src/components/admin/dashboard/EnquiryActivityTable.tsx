"use client";

import type { EnquiryAnalyticsPoint } from "@/lib/api/dashboard";

import { SERIES, formatDay } from "./chart-utils";

const CELL =
  "px-2.5 py-1.5 min-[360px]:px-3 min-[360px]:py-2 sm:px-4 sm:py-2 text-right tabular-nums";

interface EnquiryActivityTableProps {
  /** Oldest first, one per day. */
  points: EnquiryAnalyticsPoint[];
}

/**
 * The chart's numbers as a table, newest day first: the same data for anyone
 * who would rather read it than hover for it. As tall as the chart it replaces,
 * so the card does not jump when the two are swapped.
 */
export default function EnquiryActivityTable({
  points,
}: EnquiryActivityTableProps) {
  return (
    <div className="h-[170px] overflow-y-auto overflow-x-auto rounded-xl ring-1 ring-border min-[360px]:h-[190px] sm:h-[264px]">
      <table className="w-full text-[11px] min-[360px]:text-xs">
        <caption className="sr-only">
          Enquiries per day over the last {points.length} days
        </caption>

        <thead className="sticky top-0 bg-page text-[10px] font-bold uppercase tracking-[0.1em] text-muted min-[360px]:text-[11px]">
          <tr>
            <th
              scope="col"
              className="px-2.5 py-2 text-left min-[360px]:px-3 min-[360px]:py-2.5 sm:px-4"
            >
              Date
            </th>

            {SERIES.map((series) => (
              <th key={series.key} scope="col" className={CELL}>
                {series.label}
              </th>
            ))}

            <th scope="col" className={CELL}>
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {[...points].reverse().map((point) => (
            <tr key={point.date} className="border-t border-border">
              <th
                scope="row"
                className="whitespace-nowrap px-2.5 py-1.5 text-left font-medium text-text min-[360px]:px-3 min-[360px]:py-2 sm:px-4 sm:py-2"
              >
                {formatDay(point.date, true)}
              </th>

              {SERIES.map((series) => (
                <td key={series.key} className={`${CELL} text-muted`}>
                  {point[series.key]}
                </td>
              ))}

              <td className={`${CELL} font-bold text-text`}>
                {point.enrollment + point.contact}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
