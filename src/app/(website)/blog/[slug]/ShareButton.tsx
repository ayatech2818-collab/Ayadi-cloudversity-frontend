'use client';

import { Check, Share2 } from 'lucide-react';
import { useState } from 'react';

/*
 * Uses the OS share sheet where it exists — the person still picks the target —
 * and falls back to copying the URL. The old button was inert.
 */
export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
      } catch {
        // Dismissed, or the sheet refused — nothing to recover from.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (insecure context or denied permission).
    }
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-muted ring-1 ring-inset ring-border transition-colors duration-300 hover:text-primary hover:ring-primary/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {copied ? (
        <>
          <Check aria-hidden="true" size={16} className="text-primary" />
          Link copied
        </>
      ) : (
        <>
          <Share2 aria-hidden="true" size={16} />
          Share article
        </>
      )}
    </button>
  );
}
