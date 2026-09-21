'use client';

import { ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

/* The same navy↔green blends the media grid falls back to, so a missing photo
   still belongs to the site rather than showing a broken box. */
const TINTS = [
  'from-[#0d3b2e] via-[#12513d] to-[#1e2b57]',
  'from-[#1e2b57] via-[#24406b] to-[#0d3b2e]',
  'from-[#123f33] via-[#1a2e5c] to-[#0a2a22]',
  'from-[#182b4f] via-[#14513f] to-[#0c2a45]',
];

/*
 * A collage photo, or a branded tile when there isn't one.
 *
 * The collage runs on placeholder URLs until the real shoot is wired up, so
 * every card has to survive a request that never resolves — an offline preview
 * or a blocked host should still show a finished-looking section.
 */
export function JourneyImage({
  src,
  alt,
  sizes,
  seed,
}: {
  src: string;
  alt: string;
  sizes: string;
  /** Picks the fallback tint. Pass the card's position so it stays stable. */
  seed: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div aria-hidden="true" className={`absolute inset-0 bg-linear-to-br ${TINTS[seed % TINTS.length]}`}>
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] bg-size-[20px_20px] [mask-image:radial-gradient(ellipse_at_50%_50%,black_10%,transparent_75%)]" />

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-white/60 ring-1 ring-inset ring-white/20">
            <ImageIcon size={18} strokeWidth={1.8} />
          </span>
        </div>
      </div>
    );
  }

  return <Image src={src} alt={alt} fill sizes={sizes} onError={() => setFailed(true)} className="object-cover" />;
}
