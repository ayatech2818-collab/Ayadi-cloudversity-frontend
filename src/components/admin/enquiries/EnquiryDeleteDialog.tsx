"use client";

import AuthorAvatar from "@/components/admin/authors/AuthorAvatar";
import DeleteDialog from "@/components/admin/ui/DeleteDialog";
import type { Enquiry } from "@/lib/api/enquiry";

import {
  ENQUIRY_TYPE_LABELS,
  getEnquiryName,
} from "./enquiry-utils";

interface EnquiryDeleteDialogProps {
  enquiry: Enquiry | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function EnquiryDeleteDialog({
  enquiry,
  loading = false,
  onCancel,
  onConfirm,
}: EnquiryDeleteDialogProps) {
  const name = enquiry ? getEnquiryName(enquiry) : "";

  return (
    <DeleteDialog
      open={enquiry !== null}
      id="enquiry-delete-title"
      title="Delete this enquiry?"
      description="This permanently deletes the enquiry and its message. This action cannot be undone."
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {enquiry && (
        <div className="flex items-center gap-3 rounded-2xl bg-page/70 p-3 ring-1 ring-inset ring-border">
          <AuthorAvatar name={name} className="h-10 w-10 text-xs" />

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-accent">
              {name}
            </p>

            <p className="truncate text-xs text-muted">
              {ENQUIRY_TYPE_LABELS[enquiry.type]}
              {" · "}
              {enquiry.email}
            </p>
          </div>
        </div>
      )}
    </DeleteDialog>
  );
}
