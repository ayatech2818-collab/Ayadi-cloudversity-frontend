"use client";

import {
  CalendarDays,
  Globe,
  Hash,
  Home,
  Mail,
  MapPin,
  Phone,
  type LucideIcon,
} from "lucide-react";

import type { Enquiry } from "@/lib/api/enquiry";

import { formatBirthDate } from "./enquiry-utils";

const TILE = "rounded-xl bg-page/70 p-3 ring-1 ring-inset ring-border";

const LABEL =
  "flex items-center gap-1.5 text-[11px] font-medium text-muted";

/**
 * These come from a public form, so only a plain address or number is ever
 * turned into a link.
 */
export const toMailto = (email: string): string | undefined =>
  /^[^\s@?&#]+@[^\s@?&#]+$/.test(email) ? `mailto:${email}` : undefined;

const toTel = (phone: string): string | undefined => {
  const digits = phone.replace(/[^\d+]/g, "");

  return digits ? `tel:${digits}` : undefined;
};

interface DetailProps {
  icon: LucideIcon;
  label: string;
  value: string | null;
  /** Makes the value a link, e.g. to write an email or place a call. */
  href?: string;
}

function Detail({ icon: Icon, label, value, href }: DetailProps) {
  return (
    <div className={TILE}>
      <p className={LABEL}>
        <Icon size={12} />
        {label}
      </p>

      {value && href ? (
        <a
          href={href}
          title={value}
          className="mt-1 block truncate text-sm font-semibold text-primary-hover underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {value}
        </a>
      ) : (
        <p
          title={value ?? undefined}
          className={`mt-1 truncate text-sm font-semibold ${
            value ? "text-text" : "text-muted/60"
          }`}
        >
          {value || "Not provided"}
        </p>
      )}
    </div>
  );
}

/**
 * How to reach the person. Email and phone are always shown; the rest only
 * when the form collected them, which the enrollment form does.
 */
export default function EnquiryContactDetails({
  enquiry,
}: {
  enquiry: Enquiry;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Detail
          icon={Mail}
          label="Email"
          value={enquiry.email}
          href={toMailto(enquiry.email)}
        />

        <Detail
          icon={Phone}
          label="Phone"
          value={enquiry.phone}
          href={enquiry.phone ? toTel(enquiry.phone) : undefined}
        />

        {enquiry.date_of_birth && (
          <Detail
            icon={CalendarDays}
            label="Date of birth"
            value={formatBirthDate(enquiry.date_of_birth)}
          />
        )}

        {enquiry.city && (
          <Detail icon={MapPin} label="City" value={enquiry.city} />
        )}

        {enquiry.country && (
          <Detail
            icon={Globe}
            label="Country"
            value={enquiry.country}
          />
        )}

        {enquiry.zipcode && (
          <Detail icon={Hash} label="Zipcode" value={enquiry.zipcode} />
        )}
      </div>

      {enquiry.address && (
        <div className={TILE}>
          <p className={LABEL}>
            <Home size={12} />
            Address
          </p>

          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-text">
            {enquiry.address}
          </p>
        </div>
      )}
    </>
  );
}
