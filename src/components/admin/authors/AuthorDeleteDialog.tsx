"use client";

import { LoaderCircle, Trash2, TriangleAlert } from "lucide-react";

import Modal from "@/components/admin/ui/Modal";
import { buttonClass } from "@/components/admin/ui/styles";
import type { Author } from "@/lib/api/authors";

import AuthorRow from "./AuthorRow";

interface AuthorDeleteDialogProps {
  author: Author | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function AuthorDeleteDialog({
  author,
  loading = false,
  onCancel,
  onConfirm,
}: AuthorDeleteDialogProps) {
  return (
    <Modal
      open={author !== null}
      busy={loading}
      onClose={onCancel}
      labelledBy="author-delete-title"
      size="sm"
    >
      {author && (
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-inset ring-rose-100">
              <TriangleAlert size={20} />
            </span>

            <div className="min-w-0">
              <h3
                id="author-delete-title"
                className="text-base font-bold text-accent"
              >
                Delete this author?
              </h3>

              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                They will be removed from the authors list. You
                can bring them back later with{" "}
                <span className="font-semibold text-text">
                  Restore Author
                </span>
                .
              </p>
            </div>
          </div>

          <div className="mt-4">
            <AuthorRow author={author} />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              autoFocus
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
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
