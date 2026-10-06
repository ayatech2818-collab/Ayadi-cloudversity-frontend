"use client";

import type { ReactNode } from "react";
import { LoaderCircle, Trash2, TriangleAlert } from "lucide-react";

import Modal from "./Modal";
import { buttonClass } from "./styles";

interface DeleteDialogProps {
  open: boolean;
  /** Unique per dialog — it names the dialog for screen readers. */
  id: string;
  title: string;
  description: ReactNode;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  /** A summary of the thing about to be deleted. */
  confirmLabel?: string;
  children?: ReactNode;
}

export default function DeleteDialog({
  open,
  id,
  title,
  description,
  loading = false,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
  children,
}: DeleteDialogProps) {
  return (
    <Modal
      open={open}
      busy={loading}
      onClose={onCancel}
      labelledBy={id}
      size="sm"
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
            <TriangleAlert size={20} />
          </span>

          <div className="min-w-0">
            <h3 id={id} className="text-base font-bold text-accent">
              {title}
            </h3>

            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {description}
            </p>
          </div>
        </div>

        {children && <div className="mt-4">{children}</div>}

        <div className="mt-6 flex items-center justify-end gap-3">
          {/* Focus starts on the safe choice. */}
          <button
            type="button"
            data-autofocus
            onClick={onCancel}
            disabled={loading}
            className={buttonClass("secondary")}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={buttonClass("danger")}
          >
            {loading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
