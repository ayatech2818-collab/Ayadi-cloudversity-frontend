import { Briefcase, GraduationCap, LayoutGrid, Palette, Shapes, type LucideIcon } from 'lucide-react';

/*
 * How each category looks. Kept apart from categories.ts because none of this
 * will ever come from the API — an icon and a tint are the page's business.
 *
 * One step of the brand scale each (green, teal, navy), the same three the
 * pathways use everywhere else. Classes are spelled out in full so Tailwind's
 * scanner finds them.
 */
export type CategoryStyle = {
  icon: LucideIcon;
  /** Icon tile at rest. */
  tile: string;
  /** Label on a course card. All ≥ 4.5:1 on white. */
  text: string;
  dot: string;
};

const STYLES: Record<string, CategoryStyle> = {
  academic: {
    icon: GraduationCap,
    tile: 'bg-primary/10 text-primary',
    text: 'text-primary',
    dot: 'bg-primary',
  },
  creative: {
    icon: Palette,
    tile: 'bg-brand-teal/10 text-brand-teal',
    text: 'text-brand-teal',
    dot: 'bg-brand-teal',
  },
  readiness: {
    icon: Briefcase,
    tile: 'bg-accent/10 text-accent',
    text: 'text-accent',
    dot: 'bg-accent',
  },
};

/* A category added in the admin later has no entry above; it gets this
   rather than breaking the page. */
const FALLBACK: CategoryStyle = {
  icon: Shapes,
  tile: 'bg-accent-soft/10 text-accent-soft',
  text: 'text-accent-soft',
  dot: 'bg-accent-soft',
};

/** The "All courses" tile, which is not a category. */
export const ALL_COURSES_STYLE: CategoryStyle = {
  icon: LayoutGrid,
  tile: 'bg-text/[0.06] text-text',
  text: 'text-text',
  dot: 'bg-text',
};

export const categoryStyle = (slug: string): CategoryStyle => STYLES[slug] ?? FALLBACK;
