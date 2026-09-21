import { existsSync } from 'node:fs';
import { join } from 'node:path';

/*
 * Whether a file exists under /public — so a section can ship with named image
 * slots before the photography arrives, and show a designed placeholder rather
 * than a broken image (and a 404 in the console) until it does.
 *
 * Server-only: it reads the filesystem, so the build fails loudly if a client
 * component ever imports it. The Home page is prerendered, which means the
 * check runs at build time — in development a refresh picks up a new file, in
 * production it needs the rebuild a new image would get anyway.
 */
export function hasPublicAsset(src: string) {
  return existsSync(join(process.cwd(), 'public', src));
}
