"use client";

import { ArrowUpDown, RotateCcw } from "lucide-react";

import SearchInput from "@/components/admin/ui/SearchInput";
import SegmentedTabs from "@/components/admin/ui/SegmentedTabs";
import Select from "@/components/admin/ui/Select";
import { buttonClass } from "@/components/admin/ui/styles";

import {
  BLOG_CATEGORIES,
  BLOG_SORT_OPTIONS,
  BLOG_STATUS_FILTERS,
  type BlogSortOption,
  type BlogStatusFilter,
} from "./blog-utils";

interface BlogFiltersProps {
  search: string;
  statusFilter: BlogStatusFilter;
  categoryFilter: string;
  sortBy: BlogSortOption;

  resultCount: number;
  hasActiveFilters: boolean;
  loading: boolean;

  onSearchChange: (value: string) => void;
  onStatusChange: (value: BlogStatusFilter) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: BlogSortOption) => void;
  onReset: () => void;
}

export default function BlogFilters({
  search,
  statusFilter,
  categoryFilter,
  sortBy,
  resultCount,
  hasActiveFilters,
  loading,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onReset,
}: BlogFiltersProps) {
  return (
    <section className="px-3 pt-3.5 min-[360px]:px-4 min-[360px]:pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <div className="flex flex-col gap-2 rounded-xl bg-surface p-2.5 shadow-sm ring-1 ring-inset ring-border min-[360px]:gap-2.5 min-[360px]:rounded-2xl min-[360px]:p-3 sm:gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-2 min-[360px]:gap-2.5 sm:gap-3 md:flex-row md:items-center">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search blogs..."
            label="Search blogs"
            className="w-full md:w-72"
          />

          <SegmentedTabs
            label="Filter by status"
            options={BLOG_STATUS_FILTERS}
            value={statusFilter}
            onChange={onStatusChange}
            size="sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <div className="min-w-0 flex-1 sm:min-w-40 sm:flex-none">
            <Select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(event) =>
                onCategoryChange(event.target.value)
              }
            >
              <option value="All">All categories</option>

              {BLOG_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </div>

          <div className="min-w-0 flex-1 sm:min-w-40 sm:flex-none">
            <Select
              aria-label="Sort blogs"
              icon={ArrowUpDown}
              value={sortBy}
              onChange={(event) =>
                onSortChange(event.target.value as BlogSortOption)
              }
            >
              {BLOG_SORT_OPTIONS.map(({ value, label }) => (
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
              className={`${buttonClass("secondary", "lg")} h-9 px-2.5 text-xs min-[360px]:h-9.5 min-[360px]:px-3 sm:h-11 sm:px-4 sm:text-sm`}
            >
              <RotateCcw className="size-3 min-[360px]:size-3.5 sm:size-[14px]" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <p className="mt-2 px-1 text-[11px] text-muted min-[360px]:mt-2.5 min-[360px]:text-xs sm:mt-3" aria-live="polite">
        {loading ? (
          "Loading blogs..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">
              {resultCount}
            </span>{" "}
            {resultCount === 1 ? "article" : "articles"}
            {hasActiveFilters && " (filtered)"}
          </>
        )}
      </p>
    </section>
  );
}
