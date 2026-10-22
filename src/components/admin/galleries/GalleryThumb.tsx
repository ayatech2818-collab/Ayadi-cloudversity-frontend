"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Play } from "lucide-react";

import type { GalleryItem } from "@/lib/api/galleries";

/**
 * A small square preview of one gallery item. Image objects can 403 or vanish,
 * so each image tile keeps its own broken flag and falls back to a placeholder.
 * Videos stay lightweight here; playback remains in the media manager.
 */
export default function GalleryThumb({ item }: { item: GalleryItem }) {
  const [broken, setBroken] = useState(false);

  return (
    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-page text-muted ring-1 ring-border">
      {item.media_type === "video" ? (
        <>
          <span
            aria-hidden="true"
            className="h-full w-full bg-accent-strong"
          />

          <Play
            size={12}
            className="absolute fill-white text-white drop-shadow"
          />
        </>
      ) : broken ? (
        <ImageOff size={14} className="opacity-50" />
      ) : (
        <Image
          src={item.file_url}
          alt={item.alt_text || item.file_name}
          width={36}
          height={36}
          sizes="36px"
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}
