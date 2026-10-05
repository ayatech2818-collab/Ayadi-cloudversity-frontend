"use client";

import DeleteDialog from "@/components/admin/ui/DeleteDialog";
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
    <DeleteDialog
      open={author !== null}
      id="author-delete-title"
      title="Delete this author?"
      description={
        <>
          They will be removed from the authors list. You can bring
          them back later with{" "}
          <span className="font-semibold text-text">
            Restore Author
          </span>
          .
        </>
      }
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {author && <AuthorRow author={author} />}
    </DeleteDialog>
  );
}
