"use client";

import { FolderTree, GitBranch } from "lucide-react";

import BrandTabs, {
  type BrandOption,
} from "@/components/admin/categories/BrandTabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import Select from "@/components/admin/ui/Select";

interface MiniCategoryFiltersProps {
  /** One tab per brand, each with its number of mini categories. */
  brandOptions: BrandOption[];
  selectedBrandId: string;

  /** The selected brand's main categories, each with its number of mini categories. */
  categoryOptions: BrandOption[];
  selectedCategoryId: string;

  /** The selected category's sub categories, each with its number of mini categories. */
  subcategoryOptions: BrandOption[];
  selectedSubcategoryId: string;

  search: string;
  resultCount: number;
  loading: boolean;

  onBrandChange: (brandId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  onSearchChange: (value: string) => void;
}

/** Three steps down to a list: pick the brand, main category, then sub category. */
export default function MiniCategoryFilters({
  brandOptions,
  selectedBrandId,
  categoryOptions,
  selectedCategoryId,
  subcategoryOptions,
  selectedSubcategoryId,
  search,
  resultCount,
  loading,
  onBrandChange,
  onCategoryChange,
  onSubcategoryChange,
  onSearchChange,
}: MiniCategoryFiltersProps) {
  return (
    <section className="px-4 pt-5 sm:px-6 lg:px-8">
      <div className="space-y-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-inset ring-border">
        <BrandTabs
          options={brandOptions}
          value={selectedBrandId}
          loading={loading}
          onChange={onBrandChange}
        />

        <div className="flex flex-col gap-3 border-t border-border pt-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Main category */}
            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
              <label
                htmlFor="minicategory-main-category"
                className="shrink-0 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted"
              >
                Main category
              </label>

              <div className="w-full sm:w-56">
                <Select
                  id="minicategory-main-category"
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

            {/* Sub category */}
            <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2.5">
              <label
                htmlFor="minicategory-subcategory"
                className="shrink-0 px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted"
              >
                Sub category
              </label>

              <div className="w-full sm:w-56">
                <Select
                  id="minicategory-subcategory"
                  icon={GitBranch}
                  value={selectedSubcategoryId}
                  disabled={subcategoryOptions.length === 0}
                  onChange={(event) =>
                    onSubcategoryChange(event.target.value)
                  }
                >
                  {subcategoryOptions.length === 0 ? (
                    <option value="">
                      {loading
                        ? "Loading..."
                        : "No subcategories available"}
                    </option>
                  ) : (
                    subcategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </option>
                    ))
                  )}
                </Select>
              </div>
            </div>
          </div>

          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search mini categories..."
            label="Search mini categories"
            className="w-full xl:w-72"
          />
        </div>
      </div>

      {/* Count */}
      <p className="mt-3 px-1 text-xs text-muted" aria-live="polite">
        {loading ? (
          "Loading mini categories..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">
              {resultCount}
            </span>{" "}
            {resultCount === 1 ? "mini category" : "mini categories"}
            {search.trim() && " (filtered)"}
          </>
        )}
      </p>
    </section>
  );
}
