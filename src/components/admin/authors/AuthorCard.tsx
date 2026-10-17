"use client";

import { ExternalLink, Pencil, Trash2 } from "lucide-react";

import {
  buttonClass,
  iconButtonClass,
} from "@/components/admin/ui/styles";
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
    <article className="group relative flex flex-col overflow-hidden rounded-xl bg-surface p-3.5 shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-inset ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)] min-[360px]:rounded-2xl min-[360px]:p-4 sm:p-5">
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
      <div className="flex items-center gap-3 sm:gap-4">
        <AuthorAvatar
          name={author.name}
          src={author.profile_image}
          className="h-11 w-11 text-sm min-[360px]:h-12 min-[360px]:w-12 min-[360px]:text-base sm:h-16 sm:w-16 sm:text-lg"
        />

        <div className="min-w-0">
          <h3
            title={author.name}
            className="truncate text-sm font-bold tracking-[-0.01em] text-accent min-[360px]:text-base"
          >
            {author.name}
          </h3>

          {author.designation ? (
            <p
              title={author.designation}
              className="mt-1 inline-block max-w-full truncate rounded-full bg-primary/10 px-2 py-0.5 align-top text-[10px] font-semibold text-primary-hover min-[360px]:mt-1.5 min-[360px]:px-2.5 min-[360px]:text-[11px]"
            >
              {author.designation}
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-muted min-[360px]:mt-1.5 min-[360px]:text-xs">
              No designation
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      <p className="mt-2.5 line-clamp-3 min-h-[48px] text-xs leading-[18px] text-muted min-[360px]:mt-3 min-[360px]:text-[13px] min-[360px]:leading-5 sm:mt-4 sm:min-h-[60px]">
        {author.bio || "No bio added yet."}
      </p>

      {/* Footer */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-3.5 min-[360px]:pt-4 sm:gap-3 sm:pt-5">
        {author.linkedin_url ? (
          <a
            href={author.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-[360px]:gap-1.5 min-[360px]:text-xs"
          >
            <ExternalLink className="h-3 w-3 min-[360px]:h-3.5 min-[360px]:w-3.5" />
            LinkedIn
          </a>
        ) : (
          <span className="text-[11px] text-muted min-[360px]:text-xs">
            No LinkedIn
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${author.name}`}
            className={`${buttonClass("secondary", "sm")} h-7.5 px-2.5 text-[11px] min-[360px]:h-8 min-[360px]:px-3 min-[360px]:text-xs sm:h-9 sm:px-3 sm:text-xs`}
          >
            <Pencil className="h-3 w-3 text-primary min-[360px]:h-[13px] min-[360px]:w-[13px]" />
            Edit
          </button>

          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${author.name}`}
            title="Delete"
            className={`${iconButtonClass(true)} h-7.5 w-7.5 rounded-lg min-[360px]:h-8 min-[360px]:w-8 min-[360px]:rounded-xl sm:h-9 sm:w-9`}
          >
            <Trash2 className="h-3.5 w-3.5 min-[360px]:h-[15px] min-[360px]:w-[15px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
