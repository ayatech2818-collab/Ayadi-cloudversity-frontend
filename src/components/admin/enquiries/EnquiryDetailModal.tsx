"use client";

import { useState } from "react";
import {
  GraduationCap,
  LoaderCircle,
  Mail,
  MessageSquare,
  Trash2,
} from "lucide-react";

import Alert from "@/components/admin/ui/Alert";
import FormSection from "@/components/admin/ui/FormSection";
import Modal, {
  ModalFooter,
  ModalHeader,
} from "@/components/admin/ui/Modal";
import SegmentedTabs from "@/components/admin/ui/SegmentedTabs";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Enquiry, EnquiryStatus } from "@/lib/api/enquiry";
import { getApiErrorMessage } from "@/lib/api/errors";

import EnquiryContactDetails, {
  toMailto,
} from "./EnquiryContactDetails";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  ENQUIRY_TYPE_LABELS,
  formatEnquiryDate,
  getEnquiryName,
} from "./enquiry-utils";

const STATUS_OPTIONS = ENQUIRY_STATUSES.map((status) => ({
  value: status,
  label: ENQUIRY_STATUS_LABELS[status],
}));

interface EnquiryDetailModalProps {
  enquiry: Enquiry | null;
  /** True while the delete confirmation is open on top of this dialog. */
  locked?: boolean;
  onClose: () => void;
  /** Saves the new status; a failure is left to throw and is shown here. */
  onStatusChange: (status: EnquiryStatus) => Promise<void>;
  onDelete: () => void;
}

export default function EnquiryDetailModal({
  enquiry,
  locked = false,
  ...detail
}: EnquiryDetailModalProps) {
  return (
    <Modal
      open={enquiry !== null}
      // Esc belongs to the confirmation while it is showing.
      closeOnEscape={!locked}
      onClose={detail.onClose}
      labelledBy="enquiry-detail-title"
      size="lg"
    >
      {/* Keyed, so a status error never carries over to another enquiry. */}
      {enquiry && (
        <EnquiryDetail key={enquiry.id} enquiry={enquiry} {...detail} />
      )}
    </Modal>
  );
}

interface EnquiryDetailProps
  extends Omit<EnquiryDetailModalProps, "enquiry" | "locked"> {
  enquiry: Enquiry;
}

function EnquiryDetail({
  enquiry,
  onClose,
  onStatusChange,
  onDelete,
}: EnquiryDetailProps) {
  // The status being saved — shown as chosen straight away.
  const [pending, setPending] = useState<EnquiryStatus | null>(null);
  const [error, setError] = useState("");

  const name = getEnquiryName(enquiry);
  const mailto = toMailto(enquiry.email);

  const changeStatus = async (status: EnquiryStatus) => {
    if (pending || status === enquiry.status) return;

    try {
      setPending(status);
      setError("");

      await onStatusChange(status);
    } catch (updateError) {
      console.error("Failed to update enquiry status:", updateError);

      setError(
        getApiErrorMessage(
          updateError,
          "Could not update the status. Please try again."
        )
      );
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <ModalHeader
        id="enquiry-detail-title"
        icon={
          enquiry.type === "enrollment" ? GraduationCap : MessageSquare
        }
        title={name}
        description={`${ENQUIRY_TYPE_LABELS[enquiry.type]} enquiry · Submitted ${formatEnquiryDate(enquiry.created_at)}`}
        onClose={onClose}
      />

      <div className="flex-1 space-y-5 overflow-y-auto bg-page/60 p-4 sm:p-6">
        {/* Saved as soon as one is picked */}
        <FormSection
          title="Status"
          aside={
            pending && (
              <span className="inline-flex items-center gap-1.5 text-primary">
                <LoaderCircle size={12} className="animate-spin" />
                Saving...
              </span>
            )
          }
        >
          <SegmentedTabs
            label="Enquiry status"
            options={STATUS_OPTIONS}
            value={pending ?? enquiry.status}
            onChange={changeStatus}
          />

          {error && <Alert>{error}</Alert>}
        </FormSection>

        <FormSection title="Message">
          {enquiry.message ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text">
              {enquiry.message}
            </p>
          ) : (
            <p className="text-sm text-muted">
              No message was left with this enquiry.
            </p>
          )}
        </FormSection>

        <FormSection title="Contact details">
          <EnquiryContactDetails enquiry={enquiry} />
        </FormSection>
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onDelete}
          className={`mr-auto ${buttonClass("secondary")}`}
        >
          <Trash2 size={15} className="text-rose-600" />
          Delete
        </button>

        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className={buttonClass("secondary")}
        >
          Close
        </button>

        {mailto && (
          <a
            href={mailto}
            aria-label={`Reply to ${name} by email`}
            className={`${buttonClass("primary")} hover:brightness-105`}
          >
            <Mail size={16} />
            Reply
          </a>
        )}
      </ModalFooter>
    </>
  );
}
