"use client";

import { FolderTree } from "lucide-react";

import BrandTabs, {
  type BrandOption,
} from "@/components/admin/categories/BrandTabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import Select from "@/components/admin/ui/Select";

interface SubcategoryFiltersProps {
  /** One tab per brand, each with its number of sub categories. */
  brandOptions: BrandOption[];
  selectedBrandId: string;

  /** The selected brand's main categories, each with its number of sub categories. */
  categoryOptions: BrandOption[];
  selectedCategoryId: string;

  search: string;
  resultCount: number;
  loading: boolean;

  onBrandChange: (brandId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (value: string) => void;
}

/** Two steps down to a list: pick the brand, then one of its main categories. */
export default function SubcategoryFilters({
  brandOptions,
  selectedBrandId,
  categoryOptions,
  selectedCategoryId,
  search,
  resultCount,
  loading,
  onBrandChange,
  onCategoryChange,
  onSearchChange,
}: SubcategoryFiltersProps) {
  return (
    <section className="px-4 pt-5 sm:px-6 lg:px-8">
      <div className="space-y-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-inset ring-border">
        <BrandTabs
          options={brandOptions}
          value={selectedBrandId}
          loading={loading}
          onChange={onBrandChange}
        />

        <div className="flex flex-col gap-3 border-t border-border pt-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Main category */}
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <label
              htmlFor="subcategory-main-category"
              className="shrink-0 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted"
            >
              Main category
            </label>

            <div className="sm:w-80">
              <Select
                id="subcategory-main-category"
                icon={FolderTree}
                value={selectedCategoryId}
                disabled={categoryOptions.length === 0}
                onChange={(event) =>
                  onCategoryChange(event.target.value)
                }
              >
                {categoryOptions.length === 0 ? (
                  <option value="">
                    {loading
                      ? "Loading..."
                      : "No categories available"}
                  </option>
                ) : (
                  categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label} ({option.count})
                    </option>
                  ))
                )}
              </Select>
            </div>
          </div>

          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search sub categories..."
            label="Search sub categories"
            className="w-full lg:w-72"
          />
        </div>
      </div>

      {/* Count */}
      <p className="mt-3 px-1 text-xs text-muted" aria-live="polite">
        {loading ? (
          "Loading sub categories..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">
              {resultCount}
            </span>{" "}
            {resultCount === 1 ? "sub category" : "sub categories"}
            {search.trim() && " (filtered)"}
          </>
        )}
      </p>
    </section>
  );
}
