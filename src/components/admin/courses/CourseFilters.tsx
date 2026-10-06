"use client";

import { Folder, FolderTree, RotateCcw } from "lucide-react";

import BrandTabs, {
  type BrandOption,
} from "@/components/admin/categories/BrandTabs";
import SearchInput from "@/components/admin/ui/SearchInput";
import SegmentedTabs from "@/components/admin/ui/SegmentedTabs";
import Select from "@/components/admin/ui/Select";
import { buttonClass } from "@/components/admin/ui/styles";

import {
  COURSE_STATUS_FILTERS,
  type CourseStatusFilter,
} from "./course-utils";

interface CourseFiltersProps {
  /** One tab per brand, each with its number of courses. */
  brandOptions: BrandOption[];
  selectedBrandId: string;

  /** The brand's main categories, each with its number of courses. */
  categoryOptions: BrandOption[];
  /** Empty for all of them. */
  selectedCategoryId: string;

  /** The chosen main category's sub categories, with their course counts. */
  subcategoryOptions: BrandOption[];
  /** Empty for all of them. */
  selectedSubcategoryId: string;

  status: CourseStatusFilter;
  search: string;

  resultCount: number;
  hasActiveFilters: boolean;
  loading: boolean;

  onBrandChange: (brandId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  onStatusChange: (status: CourseStatusFilter) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

const options = (items: BrandOption[]) =>
  items.map((item) => (
    <option key={item.value} value={item.value}>
      {item.label} ({item.count})
    </option>
  ));

/** Pick the brand, then narrow its courses by category, status or search. */
export default function CourseFilters({
  brandOptions,
  selectedBrandId,
  categoryOptions,
  selectedCategoryId,
  subcategoryOptions,
  selectedSubcategoryId,
  status,
  search,
  resultCount,
  hasActiveFilters,
  loading,
  onBrandChange,
  onCategoryChange,
  onSubcategoryChange,
  onStatusChange,
  onSearchChange,
  onReset,
}: CourseFiltersProps) {
  return (
    <section className="px-4 pt-5 sm:px-6 lg:px-8">
      <div className="space-y-3 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-inset ring-border">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <BrandTabs
            options={brandOptions}
            value={selectedBrandId}
            loading={loading}
            onChange={onBrandChange}
          />

          {/* Laid out like the brand tabs beside it */}
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
              Status
            </span>

            <SegmentedTabs
              label="Filter by status"
              options={COURSE_STATUS_FILTERS}
              value={status}
              onChange={onStatusChange}
            />
          </div>
        </div>

        <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:flex lg:items-center">
          <div className="min-w-0 lg:flex-1">
            <Select
              aria-label="Filter by main category"
              icon={FolderTree}
              value={selectedCategoryId}
              disabled={categoryOptions.length === 0}
              onChange={(event) =>
                onCategoryChange(event.target.value)
              }
            >
              <option value="">
                {categoryOptions.length > 0
                  ? "All main categories"
                  : "No main categories"}
              </option>

              {options(categoryOptions)}
            </Select>
          </div>

          <div className="min-w-0 lg:flex-1">
            <Select
              aria-label="Filter by sub category"
              icon={Folder}
              value={selectedSubcategoryId}
              disabled={subcategoryOptions.length === 0}
              onChange={(event) =>
                onSubcategoryChange(event.target.value)
              }
            >
              <option value="">
                {selectedCategoryId && subcategoryOptions.length === 0
                  ? "No sub categories"
                  : "All sub categories"}
              </option>

              {options(subcategoryOptions)}
            </Select>
          </div>

          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search courses..."
            label="Search courses"
            className="w-full lg:w-72"
          />

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
          "Loading courses..."
        ) : (
          <>
            Showing{" "}
            <span className="font-semibold text-text">
              {resultCount}
            </span>{" "}
            {resultCount === 1 ? "course" : "courses"}
            {hasActiveFilters && " (filtered)"}
          </>
        )}
      </p>
    </section>
  );
}
