import { Briefcase, GraduationCap, Lightbulb, type LucideIcon } from 'lucide-react';

/*
 * The real photographs the Cloudversity world shows, one per chapter. Drop
 * the files into public/images/universe/ under these names and they replace
 * the placeholders on the next build (or refresh, in development).
 *
 *   learning — academic learning: a student, a classroom, a teacher helping
 *   skills   — a project, creative or collaborative learning
 *   career   — a young professional, a workspace, career preparation
 */

export type PhotoId = 'learning' | 'skills' | 'career';

export const PHOTOS: Record<PhotoId, { src: string; icon: LucideIcon }> = {
  learning: { src: '/images/universe/cloudversity-learning.jpg', icon: GraduationCap },
  skills: { src: '/images/universe/cloudversity-skills.jpg', icon: Lightbulb },
  career: { src: '/images/universe/cloudversity-career.jpg', icon: Briefcase },
};

/** Which of the photos exist yet. Resolved on the server (see Hero.tsx). */
export type PhotoAvailability = Record<PhotoId, boolean>;

export const NO_PHOTOS: PhotoAvailability = { learning: false, skills: false, career: false };
