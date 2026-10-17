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
    <div className="flex items-center gap-2.5 rounded-xl bg-page/70 p-2.5 ring-1 ring-inset ring-border min-[360px]:gap-3 min-[360px]:rounded-2xl min-[360px]:p-3">
      <AuthorAvatar
        name={author.name}
        src={author.profile_image}
        className="h-9 w-9 text-xs min-[360px]:h-10 min-[360px]:w-10 min-[360px]:text-sm sm:h-11 sm:w-11"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-accent min-[360px]:text-sm">
          {author.name}
        </p>

        <p className="truncate text-[10px] text-muted min-[360px]:text-xs">
          {author.designation || "No designation"}
        </p>
      </div>

      {children}
    </div>
  );
}
