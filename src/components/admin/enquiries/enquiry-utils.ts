import type {
  Enquiry,
  EnquiryStatus,
  EnquiryType,
} from "@/lib/api/enquiry";

// =========================================================
// LAYOUT
// =========================================================

/** Shared by the grid and its skeleton so nothing jumps when data lands. */
export const ENQUIRY_GRID =
  "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4";

// =========================================================
// FILTERS
// =========================================================

export type EnquiryTypeFilter = "All" | EnquiryType;

export type EnquiryStatusFilter = "All" | EnquiryStatus;

export type EnquirySortOption =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc";

export const ENQUIRY_TYPES: EnquiryType[] = ["contact", "enrollment"];

/** In the order an enquiry moves through them. */
export const ENQUIRY_STATUSES: EnquiryStatus[] = [
  "new",
  "contacted",
  "converted",
  "closed",
];

export const ENQUIRY_TYPE_LABELS: Record<EnquiryType, string> = {
  contact: "Contact",
  enrollment: "Enrollment",
};

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  converted: "Converted",
  closed: "Closed",
};

export const ENQUIRY_SORT_OPTIONS: {
  value: EnquirySortOption;
  label: string;
}[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
];

// =========================================================
// COUNTS
// =========================================================

export interface EnquiryCounts {
  total: number;
  byType: Record<EnquiryType, number>;
  byStatus: Record<EnquiryStatus, number>;
}

/**
 * Tallies the unfiltered list for the header and the status tabs. Give it a
 * type to count that type alone. It only counts: the enquiries on screen are
 * always the backend's answer to the current filters.
 */
export const countEnquiries = (
  enquiries: Enquiry[],
  type?: EnquiryType
): EnquiryCounts => {
  const counts: EnquiryCounts = {
    total: 0,
    byType: { contact: 0, enrollment: 0 },
    byStatus: { new: 0, contacted: 0, converted: 0, closed: 0 },
  };

  for (const enquiry of enquiries) {
    if (type && enquiry.type !== type) continue;

    counts.total += 1;
    counts.byType[enquiry.type] += 1;
    counts.byStatus[enquiry.status] += 1;
  }

  return counts;
};

// =========================================================
// TEXT
// =========================================================

export const formatEnquiryDate = (value: string): string =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/**
 * A date of birth is a plain calendar day ("2001-04-12"). Read as local
 * midnight, so no time zone can move it to the day before.
 */
export const formatBirthDate = (value: string): string =>
  formatEnquiryDate(`${value}T00:00:00`);

export const getEnquiryName = (
  enquiry: Pick<Enquiry, "first_name" | "last_name">
): string =>
  [enquiry.first_name, enquiry.last_name].filter(Boolean).join(" ");

/** "Kochi, India", or whichever of the two was given. */
export const getEnquiryLocation = (
  enquiry: Pick<Enquiry, "city" | "country">
): string => [enquiry.city, enquiry.country].filter(Boolean).join(", ");
