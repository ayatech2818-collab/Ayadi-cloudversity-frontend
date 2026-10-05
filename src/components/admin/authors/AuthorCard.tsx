"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";

import { buttonClass } from "@/components/admin/ui/styles";
import type { Author } from "@/lib/api/authors";

import AuthorAvatar from "./AuthorAvatar";

interface AuthorCardProps {
  author: Author;
  onEdit: () => void;
  onDelete: () => void;
}

export default function AuthorCard({
  author,
  onEdit,
  onDelete,
}: AuthorCardProps) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface p-5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-inset ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)]">
      {/* Decor */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-brand-gradient transition-transform duration-500 group-hover:scale-x-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-gradient opacity-10 blur-2xl"
      />

      {/* Identity */}
      <div className="flex items-center gap-4">
        <AuthorAvatar
          name={author.name}
          src={author.profile_image}
        />

        <div className="min-w-0">
          <h3
            title={author.name}
            className="truncate text-base font-bold tracking-[-0.01em] text-accent"
          >
            {author.name}
          </h3>

          {author.designation ? (
            <p
              title={author.designation}
              className="mt-1.5 inline-block max-w-full truncate rounded-full bg-primary/10 px-2.5 py-0.5 align-top text-[11px] font-semibold text-primary-hover"
            >
              {author.designation}
            </p>
          ) : (
            <p className="mt-1.5 text-xs text-muted">
              No designation
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="mt-4 line-clamp-3 min-h-[60px] text-[13px] leading-5 text-muted">
        {author.bio || "No bio added yet."}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        {author.linkedin_url ? (
          <a
            href={author.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ExternalLink size={14} />
            LinkedIn
          </a>
        ) : (
          <span className="text-xs text-muted">No LinkedIn</span>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${author.name}`}
            className={buttonClass("secondary", "sm")}
          >
            <Pencil size={13} className="text-primary" />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${author.name}`}
            title="Delete"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-muted ring-1 ring-inset ring-border transition-colors hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
