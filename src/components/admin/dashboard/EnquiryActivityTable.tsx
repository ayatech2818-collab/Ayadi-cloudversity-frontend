"use client";

import type { EnquiryAnalyticsPoint } from "@/lib/api/dashboard";

import { SERIES, formatDay } from "./chart-utils";

const CELL = "px-4 py-2 text-right tabular-nums";

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
    <div className="h-[232px] overflow-y-auto rounded-xl ring-1 ring-border sm:h-[264px]">
      <table className="w-full text-xs">
        <caption className="sr-only">
          Enquiries per day over the last {points.length} days
        </caption>

        <thead className="sticky top-0 bg-page text-[11px] font-bold uppercase tracking-[0.1em] text-muted">
          <tr>
            <th scope="col" className="px-4 py-2.5 text-left">
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
                className="whitespace-nowrap px-4 py-2 text-left font-medium text-text"
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
