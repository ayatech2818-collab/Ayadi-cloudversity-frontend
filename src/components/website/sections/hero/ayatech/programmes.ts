import { brandContentMap } from '@/components/website/courses/dummyData';

/*
 * What AyaTech is teaching right now — the only place its world reads the
 * catalogue.
 *
 * The journey does not depend on this list: it is shown once, as a strip in
 * the Learn beat (ProgrammeStrip.tsx), and that strip takes whatever comes
 * back — none, three, thirty, any names. Add, rename or remove a programme
 * and nothing else here needs to know.
 *
 * Today it reads the same list the courses page shows. When the public site
 * moves to the API, this is the one file to change: fetch
 * `getCourses({ brand_id, is_published: true })` (src/lib/api/courses.ts)
 * into state and return that instead — hence a hook, though it holds no
 * state yet.
 */
export type Programme = { id: string; title: string };

const CURRENT: readonly Programme[] = brandContentMap.ayatech.courses.map(({ id, title }) => ({ id, title }));

export function useAyatechProgrammes(): readonly Programme[] {
  return CURRENT;
}
