"use client";

import {
  CalendarRange,
  ChevronDown,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

export type GalleryStatusFilter = "All" | "published" | "draft";

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
    <section className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative w-full lg:max-w-xs xl:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(event.target.value)
            }
            placeholder="Search galleries..."
            className="
              h-10 w-full rounded-xl
              border border-border bg-page/50
              pl-10 pr-9 text-sm text-text
              outline-none transition-all
              placeholder:text-muted/60
              focus:border-primary
              focus:bg-surface
              focus:ring-4 focus:ring-primary/10
            "
          />

          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              aria-label="Filter by publication status"
              value={statusFilter}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as GalleryStatusFilter
                )
              }
              className="h-10 cursor-pointer appearance-none rounded-xl border border-border bg-surface pl-3.5 pr-8 text-xs font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="All">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>

          {/* Event date range */}
          <div className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-surface pl-3 pr-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
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
              className="w-[7.5rem] bg-transparent text-xs font-semibold text-text outline-none"
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
              className="w-[7.5rem] bg-transparent text-xs font-semibold text-text outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-page px-3 text-xs font-medium text-text hover:bg-page/80"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted">
        <div>
          {loading ? (
            "Fetching galleries..."
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
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="font-medium text-primary hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>
    </section>
  );
}
