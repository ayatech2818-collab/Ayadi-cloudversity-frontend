"use client";

interface SegmentedTabsProps<Value extends string> {
  /** Accessible name for the group, e.g. "Filter by status". */
  label: string;
  options: {
    value: Value;
    label: string;
    /** Optional number shown after the label. */
    count?: number;
  }[];
  value: Value;
  onChange: (value: Value) => void;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A short row of either/or choices; the chosen one wears the navy gradient.
 * If the row is wider than its space it scrolls sideways instead of wrapping.
 */
export default function SegmentedTabs<Value extends string>({
  label,
  options,
  value,
  onChange,
  size = "md",
  className = "",
}: SegmentedTabsProps<Value>) {
  const isSm = size === "sm";

  return (
    <div
      role="group"
      aria-label={label}
      className={`flex max-w-full shrink-0 items-center overflow-x-auto bg-page ring-1 ring-inset ring-border [scrollbar-width:none] ${
        isSm
          ? "h-8 min-[360px]:h-8.5 sm:h-9 gap-0.5 rounded-lg p-0.5 sm:rounded-xl sm:p-1"
          : "h-9 min-[360px]:h-10 sm:h-11 gap-1 rounded-xl p-1"
      } ${className}`}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              isSm
                ? "h-6.5 min-[360px]:h-7 sm:h-7.5 gap-1 rounded-md px-2 text-[11px] sm:px-2.5 sm:text-xs"
                : "h-7.5 min-[360px]:h-8 sm:h-9 gap-1.5 rounded-lg px-2.5 min-[360px]:px-3 sm:px-3.5 text-xs"
            } ${
              selected
                ? "bg-accent-gradient text-white shadow-md shadow-accent/25 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/15"
                : "text-muted hover:text-text"
            }`}
          >
            {option.label}

            {option.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-px text-[10px] tabular-nums ${
                  selected ? "bg-white/20" : "bg-border/70"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
