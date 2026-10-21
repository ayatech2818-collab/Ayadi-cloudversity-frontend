'use client';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import type { ReactNode } from 'react';

import { getQueryClient, PERSIST_MAX_AGE, PUBLIC_SCOPE } from './client';
import { persister } from './persister';

/*
 * The public site's cache, restored from disk on load and saved back as it
 * changes. Until the restore finishes, queries wait rather than fetch, so a
 * saved answer is used instead of being raced by a request.
 *
 * `buster` is stamped at build time (next.config.ts), so a deploy never feeds
 * new code a cache written by the old one.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={getQueryClient()}
      persistOptions={{
        persister,
        maxAge: PERSIST_MAX_AGE,
        buster: process.env.CACHE_BUILD_ID ?? '',
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === 'success' && query.queryKey[0] === PUBLIC_SCOPE,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
