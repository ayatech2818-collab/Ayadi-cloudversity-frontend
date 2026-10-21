'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getPublicGalleries, type Gallery } from '@/lib/api/galleries';
import { publicKeys } from '@/lib/query/client';

import { pickReel, toAlbums, type Album, type MediaEntry } from './media';

type Library = {
  status: 'loading' | 'ready' | 'error';
  albums: Album[];
  reel: MediaEntry[];
};

const LOADING: Library = { status: 'loading', albums: [], reel: [] };
const FAILED: Library = { status: 'error', albums: [], reel: [] };

/* Shapes the cached galleries for the page. A query's `select` runs once per
   mounted page and again only when the data changes, so the reel is drawn
   here — different on each visit, but holding still across re-renders. */
const toLibrary = (galleries: Gallery[]): Library => {
  const albums = toAlbums(galleries);
  return { status: 'ready', albums, reel: pickReel(albums, Math.random) };
};

/*
 * The published galleries, shaped for the Media page.
 *
 * Cached (src/lib/query), so a later visit or a refresh opens straight from
 * the cache. A failed request resolves to an empty library with
 * `status: 'error'` — there is no fallback content, so the page can only ever
 * show what the API returned. A failed background refresh keeps the cached
 * library on screen.
 */
export function useMediaLibrary(): Library & { retry: () => void } {
  const galleries = useQuery({
    queryKey: publicKeys.galleries,
    queryFn: () => getPublicGalleries(),
    select: toLibrary,
  });

  useEffect(() => {
    if (galleries.error && !galleries.data) console.error('Failed to load galleries:', galleries.error);
  }, [galleries.error, galleries.data]);

  const { refetch } = galleries;
  const retry = () => {
    void refetch();
  };

  // A retry after a failure shows as loading again, not as the old error.
  const library = galleries.data ?? (galleries.isError && !galleries.isFetching ? FAILED : LOADING);
  return { ...library, retry };
}
