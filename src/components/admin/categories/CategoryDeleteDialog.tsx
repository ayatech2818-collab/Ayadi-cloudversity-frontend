"use client";

import { FolderTree, type LucideIcon } from "lucide-react";

import ActiveBadge from "@/components/admin/ui/ActiveBadge";
import DeleteDialog from "@/components/admin/ui/DeleteDialog";

import type { CategoryLike } from "./category-utils";

interface CategoryDeleteDialogProps {
  /** A main category or a sub category. */
  category: CategoryLike | null;
  /** What it is called in the wording, e.g. "sub category". */
  noun?: string;
  /** The level it is removed from, e.g. "main category". */
  parent?: string;
  icon?: LucideIcon;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function CategoryDeleteDialog({
  category,
  noun = "category",
  parent = "brand",
  icon: Icon = FolderTree,
  loading = false,
  onCancel,
  onConfirm,
}: CategoryDeleteDialogProps) {
  return (
    <DeleteDialog
      open={category !== null}
      id="category-delete-title"
      title={`Delete this ${noun}?`}
      description={`The ${noun} will be removed from its ${parent}.`}
      loading={loading}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {category && (
        <div className="flex items-center gap-3 rounded-2xl bg-page/70 p-3 ring-1 ring-inset ring-border">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <Icon size={17} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-accent">
              {category.name}
            </p>

            <p className="truncate font-mono text-[11px] text-muted">
              {category.slug}
            </p>
          </div>

          <ActiveBadge active={category.is_active} />
        </div>
      )}
    </DeleteDialog>
  );
}
