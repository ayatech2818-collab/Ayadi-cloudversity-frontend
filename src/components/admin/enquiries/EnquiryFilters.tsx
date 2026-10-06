"use client";

import { ArrowUpDown, Filter, RotateCcw } from "lucide-react";

import SearchInput from "@/components/admin/ui/SearchInput";
import SegmentedTabs from "@/components/admin/ui/SegmentedTabs";
import Select from "@/components/admin/ui/Select";
import { buttonClass } from "@/components/admin/ui/styles";

import {
  ENQUIRY_SORT_OPTIONS,
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_TYPES,
  ENQUIRY_TYPE_LABELS,
  type EnquiryCounts,
  type EnquirySortOption,
  type EnquiryStatusFilter,
  type EnquiryTypeFilter,
} from "./enquiry-utils";

interface EnquiryFiltersProps {
  search: string;
  typeFilter: EnquiryTypeFilter;
  statusFilter: EnquiryStatusFilter;
  sortBy: EnquirySortOption;

  /**
   * How many enquiries of the chosen type sit in each status, for the tabs.
   * `null` while the numbers are loading.
   */
  statusCounts: EnquiryCounts | null;

  resultCount: number;
  hasActiveFilters: boolean;
  loading: boolean;

  onSearchChange: (value: string) => void;
  onTypeChange: (value: EnquiryTypeFilter) => void;
  onStatusChange: (value: EnquiryStatusFilter) => void;
  onSortChange: (value: EnquirySortOption) => void;
  onReset: () => void;
}

/** Each control here is sent to the backend; nothing is filtered in the page. */
export default function EnquiryFilters({
  search,
  typeFilter,
  statusFilter,
  sortBy,
  statusCounts,
  resultCount,
  hasActiveFilters,
  loading,
  onSearchChange,
  onTypeChange,
  onStatusChange,
  onSortChange,
  onReset,
}: EnquiryFiltersProps) {
  const statusOptions: {
    value: EnquiryStatusFilter;
    label: string;
    count?: number;
  }[] = [
    { value: "All", label: "All", count: statusCounts?.total },
    ...ENQUIRY_STATUSES.map((status) => ({
      value: status,
      label: ENQUIRY_STATUS_LABELS[status],
      count: statusCounts?.byStatus[status],
    })),
  ];

  return (
    <section className="px-4 pt-5 sm:px-6 lg:px-8">
      <div className="space-y-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-inset ring-border">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <SegmentedTabs
            label="Filter by status"
            options={statusOptions}
            value={statusFilter}
            onChange={onStatusChange}
          />

          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search name, email, phone or city..."
            label="Search enquiries"
            className="w-full xl:w-80"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <div className="min-w-40 flex-1 sm:flex-none">
            <Select
              aria-label="Filter by type"
              icon={Filter}
              value={typeFilter}
              onChange={(event) =>
                onTypeChange(event.target.value as EnquiryTypeFilter)
              }
            >
              <option value="All">All types</option>

              {ENQUIRY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {ENQUIRY_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-40 flex-1 sm:flex-none">
            <Select
              aria-label="Sort enquiries"
              icon={ArrowUpDown}
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as EnquirySortOption)
              }
            >
              {ENQUIRY_SORT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className={buttonClass("secondary", "lg")}
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <p className="mt-3 px-1 text-xs text-muted" aria-live="polite">
        {loading ? (
          "Loading enquiries..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">
              {resultCount}
            </span>{" "}
            {resultCount === 1 ? "enquiry" : "enquiries"}
            {hasActiveFilters && " (filtered)"}
          </>
        )}
      </p>
    </section>
  );
}
