"use client";

import { useEffect, useState } from "react";
import {
  ArchiveRestore,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";

import Alert from "@/components/admin/ui/Alert";
import Modal, {
  ModalFooter,
  ModalHeader,
} from "@/components/admin/ui/Modal";
import { buttonClass } from "@/components/admin/ui/styles";
import {
  getDeletedAuthors,
  restoreAuthor,
  type Author,
} from "@/lib/api/authors";
import { getApiErrorMessage } from "@/lib/api/errors";

import AuthorRow from "./AuthorRow";

interface RestoreAuthorModalProps {
  open: boolean;
  onClose: () => void;
  onRestored?: (author: Author) => void;
}

export default function RestoreAuthorModal({
  open,
  ...content
}: RestoreAuthorModalProps) {
  return (
    <Modal
      open={open}
      onClose={content.onClose}
      labelledBy="restore-author-title"
    >
      {/* Mounted per open, so the list is fetched fresh every time. */}
      <DeletedAuthors {...content} />
    </Modal>
  );
}

function DeletedAuthors({
  onClose,
  onRestored,
}: Omit<RestoreAuthorModalProps, "open">) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    getDeletedAuthors()
      .then((data) => {
        if (!cancelled) setAuthors(data);
      })
      .catch((fetchError) => {
        console.error(
          "Failed to fetch deleted authors:",
          fetchError
        );

        if (!cancelled) {
          setError(
            getApiErrorMessage(
              fetchError,
              "Failed to load deleted authors."
            )
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRestore = async (author: Author) => {
    if (restoringId) return;

    try {
      setRestoringId(author.id);
      setError("");

      const restored = await restoreAuthor(author.id);

      const remaining = authors.filter(
        (item) => item.id !== restored.id
      );

      setAuthors(remaining);
      onRestored?.(restored);

      if (remaining.length === 0) onClose();
    } catch (restoreError) {
      console.error("Failed to restore author:", restoreError);

      setError(
        getApiErrorMessage(
          restoreError,
          "Failed to restore author."
        )
      );
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <>
      <ModalHeader
        id="restore-author-title"
        icon={ArchiveRestore}
        title="Restore Author"
        description="Bring a previously deleted author back."
        onClose={onClose}
      />

      <div className="flex-1 space-y-2.5 overflow-y-auto p-3.5 min-[360px]:space-y-3 min-[360px]:p-4 sm:p-6">
        {error && <Alert>{error}</Alert>}

        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-[54px] animate-pulse rounded-xl bg-page min-[360px]:h-[58px] sm:h-[68px] sm:rounded-2xl"
            />
          ))
        ) : authors.length === 0 ? (
          !error && (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-page/60 px-4 py-6 text-center min-[360px]:py-8 sm:rounded-2xl sm:px-6 sm:py-10">
              <span className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-brand-start/30 min-[360px]:h-11 min-[360px]:w-11 sm:mb-3 sm:h-12 sm:w-12 sm:rounded-2xl">
                <ArchiveRestore className="h-4 w-4 min-[360px]:h-[18px] min-[360px]:w-[18px] sm:h-5 sm:w-5" />
              </span>

              <p className="text-xs font-semibold text-accent min-[360px]:text-sm">
                Nothing to restore
              </p>

              <p className="mt-0.5 text-[11px] text-muted min-[360px]:text-xs sm:mt-1">
                Deleted authors will appear here.
              </p>
            </div>
          )
        ) : (
          authors.map((author) => (
            <AuthorRow key={author.id} author={author}>
              <button
                type="button"
                onClick={() => handleRestore(author)}
                disabled={restoringId !== null}
                aria-label={`Restore ${author.name}`}
                className={`${buttonClass("primary", "sm")} h-7.5 px-2.5 text-[11px] min-[360px]:h-8 min-[360px]:px-3 min-[360px]:text-xs sm:h-9 sm:px-3 sm:text-xs`}
              >
                {restoringId === author.id ? (
                  <LoaderCircle
                    className="h-3 w-3 animate-spin min-[360px]:h-3.5 min-[360px]:w-3.5"
                  />
                ) : (
                  <RotateCcw className="h-3 w-3 min-[360px]:h-3.5 min-[360px]:w-3.5" />
                )}
                {restoringId === author.id
                  ? "Restoring..."
                  : "Restore"}
              </button>
            </AuthorRow>
          ))
        )}
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          className={`${buttonClass("secondary", "sm")} h-8.5 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm`}
        >
          Close
        </button>
      </ModalFooter>
    </>
  );
}
