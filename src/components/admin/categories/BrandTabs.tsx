"use client";

import SegmentedTabs from "@/components/admin/ui/SegmentedTabs";

export interface BrandOption {
  value: string;
  label: string;
  /** How many entries this page lists under the brand. */
  count: number;
}

interface BrandTabsProps {
  options: BrandOption[];
  value: string;
  loading: boolean;
  onChange: (brandId: string) => void;
}

/** "Brand" label with one tab per active brand. */
export default function BrandTabs({
  options,
  value,
  loading,
  onChange,
}: BrandTabsProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <span className="px-1 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        Brand
      </span>

      {options.length > 0 ? (
        <SegmentedTabs
          label="Select brand"
          options={options}
          value={value}
          onChange={onChange}
        />
      ) : loading ? (
        <div
          aria-hidden="true"
          className="h-11 w-56 animate-pulse rounded-xl bg-page"
        />
      ) : (
        <span className="text-xs text-muted">No active brands</span>
      )}
    </div>
  );
}
