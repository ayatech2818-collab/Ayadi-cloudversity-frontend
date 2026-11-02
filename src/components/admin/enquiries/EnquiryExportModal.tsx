"use client";

import { useRef, useState } from "react";
import {
  Check,
  CircleCheck,
  FileSpreadsheet,
  Inbox,
  LoaderCircle,
  Minus,
} from "lucide-react";

import AuthorAvatar from "@/components/admin/authors/AuthorAvatar";
import Alert from "@/components/admin/ui/Alert";
import Modal, { ModalFooter, ModalHeader } from "@/components/admin/ui/Modal";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Enquiry, EnquiryStatus } from "@/lib/api/enquiry";
import { getApiErrorMessage } from "@/lib/api/errors";

import { ENQUIRY_STATUS_STYLES, EnquiryTypeBadge } from "./EnquiryBadges";
import {
  ENQUIRY_STATUSES,
  ENQUIRY_STATUS_LABELS,
  formatEnquiryDate,
  getEnquiryName,
  type EnquiryCounts,
  type EnquiryStatusFilter,
} from "./enquiry-utils";

const STATUS_HINTS: Record<EnquiryStatus, string> = {
  new: "Not yet followed up",
  contacted: "Reached out, awaiting a reply",
  converted: "Became a student",
  closed: "No further action",
};

interface EnquiryExportModalProps {
  open: boolean;
  /** Counted across every enquiry; `null` while the numbers are loading. */
  counts: EnquiryCounts | null;
  /** Picked when the dialog opens — the status tab the admin is on. */
  initialStatus: EnquiryStatusFilter;
  onClose: () => void;
  /**
   * Left to throw, so the dialog can show what went wrong. Resolves to the
   * New leads in the file; empty for any other export.
   */
  onExport: (status?: EnquiryStatus) => Promise<Enquiry[]>;
  /** Resolves to the ids that could not be updated. */
  onMarkContacted: (ids: string[]) => Promise<string[]>;
}

export default function EnquiryExportModal({
  open,
  onClose,
  ...props
}: EnquiryExportModalProps) {
  const [busy, setBusy] = useState(false);

  return (
    <Modal
      open={open}
      busy={busy}
      onClose={onClose}
      labelledBy="enquiry-export-title"
      size="sm"
    >
      <ExportBody {...props} onClose={onClose} onBusyChange={setBusy} />
    </Modal>
  );
}

/** Mounted on open, so each visit starts from the current status tab. */
function ExportBody({
  counts,
  initialStatus,
  onClose,
  onExport,
  onMarkContacted,
  onBusyChange,
}: Omit<EnquiryExportModalProps, "open"> & {
  onBusyChange: (busy: boolean) => void;
}) {
  const [selected, setSelected] =
    useState<EnquiryStatusFilter>(initialStatus);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The New leads just downloaded, waiting on the admin's go-ahead.
  const [exportedLeads, setExportedLeads] = useState<Enquiry[] | null>(
    null
  );

  // State lands a render late; the ref stops a fast double click at once.
  const inFlight = useRef(false);

  const options: {
    value: EnquiryStatusFilter;
    label: string;
    hint: string;
    count: number | null;
  }[] = [
    {
      value: "All",
      label: "All enquiries",
      hint: "Every status in one file",
      count: counts?.total ?? null,
    },
    ...ENQUIRY_STATUSES.map((status) => ({
      value: status,
      label: ENQUIRY_STATUS_LABELS[status],
      hint: STATUS_HINTS[status],
      count: counts?.byStatus[status] ?? null,
    })),
  ];

  const selectedCount =
    options.find((option) => option.value === selected)?.count ?? null;

  const setBusy = (busy: boolean) => {
    inFlight.current = busy;
    setExporting(busy);
    onBusyChange(busy);
  };

  const handleExport = async () => {
    if (inFlight.current) return;

    try {
      setBusy(true);
      setError(null);

      const newLeads = await onExport(
        selected === "All" ? undefined : selected
      );

      if (newLeads.length > 0) setExportedLeads(newLeads);
    } catch (exportError) {
      console.error("Failed to export enquiries:", exportError);

      setError(
        getApiErrorMessage(
          exportError,
          "Could not export the enquiries. Please try again."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  if (exportedLeads) {
    return (
      <MarkContactedStep
        leads={exportedLeads}
        onClose={onClose}
        onMarkContacted={onMarkContacted}
        onBusyChange={onBusyChange}
      />
    );
  }

  return (
    <>
      <ModalHeader
        id="enquiry-export-title"
        icon={FileSpreadsheet}
        title="Export to Excel"
        description="Download enquiries as an .xlsx workbook"
        onClose={onClose}
        disabled={exporting}
      />

      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6">
        <div
          role="radiogroup"
          aria-label="Enquiries to export"
          className="space-y-2"
        >
          {options.map((option) => {
            const active = option.value === selected;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                data-autofocus={active || undefined}
                disabled={exporting}
                onClick={() => setSelected(option.value)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left ring-1 ring-inset transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 sm:px-3.5 sm:py-3 ${
                  active
                    ? "bg-primary/5 ring-primary"
                    : "bg-surface ring-border enabled:hover:bg-page enabled:hover:ring-primary/40"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-page ring-1 ring-inset ring-border">
                  {option.value === "All" ? (
                    <Inbox size={15} className="text-muted" />
                  ) : (
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        ENQUIRY_STATUS_STYLES[option.value].dot
                      }`}
                    />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-accent">
                    {option.label}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {option.hint}
                  </span>
                </span>

                <span className="shrink-0 text-xs font-semibold tabular-nums text-muted">
                  {option.count ?? "–"}
                </span>

                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-colors ${
                    active
                      ? "bg-brand-gradient text-white ring-transparent"
                      : "ring-border"
                  }`}
                >
                  {active && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>

        {selectedCount === 0 && (
          <p className="text-xs text-muted">
            Nothing matches yet — the file will only have the column headings.
          </p>
        )}

        {error && <Alert>{error}</Alert>}
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={exporting}
          className={buttonClass("secondary")}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          aria-busy={exporting}
          className={buttonClass("primary")}
        >
          {exporting ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={16} />
          )}
          {exporting ? "Preparing file..." : "Download Excel"}
        </button>
      </ModalFooter>
    </>
  );
}

/**
 * Shown after a New export has downloaded. Every lead starts ticked; the
 * admin unticks any that should stay New. Nothing changes until they say so —
 * they can open the sheet first, and "Not now" leaves every lead New.
 */
function MarkContactedStep({
  leads: exportedLeads,
  onClose,
  onMarkContacted,
  onBusyChange,
}: {
  leads: Enquiry[];
  onClose: () => void;
  onMarkContacted: (ids: string[]) => Promise<string[]>;
  onBusyChange: (busy: boolean) => void;
}) {
  // Drops the ones already marked, so a retry only shows what is left.
  const [leads, setLeads] = useState(exportedLeads);
  const [selected, setSelected] = useState(
    () => new Set(exportedLeads.map(({ id }) => id))
  );
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inFlight = useRef(false);

  const total = exportedLeads.length;
  const selectedCount = selected.size;
  const allSelected = selectedCount === leads.length;
  const noneSelected = selectedCount === 0;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const toggleAll = () =>
    setSelected(
      allSelected ? new Set() : new Set(leads.map(({ id }) => id))
    );

  const setBusy = (busy: boolean) => {
    inFlight.current = busy;
    setMarking(busy);
    onBusyChange(busy);
  };

  const handleMark = async () => {
    if (inFlight.current || noneSelected) return;

    const ids = [...selected];

    try {
      setBusy(true);
      setError(null);

      const failed = await onMarkContacted(ids);

      // On full success the page closes the dialog; this is the partial case.
      if (failed.length > 0) {
        const failedSet = new Set(failed);

        setLeads((current) =>
          current.filter(
            ({ id }) => !selected.has(id) || failedSet.has(id)
          )
        );
        setSelected(failedSet);
        setError(
          `${ids.length - failed.length} of ${ids.length} marked. ${failed.length} could not be updated — try again.`
        );
      }
    } catch (markError) {
      console.error("Failed to mark leads as contacted:", markError);

      setError(
        getApiErrorMessage(
          markError,
          "Could not update the leads. Please try again."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <ModalHeader
        id="enquiry-export-title"
        icon={FileSpreadsheet}
        title="Export downloaded"
        description="Pick the leads to mark as Contacted"
        onClose={onClose}
        disabled={marking}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-6">
        <div className="flex shrink-0 items-start gap-3 rounded-xl bg-primary/5 p-3.5 ring-1 ring-inset ring-primary/20">
          <CircleCheck size={20} className="mt-px shrink-0 text-primary" />

          <div className="min-w-0">
            <p className="text-sm font-semibold text-accent">
              {total} new {total === 1 ? "lead" : "leads"} downloaded
            </p>

            <p className="mt-1 text-xs leading-relaxed text-muted">
              Ticked leads become Contacted and leave the next New export.
              Unticked ones stay New.
            </p>
          </div>
        </div>

        <div className="flex min-h-0 flex-col overflow-hidden rounded-xl ring-1 ring-inset ring-border">
          <button
            type="button"
            role="checkbox"
            aria-checked={
              allSelected ? true : noneSelected ? false : "mixed"
            }
            onClick={toggleAll}
            disabled={marking}
            className="flex shrink-0 cursor-pointer items-center gap-3 border-b border-border bg-page/70 px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckBox
              state={allSelected ? "on" : noneSelected ? "off" : "mixed"}
            />

            <span className="flex-1 text-xs font-semibold text-accent">
              Select all
            </span>

            <span className="text-xs font-semibold tabular-nums text-muted">
              {selectedCount} of {leads.length} selected
            </span>
          </button>

          <ul className="max-h-72 divide-y divide-border overflow-y-auto">
            {leads.map((lead) => {
              const name = getEnquiryName(lead);
              const checked = selected.has(lead.id);

              return (
                <li key={lead.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    onClick={() => toggle(lead.id)}
                    disabled={marking}
                    className={`flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-60 ${
                      checked
                        ? "bg-primary/5"
                        : "bg-surface enabled:hover:bg-page"
                    }`}
                  >
                    <CheckBox state={checked ? "on" : "off"} />

                    <AuthorAvatar
                      name={name}
                      className="h-8 w-8 text-[10px]"
                    />

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-accent">
                        {name}
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {lead.email} · {formatEnquiryDate(lead.created_at)}
                      </span>
                    </span>

                    <EnquiryTypeBadge type={lead.type} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {error && <Alert>{error}</Alert>}
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={marking}
          className={buttonClass("secondary")}
        >
          Not now
        </button>

        <button
          type="button"
          data-autofocus
          onClick={handleMark}
          disabled={marking || noneSelected}
          aria-busy={marking}
          className={buttonClass("primary")}
        >
          {marking ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          {marking ? "Updating..." : `Mark ${selectedCount} as Contacted`}
        </button>
      </ModalFooter>
    </>
  );
}

function CheckBox({ state }: { state: "on" | "off" | "mixed" }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 ring-inset transition-colors ${
        state === "off"
          ? "bg-surface ring-border"
          : "bg-brand-gradient text-white ring-transparent"
      }`}
    >
      {state === "on" && <Check size={12} strokeWidth={3} />}
      {state === "mixed" && <Minus size={12} strokeWidth={3} />}
    </span>
  );
}
