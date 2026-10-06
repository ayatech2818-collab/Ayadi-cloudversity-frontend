"use client";

import { GraduationCap, MessageSquare } from "lucide-react";

import type { EnquiryStatus, EnquiryType } from "@/lib/api/enquiry";

import {
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_TYPE_LABELS,
} from "./enquiry-utils";

const STATUS_STYLES: Record<
  EnquiryStatus,
  { pill: string; dot: string }
> = {
  new: {
    pill: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
  },
  contacted: {
    pill: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  converted: {
    pill: "bg-primary/10 text-primary-hover ring-primary/20",
    dot: "bg-brand-gradient",
  },
  closed: {
    pill: "bg-page text-muted ring-border",
    dot: "bg-muted/50",
  },
};

/** Where the enquiry stands: New, Contacted, Converted or Closed. */
export function EnquiryStatusBadge({
  status,
}: {
  status: EnquiryStatus;
}) {
  const { pill, dot } = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {ENQUIRY_STATUS_LABELS[status]}
    </span>
  );
}

/** Which website form it came from: Contact or Enrollment. */
export function EnquiryTypeBadge({ type }: { type: EnquiryType }) {
  const Icon = type === "enrollment" ? GraduationCap : MessageSquare;

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        type === "enrollment"
          ? "bg-accent/10 text-accent"
          : "bg-page text-muted ring-1 ring-inset ring-border"
      }`}
    >
      <Icon size={11} />
      {ENQUIRY_TYPE_LABELS[type]}
    </span>
  );
}
