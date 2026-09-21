import { useId, type CSSProperties } from 'react';

import styles from './ecosystem.module.css';
import { ARCS, u, type LayoutName } from './geometry';
import { box, cx } from './primitives';

/*
 * Learning ↔ Technology.
 *
 * The arc through both worlds and the core (see `arcThrough`), drawn as SVG
 * inside a plane that the arc's own matrix orients in the scene — so it is a
 * real curve in space that turns and foreshortens with the camera, not a line
 * painted across the picture.
 *
 * Particles travel it in both directions: teal from Cloudversity toward
 * AyaTech, emerald coming back. Each is a pivot at the circle's centre turned
 * from one end's angle to the other's, so they ride the drawn arc exactly and
 * the whole trip is a transform the compositor runs on its own.
 */

type Particle = { toTech: boolean; duration: number; delay: number; className?: string };

/* Kept few on purpose. Tablet drops the three marked, phones get their own
   three. */
const PARTICLES: Record<LayoutName, Particle[]> = {
  wide: [
    { toTech: true, duration: 8, delay: 0 },
    { toTech: true, duration: 9.5, delay: -3.2 },
    { toTech: false, duration: 10, delay: -1.5 },
    { toTech: true, duration: 8.8, delay: -6.1, className: 'max-lg:hidden' },
    { toTech: false, duration: 9.2, delay: -5.6, className: 'max-lg:hidden' },
    { toTech: true, duration: 11, delay: -8.4, className: 'max-lg:hidden' },
  ],
  compact: [
    { toTech: true, duration: 8.5, delay: 0 },
    { toTech: false, duration: 9.5, delay: -4 },
    { toTech: true, duration: 10, delay: -6.5 },
  ],
};

/** Parallel to the main arc, a little outside it: the second strand of the ribbon. */
const RIBBON_OFFSET = 9;

function arcPath(radius: number, sweep: number) {
  const end = (sweep * Math.PI) / 180;
  const x = Math.round(radius * Math.cos(end) * 100) / 100;
  const y = Math.round(radius * Math.sin(end) * 100) / 100;
  return `M ${radius} 0 A ${radius} ${radius} 0 ${Math.abs(sweep) > 180 ? 1 : 0} ${sweep > 0 ? 1 : 0} ${x} ${y}`;
}

export function ConnectionStream({ layout, className }: { layout: LayoutName; className?: string }) {
  const gradientId = `eco-arc-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const arc = ARCS[layout];
  const size = (arc.radius + RIBBON_OFFSET + 16) * 2;
  const half = size / 2;

  return (
    <div
      className={cx(styles.connection, className)}
      style={{
        ...box(size, size),
        transform: `translate3d(${u(arc.center[0])}, ${u(arc.center[1])}, ${u(arc.center[2])}) ${arc.matrix}`,
      }}
    >
      <svg viewBox={`${-half} ${-half} ${size} ${size}`} aria-hidden="true">
        <defs>
          {/* Along the chord: teal off Cloudversity, near-white through the
              core, green into AyaTech — faded out at both ends so the arc
              seems to leave each world rather than stop at it. */}
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1={arc.start[0]}
            y1={arc.start[1]}
            x2={arc.end[0]}
            y2={arc.end[1]}
          >
            <stop offset="0" style={{ stopColor: 'var(--color-brand-end)', stopOpacity: 0 }} />
            <stop offset="0.16" style={{ stopColor: 'var(--color-brand-end)', stopOpacity: 0.85 }} />
            <stop
              offset={arc.coreOnChord}
              style={{ stopColor: 'color-mix(in srgb, var(--color-brand-start) 25%, #fff)', stopOpacity: 1 }}
            />
            <stop offset="0.84" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.85 }} />
            <stop offset="1" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        {/* Soft glow under the line */}
        <path
          d={arcPath(arc.radius, arc.sweep)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.16"
        />
        <path
          d={arcPath(arc.radius, arc.sweep)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d={arcPath(arc.radius + RIBBON_OFFSET, arc.sweep)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="1"
          strokeDasharray="1.5 7"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>

      {PARTICLES[layout].map((particle) => {
        const [from, to] = particle.toTech ? [0, arc.sweep] : [arc.sweep, 0];
        /* The streak's bright end leads. A pivot turning toward larger angles
           carries its tip toward +y. */
        const heading = to > from ? 'to bottom' : 'to top';

        return (
          <span
            key={`${particle.duration}-${particle.delay}`}
            className={cx(styles.flow, particle.className)}
            style={
              {
                '--a0': `${from}deg`,
                '--a1': `${to}deg`,
                '--flow-duration': `${particle.duration}s`,
                '--flow-delay': `${particle.delay}s`,
              } as CSSProperties
            }
          >
            <span
              className={styles.flowStreak}
              style={
                {
                  ...box(3.4, 24),
                  transform: `translateX(${u(arc.radius)})`,
                  '--flow-heading': heading,
                  '--flow-color': particle.toTech ? 'var(--color-brand-end)' : 'var(--color-brand-start)',
                } as CSSProperties
              }
            />
          </span>
        );
      })}
    </div>
  );
}
