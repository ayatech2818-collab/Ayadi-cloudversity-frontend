"use client";

import { useEffect, useState } from "react";
import { RotateCcw, UserRound, X } from "lucide-react";

import {
  getAuthor,
  getDeletedAuthors,
  restoreAuthor,
  type Author,
} from "@/lib/api/authors";

interface RestoreAuthorModalProps {
  open: boolean;
  onClose: () => void;
  onRestored?: (author: Author) => void;
}

export default function RestoreAuthorModal({
  open,
  onClose,
  onRestored,
}: RestoreAuthorModalProps) {
  const [deletedAuthors, setDeletedAuthors] = useState<Author[]>([]);
  const [selectedAuthorId, setSelectedAuthorId] = useState("");
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingAuthor, setLoadingAuthor] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const fetchDeletedAuthors = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDeletedAuthors();

        setDeletedAuthors(data);
        setSelectedAuthorId("");
        setSelectedAuthor(null);
      } catch (error) {
        console.error("Failed to fetch deleted authors:", error);
        setError("Failed to load deleted authors.");
      } finally {
        setLoading(false);
      }
    };

    fetchDeletedAuthors();
  }, [open]);

  const handleSelectAuthor = async (authorId: string) => {
    setSelectedAuthorId(authorId);
    setSelectedAuthor(null);
    setError("");

    if (!authorId) return;

    try {
      setLoadingAuthor(true);

      const author = await getAuthor(authorId);

      if (author.is_active) {
        setError("This author is already active.");
        return;
      }

      setSelectedAuthor(author);
    } catch (error) {
      console.error("Failed to fetch author:", error);
      setError("Failed to load author details.");
    } finally {
      setLoadingAuthor(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedAuthor) return;

    try {
      setRestoring(true);
      setError("");

      const restoredAuthor = await restoreAuthor(selectedAuthor.id);

      setDeletedAuthors((current) =>
        current.filter((author) => author.id !== restoredAuthor.id)
      );

      setSelectedAuthor(null);
      setSelectedAuthorId("");

      onRestored?.(restoredAuthor);

      if (deletedAuthors.length <= 1) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to restore author:", error);
      setError("Failed to restore author.");
    } finally {
      setRestoring(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Restore Author
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Restore a previously deleted author.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={restoring}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 p-6">

          {/* Author selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Deleted Authors
            </label>

            {loading ? (
              <div className="flex h-11 items-center rounded-lg border border-gray-200 px-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#15803d]" />

                <span className="ml-2 text-sm text-gray-500">
                  Loading...
                </span>
              </div>
            ) : deletedAuthors.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-500">
                No deleted authors found.
              </div>
            ) : (
              <select
                value={selectedAuthorId}
                onChange={(event) =>
                  handleSelectAuthor(event.target.value)
                }
                disabled={restoring}
                className="h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-[#15803d] focus:ring-2 focus:ring-[#15803d]/10"
              >
                <option value="">Select an author</option>

                {deletedAuthors.map((author) => (
                  <option key={author.id} value={author.id}>
                    {author.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Loading selected author */}
          {loadingAuthor && (
            <div className="flex items-center justify-center rounded-xl border border-gray-100 bg-gray-50 py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-[#15803d]" />
            </div>
          )}

          {/* Selected author */}
          {selectedAuthor && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <div className="flex items-start gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                  {selectedAuthor.profile_image ? (
                    <img
                      src={selectedAuthor.profile_image}
                      alt={selectedAuthor.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound
                      size={25}
                      className="text-gray-400"
                    />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">
                    {selectedAuthor.name}
                  </h3>

                  {selectedAuthor.designation && (
                    <p className="mt-1 text-sm text-[#15803d]">
                      {selectedAuthor.designation}
                    </p>
                  )}

                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    Deleted
                  </span>
                </div>
              </div>

              {selectedAuthor.bio && (
                <p className="mt-4 text-sm leading-6 text-gray-600">
                  {selectedAuthor.bio}
                </p>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={restoring}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleRestore}
            disabled={!selectedAuthor || restoring}
            className="inline-flex items-center gap-2 rounded-lg bg-[#15803d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#166534] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {restoring ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <RotateCcw size={16} />
            )}

            {restoring ? "Restoring..." : "Restore Author"}
          </button>
        </div>
      </div>
    </div>
  );
}