"use client";

import {
  FolderTree,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import ActiveBadge from "@/components/admin/ui/ActiveBadge";
import {
  buttonClass,
  iconButtonClass,
} from "@/components/admin/ui/styles";

import type { CategoryLike } from "./category-utils";

interface CategoryCardProps {
  /** A main category or a sub category. */
  category: CategoryLike;
  icon?: LucideIcon;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Built to work two-across on a phone: the padding, type and the Edit label
 * step up from `sm`.
 */
export default function CategoryCard({
  category,
  icon: Icon = FolderTree,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-inset ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)] sm:p-5">
      {/* Decor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-gradient transition-transform duration-500 group-hover:scale-x-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-gradient opacity-10 blur-2xl"
      />

      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-brand-start/25 sm:h-10 sm:w-10">
          <Icon size={17} />
        </span>

        <ActiveBadge active={category.is_active} />
      </div>

      <h3
        title={category.name}
        className="mt-3 line-clamp-2 text-sm font-bold leading-snug tracking-[-0.01em] text-accent sm:text-base"
      >
        {category.name}
      </h3>

      <p
        title={category.slug}
        className="mt-1 truncate font-mono text-[11px] text-muted"
      >
        {category.slug}
      </p>

      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-muted sm:text-[13px]">
        {category.description || "No description provided."}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <p className="text-[11px] text-muted">
          Order{" "}
          <span className="font-semibold tabular-nums text-text">
            {category.display_order}
          </span>
        </p>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${category.name}`}
            className={buttonClass("secondary", "sm")}
          >
            <Pencil size={13} className="text-primary" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${category.name}`}
            title="Delete"
            className={iconButtonClass(true)}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
