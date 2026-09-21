import {
  BookOpen,
  BrainCircuit,
  Briefcase,
  Cloud,
  CodeXml,
  Cpu,
  GraduationCap,
  Hammer,
  Lightbulb,
  Palette,
  Rocket,
  type LucideIcon,
} from 'lucide-react';

import { brandById } from '@/components/website/courses/brands';
import { brandContentMap } from '@/components/website/courses/dummyData';
import { learningWorlds } from '@/components/website/courses/journey';

import type { WorldId } from '../hero-ecosystem/Hero3DEcosystem';

/*
 * What the Ayadi Universe says, chapter by chapter.
 *
 * Nothing here is new copy where existing copy would do. Brand names,
 * taglines and ledes come from courses/brands.ts; the subjects from
 * courses/journey.ts; the programmes from courses/dummyData.ts (placeholder
 * data — it changes when the real catalogue does); the three Cloudversity
 * pathways are the Footer's own category links. No figures: the stats in
 * brands.ts are unverified, so they are left out on purpose.
 *
 * Both brands have exactly three chapters, so the scroll timeline is the same
 * length whichever one the visitor is reading.
 */

export type Brand = WorldId;

export const BRANDS: Brand[] = ['cloudversity', 'ayatech'];

export type BrandMeta = {
  name: string;
  kind: string;
  icon: LucideIcon;
  /** Tailwind classes for the selected pill — literal, so the scanner sees them. */
  fill: string;
};

/* AyaTech is green and white — its own identity — so the two brands differ by
   shade, not by borrowing the navy. */
export const BRAND_META: Record<Brand, BrandMeta> = {
  cloudversity: {
    name: brandById.ayadi.name,
    kind: 'Learning world',
    icon: GraduationCap,
    fill: 'bg-brand-gradient',
  },
  ayatech: {
    name: brandById.ayatech.name,
    kind: 'Technology world',
    icon: Cpu,
    fill: 'bg-linear-to-br from-brand-start to-primary-hover',
  },
};

export type ChapterCard = {
  title: string;
  meta?: string;
  icon: LucideIcon;
  /** Icon tile classes. */
  tint: string;
};

export type Chapter = {
  /** Short name for the progress rail. */
  label: string;
  eyebrow: string;
  title: string;
  text?: string;
  cards: ChapterCard[];
  cta?: { label: string; href: string };
};

const GREEN = 'bg-primary/10 text-primary';
const TEAL = 'bg-brand-teal/10 text-brand-teal';
const NAVY = 'bg-accent-soft/10 text-accent-soft';

const ayadi = brandContentMap.ayadi;
const ayatech = brandContentMap.ayatech;

const programmeMeta = (course: { category: string; level: string; duration: string }) =>
  `${course.category} · ${course.level} · ${course.duration}`;

/* The blurb under each pathway is the matching subject's own line. */
const blurbOf = (id: string) => learningWorlds.find((world) => world.id === id)?.blurb;

export const CHAPTERS: Record<Brand, [Chapter, Chapter, Chapter]> = {
  cloudversity: [
    {
      label: 'Pathways',
      eyebrow: brandById.ayadi.name,
      title: brandById.ayadi.tagline,
      text: brandById.ayadi.lede,
      cards: [
        { title: 'Academic & Learning Pathways', meta: blurbOf('academic'), icon: GraduationCap, tint: GREEN },
        { title: 'Life & Creative Skills', meta: blurbOf('creative'), icon: Palette, tint: TEAL },
        { title: 'Workspace Readiness & PD', meta: blurbOf('professional'), icon: Briefcase, tint: NAVY },
      ],
    },
    {
      label: 'Subjects',
      eyebrow: 'Explore our learning worlds',
      title: 'A brighter tomorrow, by subject.',
      cards: learningWorlds.map((world) => ({
        title: world.title,
        meta: world.blurb,
        icon: world.icon,
        tint: world.tint,
      })),
    },
    {
      label: 'Programmes',
      eyebrow: ayadi.brandBadge,
      title: 'Featured programmes',
      text: ayadi.description,
      cards: ayadi.courses.map((course) => ({
        title: course.title,
        meta: programmeMeta(course),
        icon: BookOpen,
        tint: GREEN,
      })),
      cta: ayadi.ctaText ? { label: ayadi.ctaText, href: '/courses' } : undefined,
    },
  ],
  ayatech: [
    {
      label: 'Focus',
      eyebrow: brandById.ayatech.name,
      title: brandById.ayatech.tagline,
      text: brandById.ayatech.lede,
      /* The three areas the lede names, labelled with their catalogue categories. */
      cards: [
        { title: 'Software Development', meta: 'Software Architecture', icon: CodeXml, tint: GREEN },
        { title: 'Cloud Infrastructure', meta: 'Cloud Engineering', icon: Cloud, tint: GREEN },
        { title: 'Applied AI', meta: 'Artificial Intelligence', icon: BrainCircuit, tint: GREEN },
      ],
    },
    {
      label: 'Tracks',
      eyebrow: ayatech.brandBadge,
      title: ayatech.title,
      text: ayatech.description,
      cards: ayatech.courses.map((course) => ({
        title: course.title,
        meta: programmeMeta(course),
        icon: Cpu,
        tint: GREEN,
      })),
    },
    {
      label: 'Build',
      eyebrow: 'Project-led learning',
      title: 'Taught the way the work is actually done',
      text: 'By building. Every idea turns into something you make, then into something you can do.',
      cards: [
        { title: 'Learn', meta: 'Understand the concept', icon: Lightbulb, tint: GREEN },
        { title: 'Build', meta: 'Put it to work in a project', icon: Hammer, tint: GREEN },
        { title: 'Grow', meta: 'Take it into your career', icon: Rocket, tint: GREEN },
      ],
      cta: ayatech.ctaText ? { label: ayatech.ctaText, href: '/courses' } : undefined,
    },
  ],
};
