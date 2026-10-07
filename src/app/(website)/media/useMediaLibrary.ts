'use client';

import { useEffect, useState } from 'react';

import { getGalleries } from '@/lib/api/galleries';

import { pickReel, toAlbums, type Album, type MediaEntry } from './media';

type Library = {
  status: 'loading' | 'ready' | 'error';
  albums: Album[];
  reel: MediaEntry[];
};

const LOADING: Library = { status: 'loading', albums: [], reel: [] };
const FAILED: Library = { status: 'error', albums: [], reel: [] };

/*
 * The published galleries, shaped for the Media page.
 *
 * A failed request resolves to an empty library with `status: 'error'` — there
 * is no fallback content, so the page can only ever show what the API returned.
 */
export function useMediaLibrary(): Library & { retry: () => void } {
  const [library, setLibrary] = useState<Library>(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getGalleries({ is_published: true })
      .then((galleries) => {
        if (cancelled) return;

        const albums = toAlbums(galleries);

        /* The reel is drawn here, once per load, and kept in state — so it is
           different on each visit but holds still across re-renders. */
        setLibrary({ status: 'ready', albums, reel: pickReel(albums, Math.random) });
      })
      .catch((error: unknown) => {
        if (cancelled) return;

        console.error('Failed to load galleries:', error);
        setLibrary(FAILED);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLibrary(LOADING);
    setAttempt((current) => current + 1);
  };

  return { ...library, retry };
}
