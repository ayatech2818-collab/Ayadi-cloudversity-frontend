import type { CSSProperties } from 'react';

import styles from './ecosystem.module.css';
import { LAYOUTS, r, u } from './geometry';
import { Billboard, box, cx, SceneAnchor, type Focus } from './primitives';

/*
 * The shared core — where learning and technology meet.
 *
 * Deliberately not a third brand: no name, no label, no colour of its own.
 * It is a glass sphere in the two worlds' shared green and teal, holding a
 * slowly turning crystal, with two rings drawn round it. The connection arc
 * passes straight through it.
 *
 * The glass is two camera-facing discs, one in front of the crystal and one
 * behind, so the crystal genuinely sits inside it at any viewing angle.
 */

const SPHERE = 86;
const GLASS_DEPTH = 40;

/* ---------- the crystal: an octahedron from eight triangles ----------
   Two square pyramids base to base. For an edge of CRYSTAL the faces are
   equilateral, and each leans in from the vertical by atan(1/√2). */
const CRYSTAL = 36;
const FACET_HEIGHT = r((CRYSTAL * Math.sqrt(3)) / 2);
const FACET_LEAN = r((Math.atan(1 / Math.SQRT2) * 180) / Math.PI);
const FACET_TONES = [
  'var(--color-brand-start)',
  'var(--color-brand-end)',
  'var(--color-brand-middle)',
  'var(--color-brand-teal)',
];

const RINGS = [
  { size: 136, tiltZ: 24, tiltX: 72, spin: 15, reverse: false, wideOnly: false },
  { size: 162, tiltZ: -32, tiltX: 63, spin: 23, reverse: true, wideOnly: true },
];

export function EcosystemCore({ focus }: { focus?: Focus }) {
  const { wide, compact } = LAYOUTS;

  return (
    <SceneAnchor
      wide={wide.core}
      compact={compact.core}
      wideScale={wide.coreScale}
      compactScale={compact.coreScale}
      enterDelay={0.6}
      float={{ duration: 7, delay: -1.5, amp: -5 }}
      focus={focus}
    >
      {/* Its light — breathing, and wide enough to wash both worlds' edges. */}
      <Billboard at={[0, 0, -60]}>
        <span
          className={cx(styles.halo, styles.breathe)}
          style={
            {
              ...box(260, 260),
              '--halo': 'color-mix(in srgb, var(--color-brand-start) 20%, transparent)',
              '--breathe-duration': '6.5s',
              '--breathe-min': 0.6,
            } as CSSProperties
          }
        />
      </Billboard>

      {/* Back of the glass: the tinted interior. */}
      <Billboard at={[0, 0, 0]}>
        <span
          className={cx(styles.plane, styles.sphereBack)}
          style={{ ...box(SPHERE + 4, SPHERE + 4), transform: `translateZ(${u(-GLASS_DEPTH)})` }}
        />
        {/* Depth on the wrapper, breathing on the glow: `breathe` animates
            transform, and would otherwise wipe out the translateZ. */}
        <span className={styles.group} style={{ transform: `translateZ(${u(-GLASS_DEPTH + 2)})` }}>
          <span
            className={cx(styles.halo, styles.breathe)}
            style={
              {
                ...box(56, 56),
                '--halo': 'color-mix(in srgb, #fff 80%, transparent)',
                '--breathe-duration': '4.5s',
                '--breathe-min': 0.5,
              } as CSSProperties
            }
          />
        </span>
      </Billboard>

      {/* The crystal, tipped a little so its turn shows its faces. */}
      <div className={styles.group} style={{ transform: 'rotateX(-10deg) rotateZ(8deg)' }}>
        <div className={cx(styles.group, styles.crystal)}>
          {FACET_TONES.map((tone, index) => (
            <span
              key={`up-${tone}`}
              className={cx(styles.facet, styles.facetUp)}
              style={
                {
                  width: u(CRYSTAL),
                  height: u(FACET_HEIGHT),
                  marginLeft: u(-CRYSTAL / 2),
                  marginTop: u(-FACET_HEIGHT),
                  transform: `rotateY(${index * 90}deg) translateZ(${u(CRYSTAL / 2)}) rotateX(${FACET_LEAN}deg)`,
                  '--facet': tone,
                } as CSSProperties
              }
            />
          ))}
          {FACET_TONES.map((tone, index) => (
            <span
              key={`down-${tone}`}
              className={cx(styles.facet, styles.facetDown)}
              style={
                {
                  width: u(CRYSTAL),
                  height: u(FACET_HEIGHT),
                  marginLeft: u(-CRYSTAL / 2),
                  /* Offset by one so light and dark facets alternate round the waist. */
                  transform: `rotateY(${index * 90 + 90}deg) translateZ(${u(CRYSTAL / 2)}) rotateX(${-FACET_LEAN}deg)`,
                  '--facet': tone,
                } as CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* Front of the glass: rim light and the specular highlight. */}
      <Billboard at={[0, 0, 0]}>
        <span
          className={cx(styles.plane, styles.sphereFront)}
          style={{ ...box(SPHERE, SPHERE), transform: `translateZ(${u(GLASS_DEPTH)})` }}
        />
      </Billboard>

      {RINGS.map((ring) => (
        <div
          key={ring.size}
          className={cx(styles.plane, styles.coreRing, ring.wideOnly && 'max-sm:hidden')}
          style={{ ...box(ring.size, ring.size), transform: `rotateZ(${ring.tiltZ}deg) rotateX(${ring.tiltX}deg)` }}
        >
          <span
            className={styles.coreArc}
            style={
              {
                '--spin-duration': `${ring.spin}s`,
                animationDirection: ring.reverse ? 'reverse' : undefined,
              } as CSSProperties
            }
          />
        </div>
      ))}
    </SceneAnchor>
  );
}
