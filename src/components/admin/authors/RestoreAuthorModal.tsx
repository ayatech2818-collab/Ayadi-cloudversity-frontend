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

      <div className="flex-1 space-y-3 overflow-y-auto p-6">
        {error && <Alert>{error}</Alert>}

        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              aria-hidden="true"
              className="h-[68px] animate-pulse rounded-2xl bg-page"
            />
          ))
        ) : authors.length === 0 ? (
          !error && (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-page/60 px-6 py-10 text-center">
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-brand-start/30">
                <ArchiveRestore size={20} />
              </span>

              <p className="text-sm font-semibold text-accent">
                Nothing to restore
              </p>

              <p className="mt-1 text-xs text-muted">
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
                className={buttonClass("primary", "sm")}
              >
                {restoringId === author.id ? (
                  <LoaderCircle
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <RotateCcw size={14} />
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
          className={buttonClass("secondary")}
        >
          Close
        </button>
      </ModalFooter>
    </>
  );
}
