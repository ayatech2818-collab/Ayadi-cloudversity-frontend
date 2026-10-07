'use client';

import { Film, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import type { MediaType } from './media';

/*
 * Four navy↔green blends. The tint is picked from the seed, so a given item
 * always falls back to the same colour and the grid reads as a designed mosaic
 * rather than a row of identical grey boxes.
 */
const TINTS = [
  'from-[#0d3b2e] via-[#12513d] to-[#1e2b57]',
  'from-[#1e2b57] via-[#24406b] to-[#0d3b2e]',
  'from-[#123f33] via-[#1a2e5c] to-[#0a2a22]',
  'from-[#182b4f] via-[#14513f] to-[#0c2a45]',
];

const tintFor = (seed: string) => {
  let sum = 0;

  for (let index = 0; index < seed.length; index += 1) sum += seed.charCodeAt(index);

  return TINTS[sum % TINTS.length];
};

/*
 * Renders a photo, or the opening frame of a film. A film's URL is a video
 * file, which next/image cannot take, so it gets a muted <video> held on its
 * first frame instead — the caller lays the Play badge over it.
 *
 * Either one falls back to a branded placeholder when there is no file or it
 * will not load, so a broken S3 object never leaves an empty box.
 */
export default function MediaImage({
  src,
  alt,
  sizes,
  seed,
  type,
  label,
  priority = false,
  className = '',
}: {
  src: string;
  alt: string;
  sizes: string;
  /** Chooses the fallback tint. Pass the item's id so it stays stable. */
  seed: string;
  type: MediaType;
  label: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    const Icon = type === 'video' ? Film : ImageIcon;

    return (
      <div aria-hidden="true" className={`absolute inset-0 bg-linear-to-br ${tintFor(seed)} ${className}`}>
        {/* Same dot field the dark sections use, so the placeholder belongs to
            the same family as the rest of the site. */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] bg-size-[22px_22px] [mask-image:radial-gradient(ellipse_at_50%_50%,black_10%,transparent_75%)]" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-white/70 ring-1 ring-inset ring-white/20">
            <Icon size={20} strokeWidth={1.8} />
          </span>

          <span className="max-w-[18ch] text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">{label}</span>
        </div>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <video
        /* The time fragment makes Safari paint a frame — given metadata alone
           it leaves the box blank until the film is played. */
        src={`${src}#t=0.1`}
        muted
        playsInline
        preload="metadata"
        tabIndex={-1}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        onError={() => setFailed(true)}
        className={`absolute inset-0 size-full object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={priority}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
