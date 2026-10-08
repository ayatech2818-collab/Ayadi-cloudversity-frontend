import { api } from "./client";

// =========================================================
// SUMMARY
// =========================================================

export interface DashboardCourseSummary {
  total: number;
  published: number;
  draft: number;
}

export interface DashboardEnquirySummary {
  total: number;
  new: number;
}

export interface DashboardBlogSummary {
  total: number;
  published: number;
  draft: number;
}

export interface DashboardGallerySummary {
  /** The number of galleries. Their media is counted in the two below. */
  total: number;
  images: number;
  videos: number;
}

export interface DashboardSummary {
  courses: DashboardCourseSummary;
  enquiries: DashboardEnquirySummary;
  blogs: DashboardBlogSummary;
  gallery: DashboardGallerySummary;
}

// =========================================================
// ENQUIRY ANALYTICS
// =========================================================

export interface EnquiryAnalyticsPoint {
  /** A calendar day, "2026-10-01". */
  date: string;
  enrollment: number;
  contact: number;
}

export interface EnquiryAnalytics {
  days: 7 | 30 | 90;
  total: number;
  enrollment: number;
  contact: number;
  /** One point per day in the range, oldest first, empty days included. */
  data: EnquiryAnalyticsPoint[];
}

// =========================================================
// RECENT ENQUIRIES
// =========================================================

export interface DashboardRecentEnquiry {
  id: string;
  type: string;
  first_name: string;
  last_name: string | null;
  email: string;
  status: string;
  created_at: string;
}

export interface DashboardRecentEnquiries {
  items: DashboardRecentEnquiry[];
}

// =========================================================
// REQUESTS
// =========================================================

/**
 * Counts for the dashboard's cards: courses, enquiries, blogs and gallery.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const response = await api.get<DashboardSummary>("/dashboard/summary");

  return response.data;
}

/**
 * Enquiries per day over the last 7, 30 or 90 days, split by website form.
 */
export async function getDashboardEnquiryAnalytics(
  days: 7 | 30 | 90 = 7
): Promise<EnquiryAnalytics> {
  const response = await api.get<EnquiryAnalytics>(
    "/dashboard/enquiries/analytics",
    {
      params: { days },
    }
  );

  return response.data;
}

/**
 * The newest enquiries, newest first.
 */
export async function getRecentDashboardEnquiries(
  limit = 7
): Promise<DashboardRecentEnquiries> {
  const response = await api.get<DashboardRecentEnquiries>(
    "/dashboard/enquiries/recent",
    {
      params: { limit },
    }
  );

  return response.data;
}
