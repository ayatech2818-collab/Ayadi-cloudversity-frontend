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
}: SegmentedTabsProps<Value>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex h-11 max-w-full shrink-0 items-center gap-1 overflow-x-auto rounded-xl bg-page p-1 ring-1 ring-inset ring-border [scrollbar-width:none]"
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              selected
                ? "bg-accent-gradient text-white shadow-md shadow-accent/25"
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
