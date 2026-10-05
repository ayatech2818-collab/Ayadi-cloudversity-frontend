"use client";

import { CalendarRange, RotateCcw } from "lucide-react";

import SearchInput from "@/components/admin/ui/SearchInput";
import SegmentedTabs from "@/components/admin/ui/SegmentedTabs";
import {
  buttonClass,
  inputGroupClass,
} from "@/components/admin/ui/styles";

import {
  GALLERY_STATUS_FILTERS,
  type GalleryStatusFilter,
} from "./gallery-utils";

interface GalleryFiltersProps {
  search: string;
  statusFilter: GalleryStatusFilter;
  dateFrom: string;
  dateTo: string;

  resultCount: number;
  hasActiveFilters: boolean;
  loading: boolean;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: GalleryStatusFilter) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onReset: () => void;
}

const DATE_INPUT =
  "w-[7.5rem] bg-transparent text-xs font-semibold text-text outline-none";

export default function GalleryFilters({
  search,
  statusFilter,
  dateFrom,
  dateTo,
  resultCount,
  hasActiveFilters,
  loading,
  onSearchChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onReset,
}: GalleryFiltersProps) {
  return (
    <section className="px-4 pt-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-inset ring-border xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search galleries..."
            label="Search galleries"
            className="w-full md:w-72"
          />

          <SegmentedTabs
            label="Filter by status"
            options={GALLERY_STATUS_FILTERS}
            value={statusFilter}
            onChange={onStatusChange}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Event date range */}
          <div
            className={`flex h-11 items-center gap-1.5 px-3 ${inputGroupClass()}`}
          >
            <CalendarRange
              size={14}
              className="shrink-0 text-muted"
            />

            <input
              type="date"
              aria-label="Event date from"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) =>
                onDateFromChange(event.target.value)
              }
              className={DATE_INPUT}
            />

            <span className="text-xs text-muted">–</span>

            <input
              type="date"
              aria-label="Event date to"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) =>
                onDateToChange(event.target.value)
              }
              className={DATE_INPUT}
            />
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
          "Loading galleries..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">
              {resultCount}
            </span>{" "}
            {resultCount === 1 ? "gallery" : "galleries"}
            {hasActiveFilters && " (filtered)"}
          </>
        )}
      </p>
    </section>
  );
}
