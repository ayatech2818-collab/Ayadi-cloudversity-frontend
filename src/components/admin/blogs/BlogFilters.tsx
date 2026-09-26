"use client";

import {
  ArrowUpDown,
  ChevronDown,
  RotateCcw,
  Search,
  X,
} from "lucide-react";

export type SortOption =
  | "newest"
  | "oldest"
  | "title-asc"
  | "title-desc";

interface BlogFiltersProps {
  search: string;
  statusFilter: "All" | "published" | "draft";
  categoryFilter: string;
  sortBy: SortOption;
  categories: string[];

  resultCount: number;
  hasActiveFilters: boolean;

  onSearchChange: (value: string) => void;
  onStatusChange: (
    value: "All" | "published" | "draft"
  ) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onReset: () => void;
}

export default function BlogFilters({
  search,
  statusFilter,
  categoryFilter,
  sortBy,
  categories,
  resultCount,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onSortChange,
  onReset,
}: BlogFiltersProps) {
  return (
    <section className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs md:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search blogs..."
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
              aria-label="Filter by Status"
              value={statusFilter}
              onChange={(event) =>
                onStatusChange(
                  event.target.value as
                    | "All"
                    | "published"
                    | "draft"
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

          <div className="relative">
            <select
              aria-label="Filter by Category"
              value={categoryFilter}
              onChange={(event) =>
                onCategoryChange(event.target.value)
              }
              className="h-10 cursor-pointer appearance-none rounded-xl border border-border bg-surface pl-3.5 pr-8 text-xs font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "All"
                    ? "All Categories"
                    : category}
                </option>
              ))}
            </select>

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>

          <div className="relative">
            <select
              aria-label="Sort blogs"
              value={sortBy}
              onChange={(event) =>
                onSortChange(
                  event.target.value as SortOption
                )
              }
              className="h-10 cursor-pointer appearance-none rounded-xl border border-border bg-surface pl-8 pr-8 text-xs font-semibold text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="title-asc">
                Title: A to Z
              </option>
              <option value="title-desc">
                Title: Z to A
              </option>
            </select>

            <ArrowUpDown
              size={13}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />

            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-border bg-page px-3 text-xs font-medium text-text hover:bg-page/80"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">
                Reset
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Count */}
      <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted">
        <div>
          Showing{" "}
          <span className="font-semibold text-text">
            {resultCount}
          </span>{" "}
          {resultCount === 1 ? "article" : "articles"}
          {hasActiveFilters && " (filtered)"}
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