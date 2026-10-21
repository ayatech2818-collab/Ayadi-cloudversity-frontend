import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { del, get, set } from 'idb-keyval';

import { getQueryClient, PUBLIC_SCOPE } from './client';

/*
 * The cache on disk, in IndexedDB rather than localStorage: blog lists carry
 * whole articles and galleries every item, which can outgrow localStorage's
 * ~5 MB, and IndexedDB does not block the page while it reads and writes.
 * No storage on the server, so there it does nothing.
 */
export const persister = createAsyncStoragePersister({
  storage:
    typeof window === 'undefined'
      ? undefined
      : {
          getItem: async (key) => (await get<string>(key)) ?? null,
          setItem: (key, value) => set(key, value),
          removeItem: (key) => del(key),
        },
  key: 'ayadi-public-content',
  throttleTime: 1000,
});

/*
 * Drops every cached public answer, in memory and on disk, so the next page
 * that needs one fetches it. Called after the admin changes content (see the
 * API client), so an editor sees their change straight away.
 */
export async function clearPublicContentCache() {
  getQueryClient().removeQueries({ queryKey: [PUBLIC_SCOPE] });
  await persister.removeClient();
}
