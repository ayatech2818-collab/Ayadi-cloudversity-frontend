"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ToastVariant = "success" | "error";

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

const AUTO_DISMISS_MS = 4000;

/**
 * Small toast queue for the admin dashboard. Kept deliberately local — the
 * hook owns the state and the page renders <Toaster /> beside its content, so
 * nothing needs a global provider.
 */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const dismissToast = useCallback((id: string) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) =>
      current.filter((toast) => toast.id !== id)
    );
  }, []);

  const pushToast = useCallback(
    (
      variant: ToastVariant,
      title: string,
      description?: string
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((current) => [
        ...current,
        { id, variant, title, description },
      ]);

      timers.current.set(
        id,
        setTimeout(() => dismissToast(id), AUTO_DISMISS_MS)
      );
    },
    [dismissToast]
  );

  const toastSuccess = useCallback(
    (title: string, description?: string) =>
      pushToast("success", title, description),
    [pushToast]
  );

  const toastError = useCallback(
    (title: string, description?: string) =>
      pushToast("error", title, description),
    [pushToast]
  );

  return { toasts, toastSuccess, toastError, dismissToast };
}

interface ToasterProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function Toaster({ toasts, onDismiss }: ToasterProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2.5"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const isSuccess = toast.variant === "success";

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.97 }}
              transition={{
                duration: 0.22,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                pointer-events-auto flex items-start gap-3
                rounded-2xl border border-border bg-surface
                p-3.5 shadow-[0_16px_40px_rgba(15,23,42,0.14)]
              "
            >
              <span
                className={`
                  mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl
                  ${
                    isSuccess
                      ? "bg-primary/10 text-primary"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400"
                  }
                `}
              >
                {isSuccess ? (
                  <CheckCircle2 size={17} />
                ) : (
                  <AlertCircle size={17} />
                )}
              </span>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-text">
                  {toast.title}
                </p>

                {toast.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => onDismiss(toast.id)}
                className="
                  -mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center
                  rounded-lg text-muted transition-colors
                  hover:bg-page hover:text-text
                "
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
