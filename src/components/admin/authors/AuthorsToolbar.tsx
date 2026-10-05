"use client";

import SearchInput from "@/components/admin/ui/SearchInput";

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
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name, designation or bio..."
        label="Search authors"
        className="w-full rounded-xl shadow-sm sm:max-w-sm"
      />

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
