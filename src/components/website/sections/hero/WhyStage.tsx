'use client';

import { motion } from 'framer-motion';
import { BookOpen, GraduationCap, Sparkles, UserRound, type LucideIcon } from 'lucide-react';
import type { CSSProperties, RefObject } from 'react';

import { useCardTilt } from '@/components/website/ui/card-chrome';

import styles from './hero.module.css';
import { WHY_ENTRANCES } from './whyCards';

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

/* How one card comes through the portal's side, for the stylesheet: which
   way it travels, how far it is hinged and rolled on the way, and the filter
   that bends it while it is still in the liquid (whyCards.ts has the numbers;
   .whyBody in hero.module.css spends them). */
function entrance(index: number) {
  const { side, hinge, roll, lift } = WHY_ENTRANCES[Math.min(index, WHY_ENTRANCES.length - 1)];
  return {
    '--side': side,
    '--hinge': `${hinge}deg`,
    '--roll': `${roll}deg`,
    '--lift': `${lift * 100}%`,
    '--warp': `url(#why-warp-${index})`,
  } as CSSProperties;
}

/*
 * "Why choose Ayadi?" — part of the portal, while the camera travels toward
 * it. The heading lies on the portal's glass, with its answer under it: a
 * short quote. The three cards stand in front of the glass, to either side
 * and one behind another, each coming through the portal's side by way of a
 * ripple of its own and then staying exactly where it is: the camera's
 * approach is what moves them, and what finally leaves them behind. The
 * words keep the glass after that, until the liquid takes it. (On a phone
 * held upright the portal stands upright too, and the cards take turns in
 * one place under the words instead: each comes, and goes back, before the
 * next — scene/why.ts.)
 *
 * Everything is laid out once, flat. The scene's Director gives the heading
 * and each card its place every frame (placeWhy in scene/HeroScene.tsx) — a
 * real pane in the portal's space, drawn through the scene's own camera — and
 * drives each card's emergence from its one rig value. AyadiHero's scroll
 * timeline runs those values, and brings the heading in and out (data-h
 * hooks).
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
      <div data-why="head" className={`${styles.whyAnchor} ${styles.whyWords}`}>
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

          {/* The question's answer, said with it: one block of words that
              arrives together, stays together and leaves together. */}
          <p className={styles.whyQuote}>
            &ldquo;Every next step
            <span className="block">
              begins with the <span className={styles.whyQuoteMark}>right learning</span>.&rdquo;
            </span>
          </p>
        </div>
      </div>

      <ul className={styles.whyCards}>
        {REASONS.map((reason, index) => (
          <li key={reason.title} data-why="card" className={`${styles.whySlot} ${styles.whyAnchor}`} style={entrance(index)}>
            <div data-h="why-card" className={styles.whyBody}>
              <ReasonCard reason={reason} index={index} />
            </div>
          </li>
        ))}
      </ul>

      {/* The liquid a card is bent by on its way through: one small noise
          field each, and how hard it pushes — which the Director sets, and
          sets back to nothing once the card is clear. */}
      <svg className={styles.whyDefs} focusable="false">
        <defs>
          {REASONS.map((reason, index) => (
            <filter
              key={reason.title}
              id={`why-warp-${index}`}
              x="-25%"
              y="-40%"
              width="150%"
              height="180%"
              colorInterpolationFilters="sRGB"
            >
              <feTurbulence type="fractalNoise" baseFrequency="0.011 0.028" numOctaves={2} seed={3 + index * 7} result="noise" />
              <feDisplacementMap
                data-why="warp"
                in="SourceGraphic"
                in2="noise"
                scale={0}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ))}
        </defs>
      </svg>
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
        <span className={`${styles.whyTitle} block text-[1.05rem] font-semibold leading-tight tracking-[-0.02em] text-white`}>
          {reason.title}
        </span>
        <span className={`${styles.whyDescription} mt-1 block text-[0.85rem] leading-snug text-emerald-50/85`}>
          {reason.description}
        </span>
        <span data-h="why-accent" className={styles.whyAccent} />
      </span>
    </motion.div>
  );
}
