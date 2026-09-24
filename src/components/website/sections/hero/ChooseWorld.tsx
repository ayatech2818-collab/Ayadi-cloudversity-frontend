'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check, Cpu, GraduationCap, type LucideIcon } from 'lucide-react';

import { brandById } from '@/components/website/courses/brands';
import { useCardTilt } from '@/components/website/ui/card-chrome';

import styles from './hero.module.css';

export type WorldId = 'cloudversity' | 'ayatech';

type World = {
  id: WorldId;
  name: string;
  kind: string;
  line: string;
  icon: LucideIcon;
  /** Icon tile fill — literal classes, so Tailwind's scanner sees them. */
  fill: string;
};

/* Names and taglines come from courses/brands.ts. AyaTech is green and white
   — its own shade of the brand, never the navy. */
const WORLDS: World[] = [
  {
    id: 'cloudversity',
    name: brandById.ayadi.name,
    kind: 'Education · Learning',
    line: brandById.ayadi.tagline,
    icon: GraduationCap,
    fill: 'bg-brand-gradient',
  },
  {
    id: 'ayatech',
    name: brandById.ayatech.name,
    kind: 'Technology · Development',
    line: brandById.ayatech.tagline,
    icon: Cpu,
    fill: 'bg-linear-to-br from-brand-start to-primary-hover',
  },
];

/*
 * The end of the hero's journey: the two worlds, as two cards.
 *
 * Ayadi Cloudversity is already the world you are in — its experience is
 * waiting directly below (AyadiHero) — so it arrives selected and nothing
 * has to be clicked to go on. Choosing switches which world the page
 * continues into; AyaTech's own is still to be built.
 */
export function ChooseWorld({
  selected,
  onSelect,
}: {
  selected: WorldId;
  onSelect: (world: WorldId) => void;
}) {
  return (
    <>
      <div data-h="choose-head" className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Two worlds, one ecosystem</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-accent sm:text-[2.6rem] sm:leading-[1.1]">
          Choose your world
        </h2>
      </div>

      <ul className={styles.cards}>
        {WORLDS.map((world) => (
          <li key={world.id} data-h="card" className={styles.cardSlot}>
            <WorldCard world={world} selected={selected === world.id} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </>
  );
}

function WorldCard({
  world,
  selected,
  onSelect,
}: {
  world: World;
  selected: boolean;
  onSelect: (world: WorldId) => void;
}) {
  /* MotionValues all the way down: tilting never re-renders. */
  const tilt = useCardTilt(6);

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(world.id)}
      {...tilt}
      data-world={world.id}
      className={`${styles.card} group`}
    >
      <span aria-hidden="true" className={styles.cardLight} />

      <span className={`${styles.cardLayer} ${styles.cardIconLayer}`}>
        {world.id === 'cloudversity' ? (
          <span className={styles.cloudHeroArea} aria-hidden="true">
            {/* Ambient emerald stage / glass pedestal */}
            <span className={styles.cloudGlassStage}>
              <span className={styles.cloudStageGlow} />
              <span className={styles.cloudStageRefraction} />
              <span className={styles.cloudStageSheen} />
            </span>

            {/* Contact shadow underneath the large floating 3D logo */}
            <span className={styles.cloudLogoShadow} />

            {/* Floating 3D Brand Logo */}
            <span className={styles.cloudFloatStage}>
              <span className={styles.cloudFloatAnim}>
                <Image
                  src="/image/ayadi-logo-white.png"
                  alt="Ayadi Cloudversity"
                  width={3116}
                  height={1701}
                  priority
                  unoptimized
                  className={styles.cloudLogoImage}
                />
                <span className={styles.cloudLightSweep} />
              </span>
            </span>
          </span>
        ) : (
          <span className={styles.ayatechHeroArea} aria-hidden="true">
            {/* Ambient teal/emerald glass pedestal */}
            <span className={styles.ayatechGlassStage}>
              <span className={styles.ayatechStageGlow} />
              <span className={styles.ayatechStageRefraction} />
              <span className={styles.ayatechStageSheen} />
            </span>

            {/* Contact shadow underneath the large floating 3D logo */}
            <span className={styles.ayatechLogoShadow} />

            {/* Floating 3D Brand Logo */}
            <span className={styles.ayatechFloatStage}>
              <span className={styles.ayatechFloatAnim}>
                <Image
                  src="/images/Ayatech.png"
                  alt="AyaTech"
                  width={1000}
                  height={450}
                  priority
                  unoptimized
                  className={styles.ayatechLogoImage}
                />
                <span className={styles.ayatechLightSweep} />
              </span>
            </span>
          </span>
        )}
      </span>

      <span className={`${styles.cardLayer} ${styles.cardText}`}>
        <span className={`${styles.cardTitle} block text-xl font-extrabold tracking-[-0.03em] sm:text-2xl`}>
          {world.name}
        </span>
        <span className={`${styles.cardKind} mt-1 block text-[11px] font-bold uppercase tracking-[0.16em]`}>
          {world.kind}
        </span>
        <span className={`${styles.cardLine} mt-3 hidden text-sm font-medium sm:block`}>{world.line}</span>
      </span>

      <span aria-hidden="true" className={styles.cardCheck}>
        <Check size={14} strokeWidth={3} />
      </span>
    </motion.button>
  );
}
