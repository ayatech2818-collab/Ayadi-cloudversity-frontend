import { Briefcase, FileText, GraduationCap, Leaf, MessageCircle, Palette, type LucideIcon } from 'lucide-react';

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
};

/*
 * Placeholders. Every photo id here is already used elsewhere in the repo, so
 * they are known to resolve; swap `src` for the real shoot when it lands, and
 * JourneyImage covers the gap if a request fails.
 *
 * Positions are percentages inside a 16:10 box and were laid out so no two
 * cards overlap — check that again if you move one.
 */
export const collageItems: CollageItem[] = [
  {
    id: 'focus',
    src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    alt: 'A student working through a lesson on a laptop',
    position: 'sm:absolute sm:left-[24%] sm:top-[6%] sm:w-[40%]',
    aspect: 'aspect-[4/3]',
    span: 'col-span-2 sm:col-span-1',
    sizes: '(min-width: 1180px) 460px, (min-width: 640px) 40vw, 100vw',
    tilt: 'sm:rotate-[-1.5deg]',
    depth: 80,
    drift: -74,
    spread: { x: -18, y: -46 },
  },
  {
    id: 'classroom',
    src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80',
    alt: 'Children raising their hands in a classroom',
    position: 'sm:absolute sm:left-[1%] sm:top-[40%] sm:w-[21%]',
    aspect: 'aspect-[4/3]',
    span: 'col-span-1',
    sizes: '(min-width: 1180px) 250px, (min-width: 640px) 21vw, 50vw',
    tilt: 'sm:rotate-[2.5deg]',
    depth: -25,
    drift: -32,
    spread: { x: -72, y: 16 },
  },
  {
    id: 'detail',
    src: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80',
    alt: 'A desk detail from a creative workshop',
    position: 'sm:absolute sm:left-[8%] sm:top-[8%] sm:w-[12%]',
    aspect: 'aspect-square',
    span: 'col-span-1',
    sizes: '(min-width: 1180px) 145px, (min-width: 640px) 12vw, 50vw',
    tilt: 'sm:rotate-[-4deg]',
    depth: -70,
    drift: -98,
    spread: { x: -66, y: -52 },
  },
  {
    id: 'writing',
    src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80',
    alt: 'A student writing at a desk',
    position: 'sm:absolute sm:left-[38%] sm:top-[63%] sm:w-[24%]',
    aspect: 'aspect-[4/3]',
    span: 'col-span-1',
    sizes: '(min-width: 1180px) 285px, (min-width: 640px) 24vw, 50vw',
    tilt: 'sm:rotate-[1.5deg]',
    depth: 30,
    drift: -46,
    spread: { x: 0, y: 62 },
  },
  {
    id: 'making',
    src: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    alt: 'A learner presenting work from a project session',
    position: 'sm:absolute sm:left-[68%] sm:top-[30%] sm:w-[23%]',
    aspect: 'aspect-[3/4]',
    span: 'col-span-1',
    sizes: '(min-width: 1180px) 270px, (min-width: 640px) 23vw, 50vw',
    tilt: 'sm:rotate-[-2.5deg]',
    depth: -45,
    drift: -62,
    spread: { x: 64, y: 22 },
  },
];

/* ==================================================
   ACT THREE — the learning worlds
================================================== */

/* Ayadi's six subjects. AyaTech and Netscape will each need their own list
   when their journeys are built — they do not share these. */
export type LearningWorld = {
  id: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
  /** Icon tile colour. Mostly the brand scale, with one warm outlier so the
      row does not read as six of the same swatch. */
  tint: string;
};

export const learningWorlds: LearningWorld[] = [
  {
    id: 'academic',
    title: 'Academic',
    blurb: 'School to Higher Education',
    icon: GraduationCap,
    tint: 'bg-primary/10 text-primary',
  },
  {
    id: 'exams',
    title: 'Exams',
    blurb: 'Entrance, Scholarship & More',
    icon: FileText,
    tint: 'bg-brand-teal/10 text-brand-teal',
  },
  {
    id: 'languages',
    title: 'Languages',
    blurb: 'Communication for Life',
    icon: MessageCircle,
    tint: 'bg-accent/10 text-accent',
  },
  {
    id: 'professional',
    title: 'Professional',
    blurb: 'Career & Workspace Skills',
    icon: Briefcase,
    tint: 'bg-accent-soft/10 text-accent-soft',
  },
  {
    id: 'creative',
    title: 'Creative Skills',
    blurb: 'Art, Design & Expression',
    icon: Palette,
    tint: 'bg-amber-500/10 text-amber-600',
  },
  {
    id: 'growth',
    title: 'Personal Growth',
    blurb: 'Leadership, Wellness & More',
    icon: Leaf,
    tint: 'bg-primary/10 text-primary',
  },
];
