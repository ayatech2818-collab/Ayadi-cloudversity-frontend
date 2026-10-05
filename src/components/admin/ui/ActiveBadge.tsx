"use client";

/** Active / Inactive pill for a light surface, such as a card. */
export default function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        active
          ? "bg-primary/10 text-primary-hover"
          : "bg-page text-muted ring-1 ring-inset ring-border"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-brand-gradient" : "bg-muted/50"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
