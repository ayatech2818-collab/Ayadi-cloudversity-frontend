"use client";

import { Eye, Mail, MapPin, Phone, Trash2 } from "lucide-react";

import AuthorAvatar from "@/components/admin/authors/AuthorAvatar";
import {
  buttonClass,
  iconButtonClass,
} from "@/components/admin/ui/styles";
import type { Enquiry } from "@/lib/api/enquiry";

import { EnquiryStatusBadge, EnquiryTypeBadge } from "./EnquiryBadges";
import {
  formatEnquiryDate,
  getEnquiryLocation,
  getEnquiryName,
} from "./enquiry-utils";

const CONTACT_LINE = "flex min-w-0 items-center gap-2";

interface EnquiryCardProps {
  enquiry: Enquiry;
  onView: () => void;
  onDelete: () => void;
}

/**
 * Built to work two-across on a phone: the padding and type step up from `sm`.
 */
export default function EnquiryCard({
  enquiry,
  onView,
  onDelete,
}: EnquiryCardProps) {
  const name = getEnquiryName(enquiry);
  const location = getEnquiryLocation(enquiry);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-inset ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)] sm:p-5">
      {/* Decor — the top line stays on for an enquiry nobody has handled yet */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 origin-left bg-brand-gradient transition-transform duration-500 ${
          enquiry.status === "new"
            ? ""
            : "scale-x-0 group-hover:scale-x-100"
        }`}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-gradient opacity-10 blur-2xl"
      />

      <div className="flex items-start justify-between gap-2">
        <AuthorAvatar
          name={name}
          className="h-10 w-10 text-xs sm:h-11 sm:w-11 sm:text-sm"
        />

        <EnquiryStatusBadge status={enquiry.status} />
      </div>

      <h3
        title={name}
        className="mt-3 truncate text-sm font-bold tracking-[-0.01em] text-accent sm:text-base"
      >
        {name}
      </h3>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted">
        <EnquiryTypeBadge type={enquiry.type} />
        {formatEnquiryDate(enquiry.created_at)}
      </div>

      {/* Contact */}
      <ul className="mt-3 space-y-1.5 text-xs text-muted sm:text-[13px]">
        <li className={CONTACT_LINE}>
          <Mail size={13} className="shrink-0 text-primary" />
          <span title={enquiry.email} className="truncate">
            {enquiry.email}
          </span>
        </li>

        {enquiry.phone && (
          <li className={CONTACT_LINE}>
            <Phone size={13} className="shrink-0 text-primary" />
            <span className="truncate">{enquiry.phone}</span>
          </li>
        )}

        {location && (
          <li className={CONTACT_LINE}>
            <MapPin size={13} className="shrink-0 text-primary" />
            <span title={location} className="truncate">
              {location}
            </span>
          </li>
        )}
      </ul>

      {enquiry.message && (
        <p className="mt-3 line-clamp-2 rounded-xl bg-page/70 px-2.5 py-2 text-xs leading-relaxed text-muted ring-1 ring-inset ring-border">
          {enquiry.message}
        </p>
      )}

      {/* Actions */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <button
          type="button"
          onClick={onView}
          aria-label={`View enquiry from ${name}`}
          className={buttonClass("secondary", "sm")}
        >
          <Eye size={13} className="text-primary" />
          View
        </button>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete enquiry from ${name}`}
          title="Delete"
          className={iconButtonClass(true)}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </article>
  );
}
