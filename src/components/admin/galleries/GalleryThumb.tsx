"use client";

import { useState } from "react";
import { ImageOff, Play } from "lucide-react";

import type { GalleryItem } from "@/lib/api/galleries";

/**
 * A small square preview of one gallery item. S3 objects can 403 or vanish
 * behind the back of the dashboard, so every tile keeps its own broken flag
 * and falls back to a placeholder instead of an empty box.
 */
export default function GalleryThumb({ item }: { item: GalleryItem }) {
  const [broken, setBroken] = useState(false);

  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-page text-muted ring-1 ring-border">
      {broken ? (
        <ImageOff size={14} className="opacity-50" />
      ) : item.media_type === "video" ? (
        <>
          <video
            src={item.file_url}
            muted
            playsInline
            preload="metadata"
            onError={() => setBroken(true)}
            className="h-full w-full bg-accent-strong object-cover"
          />

          <Play
            size={12}
            className="absolute fill-white text-white drop-shadow"
          />
        </>
      ) : (
        <img
          src={item.file_url}
          alt={item.alt_text || item.file_name}
          loading="lazy"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}
