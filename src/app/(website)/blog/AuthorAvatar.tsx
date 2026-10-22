'use client';

import { UserRound } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function AuthorAvatar({
  src,
  name,
  sizes,
  className = 'size-10',
}: {
  src?: string | null;
  name?: string | null;
  sizes: string;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src && failedSrc !== src);
  const label = name?.trim() || 'Blog author';

  return (
    <span
      role="img"
      aria-label={`${label} profile photo`}
      title={label}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gradient text-white shadow-[0_10px_24px_-12px_rgba(20,29,63,0.8)] ring-2 ring-surface ${className}`}
    >
      {showImage && src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          onError={() => setFailedSrc(src)}
          className="object-cover"
        />
      ) : (
        <UserRound aria-hidden="true" className="size-1/2" strokeWidth={1.8} />
      )}
    </span>
  );
}
