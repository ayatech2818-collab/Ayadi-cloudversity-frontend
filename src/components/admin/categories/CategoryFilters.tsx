"use client";

import SearchInput from "@/components/admin/ui/SearchInput";

import BrandTabs, { type BrandOption } from "./BrandTabs";

interface CategoryFiltersProps {
  /** One tab per brand, each with its number of categories. */
  brandOptions: BrandOption[];
  selectedBrandId: string;
  search: string;

  resultCount: number;
  loading: boolean;

  onBrandChange: (brandId: string) => void;
  onSearchChange: (value: string) => void;
}

export default function CategoryFilters({
  brandOptions,
  selectedBrandId,
  search,
  resultCount,
  loading,
  onBrandChange,
  onSearchChange,
}: CategoryFiltersProps) {
  return (
    <section className="px-4 pt-5 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-inset ring-border lg:flex-row lg:items-center lg:justify-between">
        <BrandTabs
          options={brandOptions}
          value={selectedBrandId}
          loading={loading}
          onChange={onBrandChange}
        />

        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search categories..."
          label="Search categories"
          className="w-full lg:w-72"
        />
      </div>

      {/* Count */}
      <p className="mt-3 px-1 text-xs text-muted" aria-live="polite">
        {loading ? (
          "Loading categories..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">
              {resultCount}
            </span>{" "}
            {resultCount === 1 ? "category" : "categories"}
            {search.trim() && " (filtered)"}
          </>
        )}
      </p>
    </section>
  );
}
