"use client";

import Link from "next/link";
import {
  ArrowRight,
  Inbox,
  RotateCcw,
  ServerCrash,
} from "lucide-react";

import AuthorAvatar from "@/components/admin/authors/AuthorAvatar";
import {
  EnquiryStatusBadge,
  EnquiryTypeBadge,
} from "@/components/admin/enquiries/EnquiryBadges";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_TYPES,
  ENQUIRY_TYPE_LABELS,
  formatEnquiryDate,
  getEnquiryName,
} from "@/components/admin/enquiries/enquiry-utils";
import EmptyState from "@/components/admin/ui/EmptyState";
import { buttonClass } from "@/components/admin/ui/styles";
import type { DashboardRecentEnquiry } from "@/lib/api/dashboard";
import type { EnquiryStatus, EnquiryType } from "@/lib/api/enquiry";

import DashboardCard from "./DashboardCard";
import { PULSE } from "./styles";

const HEAD = "px-3 py-2.5 font-bold";
const AVATAR = "h-9 w-9 text-[11px]";
const BODY = "px-5 pb-5 pt-5 sm:px-6 sm:pb-6";

/** For a type or status this page has no badge for: the value, as sent. */
const PLAIN_BADGE =
  "inline-flex shrink-0 items-center rounded-full bg-page px-2 py-0.5 text-[11px] font-semibold capitalize text-muted ring-1 ring-inset ring-border";

// The dashboard endpoint sends type and status as plain strings. The badges
// only know the values the enquiries API names, so each is checked first.
const isEnquiryType = (value: string): value is EnquiryType =>
  (ENQUIRY_TYPES as readonly string[]).includes(value);

const isEnquiryStatus = (value: string): value is EnquiryStatus =>
  (ENQUIRY_STATUSES as readonly string[]).includes(value);

function TypeBadge({ type }: { type: string }) {
  return isEnquiryType(type) ? (
    <EnquiryTypeBadge type={type} />
  ) : (
    <span className={PLAIN_BADGE}>{type}</span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return isEnquiryStatus(status) ? (
    <EnquiryStatusBadge status={status} />
  ) : (
    <span className={PLAIN_BADGE}>{status}</span>
  );
}

interface RecentEnquiriesProps {
  /** Newest first. `null` while they are loading. */
  enquiries: DashboardRecentEnquiry[] | null;
  error: string | null;
  onRetry: () => void;
  className?: string;
}

/**
 * The latest enquiries, with the same badges as the enquiries page. A table
 * from `md`; below that five columns do not fit, so each enquiry becomes a row
 * of two lines.
 */
export default function RecentEnquiries({
  enquiries,
  error,
  onRetry,
  className = "",
}: RecentEnquiriesProps) {
  return (
    <DashboardCard
      title="Recent Enquiries"
      description="Latest submissions from the contact and enrollment forms"
      className={className}
      action={
        <Link
          href="/admin/enquiries"
          className={buttonClass("secondary", "sm")}
        >
          View all
          <ArrowRight size={13} className="text-primary" />
        </Link>
      }
    >
      {error ? (
        <div className={BODY}>
          <EmptyState
            compact
            danger
            icon={ServerCrash}
            title="Unable to load recent enquiries"
            text={error}
            action={{
              label: "Retry",
              icon: RotateCcw,
              onClick: onRetry,
              tone: "secondary",
            }}
          />
        </div>
      ) : !enquiries ? (
        <ul aria-hidden="true" className="mt-3 pb-2">
          {Array.from({ length: 7 }).map((_, index) => (
            <li
              key={index}
              className="flex items-center gap-3 border-t border-border px-5 py-3 sm:px-6"
            >
              <span
                className={`h-9 w-9 shrink-0 rounded-full ${PULSE}`}
              />

              <span className="min-w-0 flex-1 space-y-2">
                <span className={`block h-3.5 w-2/5 ${PULSE}`} />
                <span className={`block h-3 w-3/5 ${PULSE}`} />
              </span>

              <span className={`h-5 w-16 rounded-full ${PULSE}`} />
            </li>
          ))}
        </ul>
      ) : enquiries.length === 0 ? (
        <div className={BODY}>
          <EmptyState
            compact
            icon={Inbox}
            title="No enquiries yet"
            text="Contact and enrollment enquiries submitted through the website will appear here."
          />
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="mt-5 hidden overflow-x-auto pb-2 md:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-y border-border bg-page/60 text-[11px] uppercase tracking-[0.1em] text-muted">
                  <th scope="col" className={`${HEAD} pl-6`}>
                    Name
                  </th>
                  <th scope="col" className={HEAD}>
                    Type
                  </th>
                  <th scope="col" className={HEAD}>
                    Email
                  </th>
                  <th scope="col" className={HEAD}>
                    Status
                  </th>
                  <th scope="col" className={`${HEAD} pr-6 text-right`}>
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {enquiries.map((enquiry) => {
                  const name = getEnquiryName(enquiry);

                  return (
                    <tr
                      key={enquiry.id}
                      className="border-b border-border transition-colors last:border-b-0 hover:bg-page/60"
                    >
                      <td className="py-3 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <AuthorAvatar name={name} className={AVATAR} />

                          <span className="whitespace-nowrap font-semibold text-text">
                            {name}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <TypeBadge type={enquiry.type} />
                      </td>

                      {/* Takes the width the other columns leave, and no more. */}
                      <td
                        title={enquiry.email}
                        className="w-full max-w-0 truncate px-3 py-3 text-muted"
                      >
                        {enquiry.email}
                      </td>

                      <td className="px-3 py-3">
                        <StatusBadge status={enquiry.status} />
                      </td>

                      <td className="whitespace-nowrap py-3 pl-3 pr-6 text-right tabular-nums text-muted">
                        {formatEnquiryDate(enquiry.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Rows, for a phone */}
          <ul className="mt-3 pb-2 md:hidden">
            {enquiries.map((enquiry) => {
              const name = getEnquiryName(enquiry);

              return (
                <li
                  key={enquiry.id}
                  className="flex items-center gap-3 border-t border-border px-5 py-3"
                >
                  <AuthorAvatar name={name} className={AVATAR} />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-text">
                      {name}
                    </p>

                    <p className="truncate text-xs text-muted">
                      {isEnquiryType(enquiry.type)
                        ? ENQUIRY_TYPE_LABELS[enquiry.type]
                        : enquiry.type}{" "}
                      · {enquiry.email}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={enquiry.status} />

                    <span className="text-[11px] tabular-nums text-muted">
                      {formatEnquiryDate(enquiry.created_at)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </DashboardCard>
  );
}
