"use client";

import { useEffect, useState } from "react";
import { MotionConfig } from "framer-motion";
import { RotateCcw, ServerCrash } from "lucide-react";

import ContentOverview from "@/components/admin/dashboard/ContentOverview";
import CourseOverview from "@/components/admin/dashboard/CourseOverview";
import DashboardHeader from "@/components/admin/dashboard/DashboardHeader";
import EnquiryAnalytics, {
  type AnalyticsRange,
} from "@/components/admin/dashboard/EnquiryAnalytics";
import KpiCards from "@/components/admin/dashboard/KpiCards";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import RecentEnquiries from "@/components/admin/dashboard/RecentEnquiries";
import Reveal from "@/components/admin/dashboard/Reveal";
import { CHART_COLORS } from "@/components/admin/dashboard/styles";
import EmptyState from "@/components/admin/ui/EmptyState";

import {
  getDashboardEnquiryAnalytics,
  getDashboardSummary,
  getRecentDashboardEnquiries,
  type DashboardRecentEnquiry,
  type DashboardSummary,
  type EnquiryAnalytics as EnquiryAnalyticsData,
} from "@/lib/api/dashboard";
import { getApiErrorMessage } from "@/lib/api/errors";

const RECENT_LIMIT = 7;

/**
 * The dashboard home. Everything on it comes from the dashboard API.
 *
 * From `xl` it is two columns, the enquiries on the left and the smaller
 * sections down the right. The recent enquiries on one side and the two
 * overview cards on the other take up whatever height is spare, so the
 * columns end together. Below `xl` the right-hand sections sit side by side,
 * then stack.
 */
export default function AdminDashboard() {
  // =========================================================
  // DATA
  // =========================================================

  // Each is `null` until its first answer, which the sections show as blanks.
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [recent, setRecent] = useState<DashboardRecentEnquiry[] | null>(
    null
  );
  const [recentError, setRecentError] = useState<string | null>(null);

  const [range, setRange] = useState<AnalyticsRange>(7);
  const [analytics, setAnalytics] =
    useState<EnquiryAnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(
    null
  );

  // Bumped by a "Retry" to ask again.
  const [refreshToken, setRefreshToken] = useState(0);
  const [analyticsToken, setAnalyticsToken] = useState(0);

  // =========================================================
  // FETCH
  // =========================================================

  /**
   * The summary and the recent enquiries, side by side. Neither waits for the
   * other, and one failing leaves the other alone. With the analytics request
   * below, a load is three requests at once.
   */
  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        setSummaryError(null);

        const data = await getDashboardSummary();

        if (cancelled) return;

        setSummary(data);
      } catch (fetchError) {
        if (cancelled) return;

        console.error("Failed to fetch dashboard summary:", fetchError);

        setSummaryError(
          getApiErrorMessage(
            fetchError,
            "Something went wrong while loading the dashboard."
          )
        );
      }
    };

    const loadRecent = async () => {
      try {
        setRecentError(null);

        const data = await getRecentDashboardEnquiries(RECENT_LIMIT);

        if (cancelled) return;

        setRecent(data.items);
      } catch (fetchError) {
        if (cancelled) return;

        console.error("Failed to fetch recent enquiries:", fetchError);

        setRecentError(
          getApiErrorMessage(
            fetchError,
            "Something went wrong while fetching recent enquiries."
          )
        );
      }
    };

    loadSummary();
    loadRecent();

    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  /**
   * The chart's data, on its own: changing the range asks for the analytics
   * again and for nothing else.
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);

        const data = await getDashboardEnquiryAnalytics(range);

        // A slower earlier range must not overwrite the one now selected.
        if (cancelled) return;

        setAnalytics(data);
      } catch (fetchError) {
        if (cancelled) return;

        console.error("Failed to fetch enquiry analytics:", fetchError);

        setAnalyticsError(
          getApiErrorMessage(
            fetchError,
            "Something went wrong while fetching enquiry analytics."
          )
        );
      } finally {
        if (!cancelled) setAnalyticsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [range, analyticsToken]);

  // =========================================================
  // HANDLERS
  // =========================================================

  const retryAnalytics = () =>
    setAnalyticsToken((current) => current + 1);

  /**
   * Asks again for the summary and the recent enquiries, and for the chart
   * too if that had failed.
   */
  const retry = () => {
    setRefreshToken((current) => current + 1);

    if (analyticsError) retryAnalytics();
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={`mx-auto max-w-[1500px] space-y-5 p-4 sm:space-y-6 sm:p-6 lg:p-8 ${CHART_COLORS}`}
      >
        <Reveal>
          <DashboardHeader />
        </Reveal>

        {summaryError ? (
          // Without the summary most of the page has nothing to show.
          <EmptyState
            danger
            icon={ServerCrash}
            title="Unable to load the dashboard"
            text={summaryError}
            action={{
              label: "Retry",
              icon: RotateCcw,
              onClick: retry,
            }}
          />
        ) : (
          <>
            <Reveal order={1}>
              <KpiCards summary={summary} />
            </Reveal>

            <Reveal
              order={2}
              className="grid gap-5 sm:gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
            >
              <div className="flex min-w-0 flex-col gap-5 sm:gap-6">
                <EnquiryAnalytics
                  range={range}
                  onRangeChange={setRange}
                  analytics={analytics}
                  loading={analyticsLoading}
                  error={analyticsError}
                  onRetry={retryAnalytics}
                />

                <RecentEnquiries
                  enquiries={recent}
                  error={recentError}
                  onRetry={retry}
                  className="flex-1"
                />
              </div>

              <aside className="grid min-w-0 gap-5 sm:gap-6 md:grid-cols-2 xl:flex xl:flex-col">
                <QuickActions />
                <CourseOverview
                  courses={summary?.courses ?? null}
                  className="xl:grow"
                />
                <ContentOverview
                  summary={summary}
                  className="md:col-span-2 xl:grow"
                />
              </aside>
            </Reveal>
          </>
        )}
      </div>
    </MotionConfig>
  );
}
