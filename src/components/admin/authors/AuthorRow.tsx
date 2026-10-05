"use client";

import type { ReactNode } from "react";

import type { Author } from "@/lib/api/authors";

import AuthorAvatar from "./AuthorAvatar";

interface AuthorRowProps {
  author: Author;
  /** Optional action shown at the end of the row. */
  children?: ReactNode;
}

/** Compact author summary used inside the delete and restore dialogs. */
export default function AuthorRow({
  author,
  children,
}: AuthorRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-page/70 p-3 ring-1 ring-inset ring-border">
      <AuthorAvatar
        name={author.name}
        src={author.profile_image}
        className="h-11 w-11 text-sm"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-accent">
          {author.name}
        </p>

        <p className="truncate text-xs text-muted">
          {author.designation || "No designation"}
        </p>
      </div>

      {children}
    </div>
  );
}
