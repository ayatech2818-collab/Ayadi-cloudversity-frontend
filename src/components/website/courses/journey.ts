import { BrainCircuit, Briefcase, GraduationCap, Palette, type LucideIcon } from 'lucide-react';

import { courseCategories } from './categories';

/* ==================================================
   ACT TWO — the collage
================================================== */

export type CollageItem = {
  id: string;
  src: string;
  alt: string;
  /** Free-floating placement from `sm` up. Below that the cards fall into a grid. */
  position: string;
  /** Shape at every width. */
  aspect: string;
  /** How wide the card is on the mobile grid. */
  span: string;
  /** `sizes` for next/image — the widest the card ever renders. */
  sizes: string;
  /* The flat, pinned-to-a-corkboard tilt. A CSS class rather than a GSAP value
     so the cluster still looks composed without JS — GSAP only owns the 3D
     rotations on top of it. Held back to `sm` so the mobile grid stays square. */
  tilt: string;
  /** How far forward the card sits in the 3D stack, in px. */
  depth: number;
  /** Drift during the hold, in px. Different per card is what sells the parallax. */
  drift: number;
  /** Where the card flies on the way out, as a share of its own size. */
  spread: { x: number; y: number };
  /* Its place in the cluster on a phone's pinned stage, where the box is
     upright (5:6) rather than 16:10: `left` and `width` as percentages of the
     box's width, `top` of its height, and the flat tilt in degrees. Numbers
     rather than classes because below `sm` the classes above leave a grid —
     which is what a phone gets without motion — and AyadiJourney lays the
     cluster out itself only once it is driving the section. */
  phone: { left: number; top: number; width: number; tilt: number };
};

/*
 * Placeholders. Every photo id here is already used elsewhere in the repo, so
 * they are known to resolve; swap `src` for the real shoot when it lands, and
 * JourneyImage covers the gap if a request fails.
 *
 * Nine cards, no two the same width. Positions are percentages inside a 12:5
 * box and were laid out so no two cards overlap, with air between them — a
 * card's height there is its width × 2.4 ÷ its aspect — and the top-right
 * corner stays free for the script (left 66%, down to about 30%). Check that
 * again if you move one. The `phone` places are laid out the same way inside a
 * 5:7 box (height = width ÷ 1.4 ÷ aspect), below the script, which runs
 * centred across the top 18%.
 */
export const collageItems: CollageItem[] = [
  {
    id: 'focus',
    src: '/images/home/dance.JPG',
    alt: 'A teacher guiding students through a lesson',
    position: 'sm:absolute sm:left-[20%] sm:top-[3.6%] sm:w-[26%]',
    aspect: 'aspect-[4/3]',
    span: 'col-span-2 sm:col-span-1',
    sizes: '(min-width: 1520px) 380px, (min-width: 640px) 26vw, 100vw',
    tilt: 'sm:rotate-[-1.5deg]',
    depth: 80,
    drift: -74,
    spread: { x: -18, y: -46 },
    phone: { left: 3, top: 19.3, width: 56, tilt: -1.5 },
  },
  {
    id: 'classroom',
    src: '/images/home/enjoying 1.JPG',
    alt: 'Students enjoying their learning experience',
    position: 'sm:absolute sm:left-[1%] sm:top-[38.4%] sm:w-[16%]',
    aspect: 'aspect-[4/3]',
    span: 'col-span-1',
    sizes: '(min-width: 1520px) 235px, (min-width: 640px) 16vw, 50vw',
    tilt: 'sm:rotate-[2.5deg]',
    depth: -25,
    drift: -32,
    spread: { x: -72, y: 16 },
    phone: { left: 2, top: 52.9, width: 35, tilt: 2.5 },
  },
  {
    id: 'detail',
    src: '/images/home/stage.JPG',
    alt: 'Students participating in a school event',
    position: 'sm:absolute sm:left-[3%] sm:top-[4.8%] sm:w-[12%]',
    aspect: 'aspect-square',
    span: 'col-span-1',
    sizes: '(min-width: 1520px) 175px, (min-width: 640px) 12vw, 50vw',
    tilt: 'sm:rotate-[-4deg]',
    depth: -70,
    drift: -98,
    spread: { x: -66, y: -52 },
    phone: { left: 65, top: 20, width: 22, tilt: -4 },
  },
  {
    id: 'writing',
    src: '/images/home/dance 1.JPG',
    alt: 'Students participating in a dance activity',
    position: 'sm:absolute sm:left-[33%] sm:top-[62.4%] sm:w-[19%]',
    aspect: 'aspect-[3/2]',
    span: 'col-span-1',
    sizes: '(min-width: 1520px) 280px, (min-width: 640px) 19vw, 50vw',
    tilt: 'sm:rotate-[1.5deg]',
    depth: 30,
    drift: -46,
    spread: { x: 0, y: 62 },
    phone: { left: 3, top: 77.1, width: 36, tilt: 1.5 },
  },
  {
    id: 'making',
    src: '/images/home/mentors.JPG',
    alt: 'Mentors supporting students in their learning',
    position: 'sm:absolute sm:left-[50%] sm:top-[9.6%] sm:w-[13%]',
    aspect: 'aspect-[3/4]',
    span: 'col-span-1',
    sizes: '(min-width: 1520px) 190px, (min-width: 640px) 13vw, 50vw',
    tilt: 'sm:rotate-[-2.5deg]',
    depth: -45,
    drift: -62,
    spread: { x: 64, y: 22 },
    phone: { left: 68, top: 56, width: 28, tilt: -2.5 },
  },
  {
    id: 'notes',
    src: '/images/home/teaching.JPG',
    alt: 'Teachers helping students learn new concepts',
    position: 'sm:absolute sm:left-[3%] sm:top-[74.4%] sm:w-[14%]',
    aspect: 'aspect-[3/2]',
    span: 'col-span-1',
    sizes: '(min-width: 1520px) 205px, (min-width: 640px) 14vw, 50vw',
    tilt: 'sm:rotate-[3deg]',
    depth: 10,
    drift: -40,
    spread: { x: -70, y: 50 },
    phone: { left: 46, top: 75, width: 18, tilt: 3 },
  },
  {
    id: 'reading',
    src: '/images/home/enjoying.JPG',
    alt: 'Students enjoying collaborative school activities',
    position: 'sm:absolute sm:left-[20%] sm:top-[60%] sm:w-[10%]',
    aspect: 'aspect-[4/5]',
    span: 'col-span-1',
    sizes: '(min-width: 1520px) 145px, (min-width: 640px) 10vw, 50vw',
    tilt: 'sm:rotate-[-3deg]',
    depth: -55,
    drift: -86,
    spread: { x: -30, y: 70 },
    phone: { left: 42, top: 52.9, width: 20, tilt: -3 },
  },
  {
    id: 'team',
    src: '/images/home/oppana.JPG',
    alt: 'Students performing a traditional Oppana celebration',
    position: 'sm:absolute sm:left-[85%] sm:top-[45.6%] sm:w-[11%]',
    aspect: 'aspect-square',
    span: 'col-span-1',
    sizes: '(min-width: 1520px) 160px, (min-width: 640px) 11vw, 50vw',
    tilt: 'sm:rotate-[4deg]',
    depth: -80,
    drift: -104,
    spread: { x: 80, y: -10 },
    phone: { left: 72, top: 39.5, width: 16, tilt: 4 },
  },
  {
    id: 'lab',
    src: '/images/home/teaching.JPG',
    alt: 'Students participating in a group dance performance',
    position: 'sm:absolute sm:left-[59%] sm:top-[64.8%] sm:w-[22%]',
    aspect: 'aspect-video',
    span: 'col-span-1',
    sizes: '(min-width: 1520px) 325px, (min-width: 640px) 22vw, 50vw',
    tilt: 'sm:rotate-[-1.5deg]',
    depth: 55,
    drift: -56,
    spread: { x: 40, y: 70 },
    phone: { left: 48, top: 87, width: 32, tilt: -1.5 },
  },
];
/* ==================================================
   ACT THREE — the learning worlds
================================================== */

/* Ayadi's four main categories (categories.ts), each with its own icon and
   tile colour. */
export type LearningWorld = {
  id: string;
  /** What `/courses?category=…` carries — the tile opens that category. */
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  /** Icon tile colour. Mostly the brand scale, with one warm outlier so the
      row does not read as four of the same swatch. */
  tint: string;
};

const WORLD_LOOK: Record<string, Pick<LearningWorld, 'icon' | 'tint'>> = {
  academic: { icon: GraduationCap, tint: 'bg-primary/10 text-primary' },
  creative: { icon: Palette, tint: 'bg-amber-500/10 text-amber-600' },
  readiness: { icon: Briefcase, tint: 'bg-accent/10 text-accent' },
  ai: { icon: BrainCircuit, tint: 'bg-brand-teal/10 text-brand-teal' },
};

/* A category added to categories.ts without a look of its own still gets a tile. */
const DEFAULT_LOOK = WORLD_LOOK.academic;

export const learningWorlds: LearningWorld[] = courseCategories.map((category) => ({
  id: category.id,
  slug: category.slug,
  title: category.name,
  blurb: category.description ?? '',
  ...(WORLD_LOOK[category.id] ?? DEFAULT_LOOK),
}));
