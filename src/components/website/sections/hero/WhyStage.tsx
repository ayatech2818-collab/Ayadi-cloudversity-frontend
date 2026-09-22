'use client';

import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Sparkles, UserRound, type LucideIcon } from 'lucide-react';
import type { RefObject } from 'react';

import { useCardTilt } from '@/components/website/ui/card-chrome';

import styles from './hero.module.css';

type Reason = {
  title: string;
  description: string;
  tag: string;
  icon: LucideIcon;
};

/* The three reasons, word for word from sections/WhyChooseAyadi.tsx (not
   imported, so that section stays untouched) — keep the two in step. */
const REASONS: Reason[] = [
  {
    title: 'Expert Instructors',
    description: 'Learn from vetted industry leaders and academic experts.',
    tag: 'Vetted',
    icon: UserRound,
  },
  {
    title: 'Best-in-Class Program',
    description: 'Access personalized instruction with customized content.',
    tag: 'Personalized',
    icon: GraduationCap,
  },
  {
    title: 'Flexible Learning',
    description: 'Your space at your own pace – you can learn in-depth.',
    tag: 'Self-paced',
    icon: BookOpen,
  },
];

/*
 * "Why choose Ayadi?" — shown on the portal's glass while the camera travels
 * toward it: the heading as the glass appears, then one card per stretch of
 * scroll, then everything sinks into the glass and the portal takes over.
 *
 * The panel is laid out once, flat; the scene's Director moves and scales it
 * every frame onto the glass's projection (placeInfo in scene/HeroScene.tsx),
 * so it rides the camera's approach and the pointer's orbit with the glass.
 * AyadiHero's scroll timeline brings each part in and out (data-h hooks).
 *
 * The card is the WhyChooseAyadi feature card as a compact row: the same
 * glass, ring, top sheen, cursor spotlight, hover lift and glow, icon tile
 * that tilts and scales with a conic lime border, floating icon, lime tag and
 * accent line — plus a faint glass reflection.
 *
 * Decorative (aria-hidden): the same content is the WhyChooseAyadi section
 * just below the hero, which stays the accessible version of it.
 */
export function WhyStage({ stageRef }: { stageRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={stageRef} aria-hidden="true" className={styles.why}>
      <span data-h="why-scrim" className={styles.whyScrim} />

      <div data-h="why-head" className={styles.whyHead}>
        <span className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-50 ring-1 ring-inset ring-white/20">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full rounded-full bg-lime-300 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-lime-300" />
          </span>
          Our Edge
        </span>

        <p className="mt-2.5 text-[1.75rem] font-bold leading-[1.1] tracking-[-0.04em] text-white sm:text-[2rem]">
          Why Choose <span className={styles.whyShimmer}>Ayadi</span>?
        </p>
      </div>

      <ul className={styles.whyCards}>
        {REASONS.map((reason, index) => (
          <li key={reason.title} data-h="why-card" className={styles.whySlot}>
            <ReasonCard reason={reason} index={index} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReasonCard({ reason, index }: { reason: Reason; index: number }) {
  /* Tilt and spotlight through MotionValues and CSS variables — moving the
     pointer over a card never re-renders React. Mouse only; off with
     reduced motion. */
  const tilt = useCardTilt(4);
  const Icon = reason.icon;

  return (
    <motion.div {...tilt} className={`${styles.whyCard} group`}>
      <span className={styles.whySpotlight} />
      <span className={styles.whySheen} />

      <span className={styles.whyFloat} style={{ animationDelay: `${index * 0.7}s` }}>
        <span className={styles.whyIcon}>
          <span className={styles.whyConic} />
          <span className="relative flex size-full items-center justify-center rounded-[11px] bg-brand-gradient shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
            <Icon size={24} strokeWidth={1.75} className={styles.whyGlyph} />
          </span>
        </span>

        <span data-h="why-tag" className={styles.whyTag}>
          <Sparkles size={9} strokeWidth={2.5} />
          {reason.tag}
        </span>
      </span>

      <span className={styles.whyText}>
        <span className="block text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-white">
          {reason.title}
        </span>
        <span className="mt-1 block text-[0.85rem] leading-snug text-emerald-50/85">{reason.description}</span>
        <span data-h="why-accent" className={styles.whyAccent} />
      </span>
    </motion.div>
  );
}
