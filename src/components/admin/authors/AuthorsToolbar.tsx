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
    <section className="flex flex-col gap-2 px-3 pt-3.5 min-[360px]:gap-2.5 min-[360px]:px-4 min-[360px]:pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:pt-5 lg:px-8">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search by name, designation or bio..."
        label="Search authors"
        className="w-full rounded-xl shadow-sm sm:max-w-sm"
      />

      <p className="px-1 text-[11px] text-muted min-[360px]:text-xs" aria-live="polite">
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
