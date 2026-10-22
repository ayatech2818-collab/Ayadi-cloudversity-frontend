import { QueryClient } from '@tanstack/react-query';

/*
 * The public site's data cache.
 *
 * Content (courses, blogs, galleries) changes rarely, so a cached answer is
 * served as-is for STALE_TIME — no request at all, across pages and across
 * refreshes. After that it is still shown instantly, and a fresh copy is
 * fetched in the background and swapped in. The cache is kept on disk for
 * PERSIST_MAX_AGE; older than that, a page loads as if for the first time.
 */
export const STALE_TIME = 30 * 60 * 1000;
export const PERSIST_MAX_AGE = 24 * 60 * 60 * 1000;

/** Every public-content key starts with this, so it can be persisted and cleared as one. */
export const PUBLIC_SCOPE = 'public';

export const publicKeys = {
  catalogue: [PUBLIC_SCOPE, 'courses', 'catalogue'] as const,
  featuredCourses: [PUBLIC_SCOPE, 'courses', 'featured'] as const,
  blogs: (category: string) => [PUBLIC_SCOPE, 'blogs', category] as const,
  galleries: [PUBLIC_SCOPE, 'galleries'] as const,
  feedback: [PUBLIC_SCOPE, 'feedback'] as const,
};

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME,
        // Must outlive the persisted copy, or entries are dropped before they are saved.
        gcTime: PERSIST_MAX_AGE,
        // Only a stale query refetches on mount; a tab coming back into focus does not.
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/* A new client per server render, one shared client in the browser — so the
   cache survives moving between pages. */
export function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
