"use client";

import { Search, X } from "lucide-react";

import { inputClass } from "@/components/admin/ui/styles";

interface AuthorsToolbarProps {
  search: string;
  resultCount: number;
  totalCount: number;
  loading: boolean;
  onSearchChange: (value: string) => void;
}

export default function AuthorsToolbar({
  search,
  resultCount,
  totalCount,
  loading,
  onSearchChange,
}: AuthorsToolbarProps) {
  return (
    <section className="flex flex-col gap-3 px-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
      <div className="relative w-full sm:max-w-sm">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
        />

        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name, designation or bio..."
          aria-label="Search authors"
          className={`${inputClass()} h-11 pl-10 pr-10 shadow-sm`}
        />

        {search && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-muted transition-colors hover:bg-page hover:text-text"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <p className="px-1 text-xs text-muted" aria-live="polite">
        {loading ? (
          "Loading authors..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">
              {resultCount}
            </span>
            {search.trim() && ` of ${totalCount}`}{" "}
            {totalCount === 1 ? "author" : "authors"}
          </>
        )}
      </p>
    </section>
  );
}
