import type gsap from 'gsap';

import type { Layout } from './layout';
import { RIG_START, type AyatechRig, type StoryKey } from './rig';

/*
 * AyaTech's score: one timeline, TOTAL units long, scrubbed across the pinned
 * scroll — written the way the hero's is (AyadiHero.tsx SCORE). Every line
 * moves one rig value: [what, to, when, how long, ease]. Each starts from
 * where that value's previous line left it, and no two lines for one value
 * overlap, so a scroll position is always the same frame however it was
 * reached.
 *
 *   IDEA → EXPLORE → LEARN → EXPERIMENT → BUILD → DELIVER → the name
 *
 * Nothing in here knows a course. The catalogue is content the Learn beat
 * shows (ProgrammeStrip.tsx), never something the story is timed to.
 */

/** When each beat begins. */
export const AT = {
  idea: 0,
  explore: 1.9,
  learn: 3.5,
  experiment: 4.7,
  build: 5.8,
  deliver: 7.6,
  /** Deliver's second half: past Ayadi, to the plots round it. */
  beyond: 8.3,
  ayatech: 9.2,
  reveal: 9.85,
} as const;

export const TOTAL = 10.4;

/** The pinned scroll, as a percentage of the viewport's height. A phone gets
    a shorter one: the same story, fewer screens of thumb. */
export const SCROLL = { wide: 740, compact: 580 } as const;

/** The six chapters the rail names, in order (content.ts CHAPTERS). */
export const CHAPTER_AT = [AT.idea, AT.explore, AT.learn, AT.experiment, AT.build, AT.deliver] as const;

/** Where the rail drops you in each: not its first frame, which is still the
    last one's exit, but the moment it is composed and its words are up. */
export const CHAPTER_VIEW = [1.25, 3.15, 4.3, 5.5, 7.3, 8.1] as const;

/** Which chapter a moment belongs to. */
export function chapterAt(time: number) {
  let chapter = 0;
  for (let index = 1; index < CHAPTER_AT.length; index++) if (time >= CHAPTER_AT[index]) chapter = index;
  return chapter;
}

export type Line = [key: StoryKey, to: number, at: number, duration: number, ease?: string];

/* Camera distances are written for the wide stage; `near` and `mapDist`
   are the layout's say in them (layout.ts). In time order. */
export function score({ near, mapDist }: Pick<Layout, 'near' | 'mapDist'>): Line[] {
  return [
    /* ---------- IDEA ----------
       Dark, and one point. The camera drifts in the whole way so the hold is
       never still; the point swells, starts throwing waves, the dust answers,
       and scraps of code flicker round it. */
    ['dist', 5.2 * near, 0, 1.9, 'sine.inOut'],
    ['signal', 0.34, 0.15, 0.75, 'power1.out'],
    ['dust', 0.85, 0.35, 1.4, 'sine.inOut'],
    ['rings', 1, 0.55, 1.1, 'power1.inOut'],
    ['signal', 1, 0.9, 0.95, 'power2.in'],
    ['code', 1, 1, 0.7, 'power1.out'],

    /* ---------- EXPLORE ----------
       The point opens: seven domains leave it for their places, and it stays
       behind as their hub. The camera is thrown back by it, then travels in
       through the field. */
    ['field', 1, 1.85, 0.95, 'power2.out'],
    ['code', 0, 1.85, 0.5, 'power1.in'],
    ['signal', 0.3, 1.9, 0.6, 'power2.out'],
    ['rings', 0.3, 1.9, 0.7, 'power1.out'],
    ['dist', 12.4 * near, 1.9, 0.75, 'power2.out'],
    ['yaw', -0.42, 1.9, 0.7, 'sine.out'],
    ['pitch', 0.1, 1.9, 0.8, 'sine.inOut'],
    ['aside', 1, 1.9, 0.9, 'sine.inOut'],
    ['yaw', 0.3, 2.6, 0.9, 'sine.inOut'],
    ['dist', 9.4 * near, 2.65, 0.85, 'sine.inOut'],

    /* ---------- LEARN ----------
       Routes light through the field, domain to domain. */
    ['routes', 1, 3.5, 0.85, 'power1.inOut'],
    ['yaw', -0.14, 3.5, 1.2, 'sine.inOut'],
    ['dist', 10.2 * near, 3.5, 1.2, 'sine.inOut'],
    ['pitch', 0.16, 3.5, 1.2, 'sine.inOut'],

    /* ---------- EXPERIMENT ----------
       The domains pull in to a ring and try each other: connections form,
       fail, form again. One arrangement holds. */
    ['lab', 1, 4.65, 0.55, 'power2.inOut'],
    ['signal', 0.14, 4.7, 0.6, 'power1.inOut'],
    ['rings', 0, 4.7, 0.5, 'power1.in'],
    ['dist', 8.4 * near, 4.7, 0.9, 'sine.inOut'],
    ['yaw', 0.2, 4.7, 1.1, 'sine.inOut'],
    ['pitch', 0.06, 4.7, 0.9, 'sine.inOut'],
    ['hold', 1, 5.35, 0.4, 'power2.out'],

    /* ---------- BUILD ----------
       That arrangement comes off the ring and locks into layers as the
       camera swings up and round it. Layers, then what joins them, then
       requests running through, then the pipeline shipping it. The camera
       keeps turning through the hold. */
    ['stack', 1, 5.8, 0.75, 'power2.inOut'],
    ['signal', 0, 5.8, 0.5, 'power1.in'],
    ['yaw', -0.62, 5.8, 0.9, 'power1.inOut'],
    ['pitch', 0.42, 5.8, 0.9, 'power1.inOut'],
    ['dist', 11.4 * near, 5.8, 0.9, 'power1.inOut'],
    ['lift', 0.5, 5.8, 0.9, 'sine.inOut'],
    ['plates', 1, 6.05, 0.75, 'power1.inOut'],
    ['links', 1, 6.5, 0.5, 'power1.inOut'],
    ['yaw', -0.5, 6.7, 0.9, 'sine.inOut'],
    ['flow', 1, 6.85, 0.3, 'power1.out'],
    ['deploy', 1, 6.95, 0.55, 'power1.inOut'],

    /* ---------- DELIVER ----------
       The system closes up into one slab — Ayadi's — and the camera comes in
       over it. Then a long pull back: it is one plot on a wide ground, and
       the plots round it are still only drawn. */
    ['slab', 1, 7.55, 0.6, 'power2.inOut'],
    ['pitch', 0.52, 7.6, 0.7, 'sine.inOut'],
    ['dist', 9.6 * near, 7.6, 0.7, 'sine.inOut'],
    ['lift', 0.85, 7.6, 0.7, 'sine.inOut'],
    ['map', 1, 8.3, 0.45, 'power1.out'],
    ['dist', mapDist, 8.3, 0.7, 'power2.inOut'],
    ['pitch', 0.84, 8.3, 0.7, 'power2.inOut'],
    ['yaw', -0.3, 8.3, 0.9, 'sine.inOut'],
    ['lift', -0.3, 8.3, 0.7, 'sine.inOut'],
    ['plots', 1, 8.5, 0.6, 'power1.inOut'],
    ['reach', 1, 8.75, 0.35, 'power1.out'],

    /* ---------- AYATECH ----------
       Everything gathers into three arcs round the name, the camera square
       on again; then the arcs let go and leave it. */
    ['orbit', 1, 9.2, 0.6, 'power2.inOut'],
    ['yaw', 0, 9.2, 0.6, 'power2.inOut'],
    ['pitch', 0, 9.2, 0.6, 'power2.inOut'],
    ['dist', 10, 9.2, 0.6, 'power2.inOut'],
    ['lift', 0, 9.2, 0.6, 'power2.inOut'],
    ['aside', 0, 9.2, 0.6, 'power2.inOut'],
    ['flow', 0, 9.2, 0.3, 'power1.in'],
    ['dust', 0.4, 9.2, 0.6, 'sine.inOut'],
    ['clear', 1, 9.85, 0.4, 'power1.inOut'],
  ];
}

/** Where the story starts on this layout: RIG_START, from its own distance. */
export function restOf({ near }: Pick<Layout, 'near'>): Record<StoryKey, number> {
  return { ...RIG_START, dist: RIG_START.dist * near };
}

/** Writes the score onto `timeline`, moving `rig`. */
export function scoreStory(timeline: gsap.core.Timeline, rig: AyatechRig, layout: Pick<Layout, 'near' | 'mapDist'>) {
  const from = restOf(layout);

  for (const [key, to, at, duration, ease = 'none'] of score(layout)) {
    timeline.fromTo(rig, { [key]: from[key] }, { [key]: to, duration, ease }, at);
    from[key] = to;
  }
}
