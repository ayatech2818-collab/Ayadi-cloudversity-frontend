"use client";

/** Published / Draft pill, made to sit on top of a cover image. */
export default function StatusBadge({
  published,
  className = "",
}: {
  published: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold text-white shadow-sm min-[360px]:gap-1.5 min-[360px]:px-2 min-[360px]:text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px] ${
        published
          ? "bg-brand-gradient"
          : "bg-accent-strong/85 ring-1 ring-inset ring-white/15"
      } ${className}`}
    >
      <span
        className={`h-1 w-1 rounded-full min-[360px]:h-1.5 min-[360px]:w-1.5 ${
          published ? "bg-white" : "bg-amber-400"
        }`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}
