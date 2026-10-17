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
  confirmIcon?: import("lucide-react").LucideIcon;
  icon?: import("lucide-react").LucideIcon;
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
  confirmIcon,
  icon,
  children,
}: DeleteDialogProps) {
  const ActionIcon = confirmIcon || Trash2;
  const HeaderIcon = icon || TriangleAlert;

  return (
    <Modal
      open={open}
      busy={loading}
      onClose={onCancel}
      labelledBy={id}
      size="sm"
    >
      <div className="p-3.5 min-[360px]:p-4.5 sm:p-6">
        <div className="flex items-start gap-2.5 min-[360px]:gap-3 sm:gap-4">
          <span className="flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100 min-[360px]:h-8.5 min-[360px]:w-8.5 min-[360px]:rounded-xl sm:h-11 sm:w-11 dark:bg-rose-500/15 dark:text-rose-400 dark:ring-rose-500/25">
            <HeaderIcon className="h-3.5 w-3.5 min-[360px]:h-4 min-[360px]:w-4 sm:h-5 sm:w-5" />
          </span>

          <div className="min-w-0">
            <h3 id={id} className="text-xs font-bold text-accent min-[360px]:text-sm sm:text-base">
              {title}
            </h3>

            <p className="mt-0.5 text-[11px] leading-relaxed text-muted min-[360px]:mt-1 min-[360px]:text-xs sm:mt-1.5 sm:text-sm">
              {description}
            </p>
          </div>
        </div>

        {children && <div className="mt-2.5 min-[360px]:mt-3 sm:mt-4">{children}</div>}

        <div className="mt-3.5 flex items-center justify-end gap-1.5 min-[360px]:mt-4 min-[360px]:gap-2 sm:mt-6 sm:gap-3">
          {/* Focus starts on the safe choice. */}
          <button
            type="button"
            data-autofocus
            onClick={onCancel}
            disabled={loading}
            className={`${buttonClass("secondary", "sm")} h-7.5 px-2.5 text-[11px] min-[360px]:h-8 min-[360px]:px-3 min-[360px]:text-xs sm:h-10 sm:px-4 sm:text-sm`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`${buttonClass("danger", "sm")} h-7.5 px-2.5 text-[11px] min-[360px]:h-8 min-[360px]:px-3 min-[360px]:text-xs sm:h-10 sm:px-4 sm:text-sm`}
          >
            {loading ? (
              <LoaderCircle className="h-3 w-3 animate-spin min-[360px]:h-3.5 min-[360px]:w-3.5 sm:h-4 sm:w-4" />
            ) : (
              <ActionIcon className="h-3 w-3 min-[360px]:h-3.5 min-[360px]:w-3.5 sm:h-4 sm:w-4" />
            )}
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
