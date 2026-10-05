"use client";

import { useEffect, type ReactNode } from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
} from "framer-motion";
import { X, type LucideIcon } from "lucide-react";

const WIDTHS = {
  sm: "max-w-md",
  md: "max-w-xl",
} as const;

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Id of the heading that names the dialog. */
  labelledBy: string;
  /** True while a request is in flight — Esc is ignored so nothing is lost. */
  busy?: boolean;
  size?: keyof typeof WIDTHS;
  children: ReactNode;
}

/**
 * Dialog shell for the admin dashboard: backdrop, entrance, Esc to close and a
 * locked page behind it. Children mount when it opens and unmount when it
 * closes, so a form inside always starts from fresh state.
 */
export default function Modal({
  open,
  onClose,
  labelledBy,
  busy = false,
  size = "md",
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open || busy) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () =>
      document.removeEventListener("keydown", onKeyDown);
  }, [open, busy, onClose]);

  // Holds the page still, and hands focus back to whatever opened the dialog.
  useEffect(() => {
    if (!open) return;

    const opener = document.activeElement as HTMLElement | null;
    const { overflow, paddingRight } = document.body.style;

    // Stands in for the scrollbar so the page does not shift sideways.
    const scrollbar =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbar > 0) {
      document.body.style.paddingRight = `${scrollbar}px`;
    }

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
      opener?.focus?.();
    };
  }, [open]);

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>
        {open && (
          <motion.div
            key="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-accent-strong/60 p-3 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-3xl bg-surface text-text shadow-[0_40px_100px_-30px_rgba(20,29,63,0.65)] ${WIDTHS[size]}`}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

interface ModalHeaderProps {
  /** Matches the `labelledBy` given to the Modal. */
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  onClose: () => void;
  disabled?: boolean;
}

/** Navy accent band with a brand-gradient icon tile and glow. */
export function ModalHeader({
  id,
  icon: Icon,
  title,
  description,
  onClose,
  disabled = false,
}: ModalHeaderProps) {
  return (
    <div className="relative isolate shrink-0 overflow-hidden bg-accent-gradient px-6 py-5 text-white">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-24 -z-10 h-52 w-52 rounded-full bg-brand-gradient opacity-45 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-brand-gradient"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-lg shadow-brand-start/30">
            <Icon size={20} strokeWidth={2.2} />
          </span>

          <div className="min-w-0">
            <h2
              id={id}
              className="text-lg font-bold tracking-[-0.02em]"
            >
              {title}
            </h2>

            <p className="mt-0.5 text-xs text-white/70">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          disabled={disabled}
          aria-label="Close"
          className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-white/10 text-white/80 ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

export function ModalFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border bg-page/70 px-6 py-4">
      {children}
    </div>
  );
}
