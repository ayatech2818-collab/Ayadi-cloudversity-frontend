"use client";

import { useState } from "react";
import { ImageOff, type LucideIcon } from "lucide-react";

interface CoverImageProps {
  src?: string | null;
  alt?: string;
  /** Shown on the placeholder when there is no image. */
  icon: LucideIcon;
  /** Extra classes for the image, e.g. a hover zoom. */
  imageClassName?: string;
}

/**
 * Fills its parent with an image. With no image — or one that fails to load —
 * it shows a navy accent-gradient placeholder instead of an empty box.
 */
export default function CoverImage({
  src,
  alt = "",
  icon: Icon,
  imageClassName = "",
}: CoverImageProps) {
  // Remembers which URL failed, so a replacement image gets its own attempt.
  const [brokenSrc, setBrokenSrc] = useState<string | null>(null);

  if (src && src !== brokenSrc) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setBrokenSrc(src)}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
    );
  }

  // Spans, not divs: a cover also sits inside a button on the cards.
  return (
    <span className="relative flex h-full w-full items-center justify-center overflow-hidden bg-accent-gradient text-white/80">
      <span
        aria-hidden="true"
        className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-brand-gradient opacity-50 blur-2xl"
      />

      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/20">
        {src ? <ImageOff size={18} /> : <Icon size={18} />}
      </span>
    </span>
  );
}
