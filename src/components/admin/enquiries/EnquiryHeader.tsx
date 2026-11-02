"use client";

import {
  FileSpreadsheet,
  GraduationCap,
  Inbox,
  MailPlus,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

import PageHeader from "@/components/admin/ui/PageHeader";
import { buttonClass } from "@/components/admin/ui/styles";

import type { EnquiryCounts } from "./enquiry-utils";

interface EnquiryHeaderProps {
  /** Counted across every enquiry; `null` while the numbers are loading. */
  counts: EnquiryCounts | null;
  /** True while the list is being fetched. */
  refreshing: boolean;
  onRefresh: () => void;
  onExport: () => void;
}

export default function EnquiryHeader({
  counts,
  refreshing,
  onRefresh,
  onExport,
}: EnquiryHeaderProps) {
  return (
    <PageHeader
      eyebrow="Communication"
      title="Website"
      highlight="Enquiries"
      description="Manage contact and enrollment enquiries submitted through the Ayadi website."
      stats={[
        {
          label: "Total",
          icon: Inbox,
          value: counts?.total ?? null,
        },
        {
          label: "New",
          icon: MailPlus,
          value: counts?.byStatus.new ?? null,
        },
        {
          label: "Enrollments",
          icon: GraduationCap,
          value: counts?.byType.enrollment ?? null,
        },
        {
          label: "Contacts",
          icon: MessageSquare,
          value: counts?.byType.contact ?? null,
        },
      ]}
    >
      {/* Enquiries arrive from the website, so there is nothing to add here. */}
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className={buttonClass("glass")}
      >
        <RefreshCw
          size={16}
          className={refreshing ? "animate-spin" : ""}
        />
        Refresh
      </button>

      <button
        type="button"
        onClick={onExport}
        className={buttonClass("glass")}
      >
        <FileSpreadsheet size={16} />
        Export Excel
      </button>
    </PageHeader>
  );
}
