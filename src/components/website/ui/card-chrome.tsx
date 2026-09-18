'use client';

import { useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import type { PointerEvent } from 'react';

/* ==================================================
   CARD CHROME

   The treatment the WhyChooseAyadi feature cards use — cursor spotlight, lift,
   top sheen, rotating icon tile — retuned for a light surface. There the accent
   is lime on deep emerald; here it is the brand green on white, so a page stays
   mostly neutral and the colour only arrives under the cursor.

   Shared by the About and Blog pages so the two cannot drift apart.
================================================== */

export const CARD_CHROME = `
  group
  relative
  isolate
  h-full
  overflow-hidden
  rounded-2xl
  bg-surface
  ring-1
  ring-inset
  ring-border
  transition-[translate,box-shadow]
  duration-500
  ease-out
  hover:-translate-y-1.5
  hover:shadow-[0_28px_60px_-28px_rgba(16,185,129,0.45)]
  hover:ring-primary/30
  focus-within:ring-primary/40
`;

export const SPOTLIGHT_BG =
  'radial-gradient(340px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgba(16, 185, 129, 0.16), transparent 70%)';

/* Feeds the cursor position to the spotlight overlay without re-rendering. */
export function handleSpotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
}

/* Loose enough to trail the cursor, damped enough not to wobble on release. */
const TILT_SPRING = { stiffness: 210, damping: 24, mass: 0.45 };

/*
 * Cursor-driven 3D tilt, and the spotlight position in the same pass — one
 * getBoundingClientRect per move rather than two listeners each measuring.
 *
 * Everything runs through MotionValues, so moving the cursor across a card
 * never re-renders React.
 *
 * Spread the result onto a `motion.*` element:
 *   const tilt = useCardTilt();
 *   <motion.article {...tilt} className={CARD_CHROME}>
 *
 * `maxTilt` is degrees at the very edge. Keep it small — past ~6deg the text
 * starts to look like it is sliding off a table, and big cards need less than
 * small ones.
 */
export function useCardTilt(maxTilt = 4) {
  const reduceMotion = useReducedMotion();

  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const rotateX = useSpring(tiltX, TILT_SPRING);
  const rotateY = useSpring(tiltY, TILT_SPRING);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    event.currentTarget.style.setProperty('--spot-x', `${x}px`);
    event.currentTarget.style.setProperty('--spot-y', `${y}px`);

    // A finger dragging the page should not tip the card.
    if (reduceMotion || event.pointerType !== 'mouse') return;

    // -0.5 … 0.5, measured from the centre of the card.
    tiltY.set((x / rect.width - 0.5) * maxTilt * 2);
    tiltX.set((0.5 - y / rect.height) * maxTilt * 2);
  };

  const onPointerLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  /* transformPerspective rides on the card itself rather than as a
     `perspective` on the parent, so the tilt cannot be flattened by whatever
     page the card is dropped into. */
  return {
    style: { rotateX, rotateY, transformPerspective: 1400 },
    onPointerMove,
    onPointerLeave,
  };
}

export function CardDecor() {
  return (
    <>
      {/* Cursor spotlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: SPOTLIGHT_BG }}
      />

      {/* Top sheen — held back until hover so the card reads plain at rest */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
    </>
  );
}

/*
 * Idle bob, a conic sweep around the tile on hover, and the icon flipping from
 * a green tint to white on the brand gradient. The gradient sits in its own
 * layer so it can cross-fade — a background-image cannot transition from a
 * flat colour.
 */
export function IconTile({ icon: Icon, size, delay }: { icon: LucideIcon; size: 'md' | 'lg'; delay: number }) {
  const isLarge = size === 'lg';

  return (
    <div
      className="w-fit motion-safe:animate-[icon-float_4.5s_ease-in-out_infinite]"
      style={{ animationDelay: `${delay}s` }}
    >
      <div
        className={`
          relative
          ${isLarge ? 'size-14 rounded-[16px]' : 'size-12 rounded-[14px]'}
          overflow-hidden
          bg-primary/15
          p-[2px]
          transition-[rotate,scale,box-shadow]
          duration-500
          ease-out
          group-hover:-rotate-6
          group-hover:scale-105
          group-hover:shadow-[0_14px_30px_-12px_rgba(16,185,129,0.65)]
        `}
      >
        {/* Rotating border */}
        <span
          aria-hidden="true"
          className="absolute -inset-1/2 bg-[conic-gradient(from_0deg,transparent_0deg,#16a34a_70deg,transparent_140deg)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-safe:group-hover:animate-spin"
          style={{ animationDuration: '3s' }}
        />

        <span
          className={`relative flex size-full items-center justify-center overflow-hidden bg-primary/10 ${
            isLarge ? 'rounded-[14px]' : 'rounded-xl'
          }`}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-brand-gradient opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          <Icon
            aria-hidden="true"
            size={isLarge ? 24 : 22}
            strokeWidth={1.9}
            className="relative text-primary transition-[color,scale] duration-500 ease-out group-hover:scale-110 group-hover:text-white"
          />
        </span>
      </div>
    </div>
  );
}
