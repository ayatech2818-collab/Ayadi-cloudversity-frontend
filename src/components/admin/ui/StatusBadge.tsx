"use client";

/** Published / Draft pill, made to sit on top of a cover image. */
export default function StatusBadge({
  published,
}: {
  published: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm ${
        published
          ? "bg-brand-gradient"
          : "bg-accent-strong/85 ring-1 ring-inset ring-white/15"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          published ? "bg-white" : "bg-amber-400"
        }`}
      />
      {published ? "Published" : "Draft"}
    </span>
  );
}
