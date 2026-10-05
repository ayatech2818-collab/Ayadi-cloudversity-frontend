"use client";

interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

/** On/off row: the whole row is the label, the track fills with the brand gradient. */
export default function Switch({
  label,
  description,
  checked,
  onChange,
  disabled = false,
}: SwitchProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-page/70 p-3.5 ring-1 ring-inset ring-border has-disabled:cursor-not-allowed">
      <span>
        <span className="block text-xs font-semibold text-text">
          {label}
        </span>

        {description && (
          <span className="mt-0.5 block text-[11px] leading-snug text-muted">
            {description}
          </span>
        )}
      </span>

      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 rounded-full bg-border transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand-gradient peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:opacity-60"
      />
    </label>
  );
}
