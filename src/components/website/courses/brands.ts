import { BookOpen, Cpu, GraduationCap, type LucideIcon } from 'lucide-react';

import type { BrandId } from './types';

/*
 * The three pathways.
 *
 * Ayadi Cloudversity is the parent; AyaTech and Netscape are its sub-brands.
 * Each gets one step of the brand scale defined in globals.css — green, navy,
 * teal — so they read as a family rather than three unrelated products.
 *
 * Colours are Tailwind classes over theme tokens, never raw hex, so retuning
 * the palette in globals.css carries through the whole page.
 */
export type BrandTheme = {
  /** Small text, links, numerals. All ≥ 4.5:1 on white. */
  text: string;
  /* Spelled out rather than built as `hover:${text}` — Tailwind scans source
     text, so a variant assembled at runtime is never generated. */
  hoverText: string;
  /** Tinted surface for chips and icon tiles. */
  soft: string;
  ring: string;
  /** Solid fill for the active tab and the brand plate. */
  gradient: string;
  /** Large blurred wash behind the pathway panel. */
  glow: string;
  /** Focus ring on interactive elements. */
  outline: string;
};

export type Brand = {
  id: BrandId;
  index: string;
  name: string;
  shortName: string;
  /** Says the architecture out loud: one parent, two specialists. */
  kind: 'Parent platform' | 'Sub-brand';
  /** The single line that says what this pathway is for. */
  role: string;
  description: string;
  highlights: string[];
  icon: LucideIcon;
  theme: BrandTheme;
};

export const brands: Brand[] = [
  {
    id: 'ayadi',
    index: '01',
    name: 'Ayadi Cloudversity',
    shortName: 'Ayadi',
    kind: 'Parent platform',
    role: 'The core learning platform',
    description:
      'Professional and lifelong programmes for learners at every stage — practical skills, career preparation and personal growth, from preschool foundations through to the workplace.',
    highlights: ['Career programmes', 'Lifelong learning', 'Workplace readiness'],
    icon: GraduationCap,
    theme: {
      text: 'text-primary',
      hoverText: 'hover:text-primary',
      soft: 'bg-primary/10',
      ring: 'ring-primary/25',
      gradient: 'bg-brand-gradient',
      glow: 'bg-primary/20',
      outline: 'outline-primary',
    },
  },
  {
    id: 'ayatech',
    index: '02',
    name: 'AyaTech',
    shortName: 'AyaTech',
    kind: 'Sub-brand',
    role: 'Technology, software and AI',
    description:
      'The technical arm of the ecosystem. Engineering-depth programmes in software development, cloud infrastructure, artificial intelligence and the tools shaping the next decade of work.',
    highlights: ['Applied AI', 'Cloud & DevOps', 'Software engineering'],
    icon: Cpu,
    theme: {
      text: 'text-accent',
      hoverText: 'hover:text-accent',
      soft: 'bg-accent/10',
      ring: 'ring-accent/25',
      gradient: 'bg-accent-gradient',
      glow: 'bg-accent/20',
      outline: 'outline-accent',
    },
  },
  {
    id: 'netscape',
    index: '03',
    name: 'Netscape',
    shortName: 'Netscape',
    kind: 'Sub-brand',
    role: 'Training programmes for teachers',
    description:
      'Built for educators. Classroom pedagogy, education technology and subject certification designed to develop the people who develop everyone else.',
    highlights: ['Classroom pedagogy', 'EdTech practice', 'STEM certification'],
    icon: BookOpen,
    theme: {
      text: 'text-brand-teal',
      hoverText: 'hover:text-brand-teal',
      soft: 'bg-brand-teal/10',
      ring: 'ring-brand-teal/25',
      gradient: 'bg-linear-to-br from-brand-end via-brand-teal to-accent',
      glow: 'bg-brand-end/20',
      outline: 'outline-brand-teal',
    },
  },
];

export const brandById = Object.fromEntries(brands.map((brand) => [brand.id, brand])) as Record<BrandId, Brand>;
