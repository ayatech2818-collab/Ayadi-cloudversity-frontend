"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";

import { getInitials } from "./author-utils";

interface AuthorAvatarProps {
  name: string;
  src?: string | null;
  /** Size plus the initials' text size, e.g. "h-16 w-16 text-lg". */
  className?: string;
}

/**
 * Photo in a brand-gradient ring. With no photo — or one that fails to load —
 * it falls back to the author's initials on the navy accent gradient.
 */
export default function AuthorAvatar({
  name,
  src,
  className = "h-16 w-16 text-lg",
}: AuthorAvatarProps) {
  // Remembers which URL failed, so a replacement photo gets its own attempt.
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

  const initials = getInitials(name);

  return (
    <span
      className={`flex shrink-0 rounded-full bg-brand-gradient p-0.5 ${className}`}
    >
      <span className="flex h-full w-full rounded-full bg-surface p-0.5">
        <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-accent-gradient font-bold text-white">
          {src && src !== brokenSrc ? (
            <img
              src={src}
              alt=""
              loading="lazy"
              onError={() => setBrokenSrc(src)}
              className="h-full w-full object-cover"
            />
          ) : initials ? (
            <span aria-hidden="true">{initials}</span>
          ) : (
            <UserRound
              aria-hidden="true"
              className="h-[45%] w-[45%] text-white/80"
            />
          )}
        </span>
      </span>
    </span>
  );
}
