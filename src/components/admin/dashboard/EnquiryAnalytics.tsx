"use client";

import { useState } from "react";
import {
  ChartLine,
  LoaderCircle,
  RotateCcw,
  ServerCrash,
  Table2,
} from "lucide-react";

import EmptyState from "@/components/admin/ui/EmptyState";
import SegmentedTabs from "@/components/admin/ui/SegmentedTabs";
import { iconButtonClass } from "@/components/admin/ui/styles";
import type { EnquiryAnalytics as EnquiryAnalyticsData } from "@/lib/api/dashboard";

import DashboardCard from "./DashboardCard";
import EnquiryActivityTable from "./EnquiryActivityTable";
import EnquiryChart from "./EnquiryChart";
import { SERIES } from "./chart-utils";
import { INK, PULSE } from "./styles";

/** The ranges the analytics endpoint answers for. */
export type AnalyticsRange = EnquiryAnalyticsData["days"];

const RANGES: { value: string; label: string; days: AnalyticsRange }[] = [
  { value: "7", label: "7 Days", days: 7 },
  { value: "30", label: "30 Days", days: 30 },
  { value: "90", label: "90 Days", days: 90 },
];

const BODY = "px-5 pb-5 pt-5 sm:px-6 sm:pb-6";

interface EnquiryAnalyticsProps {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
  /**
   * The last answer received, `null` before the first. While another range is
   * on its way this stays on screen, dimmed, so the card keeps its shape.
   */
  analytics: EnquiryAnalyticsData | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

/**
 * Enquiries over time: a range switch, the totals for that range (which double
 * as the chart's legend) and the chart itself, or its table.
 */
export default function EnquiryAnalytics({
  range,
  onRangeChange,
  analytics,
  loading,
  error,
  onRetry,
}: EnquiryAnalyticsProps) {
  const [asTable, setAsTable] = useState(false);

  const ViewIcon = asTable ? ChartLine : Table2;
  const viewLabel = asTable ? "Show as a chart" : "Show as a table";

  return (
    <DashboardCard
      title="Enquiries Analytics"
      description="Enquiries received per day, by website form"
      action={
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <SegmentedTabs
            label="Time range"
            options={RANGES}
            value={String(range)}
            onChange={(value) => {
              const next = RANGES.find(
                (option) => option.value === value
              );

              if (next) onRangeChange(next.days);
            }}
          />

          <button
            type="button"
            onClick={() => setAsTable((current) => !current)}
            disabled={Boolean(error) || !analytics}
            aria-label={viewLabel}
            title={viewLabel}
            className={iconButtonClass()}
          >
            <ViewIcon size={16} />
          </button>
        </div>
      }
    >
      {error ? (
        <div className={BODY}>
          <EmptyState
            compact
            danger
            icon={ServerCrash}
            title="Unable to load enquiry analytics"
            text={error}
            action={{
              label: "Retry",
              icon: RotateCcw,
              onClick: onRetry,
              tone: "secondary",
            }}
          />
        </div>
      ) : !analytics ? (
        // First load: the totals and the plot, as blanks of the same size.
        <div aria-hidden="true" className={BODY}>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <span className={`block h-[30px] w-44 ${PULSE}`} />
            <span className={`block h-4 w-48 ${PULSE}`} />
          </div>

          <div
            className={`mt-6 h-[232px] rounded-xl sm:h-[264px] ${PULSE}`}
          />
        </div>
      ) : (
        <div
          aria-busy={loading}
          className={`transition-opacity duration-200 ${BODY} ${
            loading ? "opacity-50" : ""
          }`}
        >
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <p className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold leading-none tracking-[-0.03em] ${INK}`}
              >
                {analytics.total.toLocaleString("en-IN")}
              </span>

              <span className="text-xs text-muted">
                enquiries in the last {analytics.days} days
              </span>

              {loading && (
                <LoaderCircle
                  size={13}
                  role="status"
                  aria-label="Loading the new range"
                  className="animate-spin self-center text-muted"
                />
              )}
            </p>

            <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
              {SERIES.map((series) => (
                <li key={series.key} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: series.color }}
                    className="h-0.5 w-4 rounded-full"
                  />
                  <span className="text-muted">{series.label}</span>
                  <span className="font-bold tabular-nums text-text">
                    {analytics[series.key].toLocaleString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            {asTable ? (
              <EnquiryActivityTable points={analytics.data} />
            ) : (
              // Keyed by range, so a new range starts with nothing being read.
              <EnquiryChart
                key={analytics.days}
                points={analytics.data}
              />
            )}
          </div>
        </div>
      )}
    </DashboardCard>
  );
}
