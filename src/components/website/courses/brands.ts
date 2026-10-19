import { GraduationCap, type LucideIcon } from 'lucide-react';

import type { BrandId } from './types';

/*
 * The brand: Ayadi Cloudversity, the one platform this site is for.
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
  name: string;
  shortName: string;
  /** The single line that says what this pathway is for. */
  role: string;
  /** The promise. The journey's opening headline. */
  tagline: string;
  icon: LucideIcon;
  theme: BrandTheme;
};

export const brands: Brand[] = [
  {
    id: 'ayadi',
    name: 'Ayadi Cloudversity',
    shortName: 'Ayadi',
    role: 'The core learning platform',
    tagline: 'Learning for Every Journey',
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
];

export const brandById = Object.fromEntries(brands.map((brand) => [brand.id, brand])) as Record<BrandId, Brand>;
