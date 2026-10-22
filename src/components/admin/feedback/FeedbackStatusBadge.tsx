"use client";

export default function FeedbackStatusBadge({
  approved,
}: {
  approved: boolean;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
        approved
          ? "bg-primary/10 text-primary-hover ring-primary/20"
          : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/30"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          approved ? "bg-brand-gradient" : "bg-amber-500"
        }`}
      />
      {approved ? "Approved" : "Pending"}
    </span>
  );
}
