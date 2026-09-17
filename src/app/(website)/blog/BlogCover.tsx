'use client';

import Image from 'next/image';
import { useState } from 'react';

const FALLBACK = '/images/blog/placeholder.svg';

/*
 * The cover art in posts.ts points at files that may not be on disk yet. A
 * missing file would otherwise render as a broken-image box with alt text
 * sprawled across the card, so failures fall back to a branded placeholder.
 * Drop the real jpgs into public/images/blog/ and this gets out of the way.
 */
export default function BlogCover({
  src,
  alt,
  sizes,
  priority = false,
  className = '',
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      src={failed ? FALLBACK : src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      // The optimizer refuses SVG by default; the placeholder is already tiny.
      unoptimized={failed}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
