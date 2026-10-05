"use client";

import { useEffect, useMemo, useState } from "react";

import AuthorCard from "@/components/admin/authors/AuthorCard";
import AuthorDeleteDialog from "@/components/admin/authors/AuthorDeleteDialog";
import AuthorModal from "@/components/admin/authors/AuthorModal";
import AuthorsEmptyState from "@/components/admin/authors/AuthorsEmptyState";
import AuthorsHeader from "@/components/admin/authors/AuthorsHeader";
import AuthorsSkeleton from "@/components/admin/authors/AuthorsSkeleton";
import AuthorsToolbar from "@/components/admin/authors/AuthorsToolbar";
import RestoreAuthorModal from "@/components/admin/authors/RestoreAuthorModal";
import {
  AUTHORS_GRID,
  filterAuthors,
  sortAuthors,
} from "@/components/admin/authors/author-utils";
import { Toaster, useToasts } from "@/components/admin/ui/Toast";

import {
  createAuthor,
  deleteAuthor,
  getAuthors,
  updateAuthor,
  type Author,
} from "@/lib/api/authors";
import { getApiErrorMessage } from "@/lib/api/errors";

interface AuthorEditor {
  mode: "create" | "edit";
  author: Author | null;
}

export default function AuthorsPage() {
  const { toasts, toastSuccess, toastError, dismissToast } =
    useToasts();

  // =========================================================
  // DATA
  // =========================================================

  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bumped by "Retry" to run the same request again.
  const [reloadToken, setReloadToken] = useState(0);

  const [search, setSearch] = useState("");

  // =========================================================
  // UI
  // =========================================================

  const [editor, setEditor] = useState<AuthorEditor | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Author | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // =========================================================
  // FETCH
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    getAuthors()
      .then((data) => {
        if (cancelled) return;

        setAuthors(data);
        setError(null);
      })
      .catch((fetchError) => {
        if (cancelled) return;

        console.error("Failed to fetch authors:", fetchError);

        setError(
          getApiErrorMessage(
            fetchError,
            "Something went wrong while fetching the authors."
          )
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = () => {
    setLoading(true);
    setReloadToken((token) => token + 1);
  };

  const visibleAuthors = useMemo(
    () => filterAuthors(authors, search),
    [authors, search]
  );

  // =========================================================
  // CREATE / EDIT
  // =========================================================

  const openCreate = () =>
    setEditor({ mode: "create", author: null });

  const closeEditor = () => setEditor(null);

  /**
   * Errors are left to throw so the modal can show them inline and keep the
   * form open with the values intact.
   */
  const handleSubmit = async (
    data: FormData,
    mode: "create" | "edit",
    authorId?: string
  ) => {
    if (mode === "create") {
      const created = await createAuthor(data);

      setAuthors((current) => sortAuthors([...current, created]));

      toastSuccess(
        "Author added",
        `${created.name} can now be credited on blog posts.`
      );
    } else {
      if (!authorId) {
        throw new Error("Author ID is missing.");
      }

      const updated = await updateAuthor(authorId, data);

      setAuthors((current) =>
        sortAuthors(
          current.map((author) =>
            author.id === updated.id ? updated : author
          )
        )
      );

      toastSuccess(
        "Author updated",
        `${updated.name}'s profile has been saved.`
      );
    }

    closeEditor();
  };

  // =========================================================
  // DELETE / RESTORE
  // =========================================================

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    try {
      setDeleting(true);

      await deleteAuthor(deleteTarget.id);

      setAuthors((current) =>
        current.filter((author) => author.id !== deleteTarget.id)
      );

      toastSuccess(
        "Author deleted",
        `${deleteTarget.name} can be brought back with Restore Author.`
      );

      setDeleteTarget(null);
    } catch (deleteError) {
      console.error("Failed to delete author:", deleteError);

      toastError(
        "Could not delete author",
        getApiErrorMessage(deleteError)
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleRestored = (restored: Author) => {
    setAuthors((current) => sortAuthors([...current, restored]));

    toastSuccess(
      "Author restored",
      `${restored.name} is back in the authors list.`
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-full pb-16">
      <AuthorsHeader
        authors={authors}
        loading={loading}
        onAdd={openCreate}
        onRestore={() => setRestoreOpen(true)}
      />

      <AuthorsToolbar
        search={search}
        resultCount={visibleAuthors.length}
        totalCount={authors.length}
        loading={loading}
        onSearchChange={setSearch}
      />

      {/* Grid */}
      <section className="px-4 pt-5 sm:px-6 lg:px-8">
        {loading ? (
          <AuthorsSkeleton />
        ) : !error && visibleAuthors.length > 0 ? (
          <div className={AUTHORS_GRID}>
            {visibleAuthors.map((author) => (
              <AuthorCard
                key={author.id}
                author={author}
                onEdit={() => setEditor({ mode: "edit", author })}
                onDelete={() => setDeleteTarget(author)}
              />
            ))}
          </div>
        ) : (
          <AuthorsEmptyState
            error={error}
            hasSearch={search.trim() !== ""}
            onRetry={retry}
            onClearSearch={() => setSearch("")}
            onCreate={openCreate}
          />
        )}
      </section>

      {/* Create / Edit */}
      <AuthorModal
        open={editor !== null}
        mode={editor?.mode ?? "create"}
        author={editor?.author ?? null}
        onClose={closeEditor}
        onSubmit={handleSubmit}
      />

      {/* Restore */}
      <RestoreAuthorModal
        open={restoreOpen}
        onClose={() => setRestoreOpen(false)}
        onRestored={handleRestored}
      />

      {/* Delete */}
      <AuthorDeleteDialog
        author={deleteTarget}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
