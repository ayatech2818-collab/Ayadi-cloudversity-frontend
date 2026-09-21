'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { AyatechWorld } from './AyatechWorld';
import { CloudversityWorld } from './CloudversityWorld';
import { ConnectionStream } from './ConnectionStream';
import { EcosystemCore } from './EcosystemCore';
import styles from './ecosystem.module.css';
import { BASE_TILT_X, type Vec3 } from './geometry';
import { NO_PHOTOS, type PhotoAvailability } from './photos';
import { Billboard, box } from './primitives';

/*
 * The Home hero's visual: two worlds — Ayadi Cloudversity and AyaTech — in one
 * space, joined through a shared core.
 *
 * This is the interactive counterpart to the Course page's scroll story, not
 * another one: nothing here is tied to scroll. The mouse turns the scene a few
 * degrees toward itself, hovering a world brings it forward, and otherwise it
 * idles — floats, a slow drift, particles along the connection.
 *
 * Cost, kept deliberately low:
 *  - Every idle motion is a CSS animation on a transform or opacity, so it runs
 *    on the compositor. There is no always-on JS loop.
 *  - The pointer loop only runs while the tilt is catching up to the cursor,
 *    and stops as soon as it settles.
 *  - Offscreen, `data-paused` freezes every animation in the scene.
 *  - It is all DOM and CSS: no WebGL, no canvas, nothing to download, and it
 *    renders complete on the server — the page is whole before JS arrives.
 */

/** Degrees of tilt with the cursor at the edge of the viewport. Kept small: a look, not a steer. */
const TILT = { x: 5, y: 9 };

/** How fast the tilt catches the cursor. Higher is snappier. */
const EASE_RATE = 4.5;

export type WorldId = 'cloudversity' | 'ayatech';

/* Motes of light at different depths across the whole scene. Their parallax
   against the worlds is most of what sells the depth under the pointer. */
const MOTES: { at: Vec3; size: number; color: string; duration: number; delay: number; className?: string }[] = [
  { at: [-262, 34, 70], size: 5, color: 'var(--color-brand-end)', duration: 15, delay: -2 },
  { at: [236, -168, -90], size: 6, color: 'var(--color-brand-start)', duration: 18, delay: -7 },
  { at: [-36, 214, 130], size: 4, color: 'var(--color-primary)', duration: 13, delay: -4, className: 'max-sm:hidden' },
  { at: [118, -236, 50], size: 4, color: 'var(--color-brand-end)', duration: 16, delay: -10, className: 'max-sm:hidden' },
  { at: [-214, -246, -130], size: 5, color: 'var(--color-brand-teal)', duration: 17, delay: -5, className: 'max-sm:hidden' },
  { at: [276, 44, 160], size: 4, color: 'var(--color-brand-middle)', duration: 14, delay: -1, className: 'max-lg:hidden' },
  { at: [8, 132, -170], size: 6, color: 'var(--color-brand-start)', duration: 19, delay: -12, className: 'max-lg:hidden' },
];

/* The light behind the scene, in percentages of the backdrop. Green behind
   Cloudversity with the faintest blue above it, teal round the core, green
   again under AyaTech — the page's own ambient gradient, reused. */
const WASHES: { style: CSSProperties; duration: number; delay: number }[] = [
  { style: { left: '4%', top: '6%', width: '58%', backgroundImage: 'var(--background-image-hero-ambient)' }, duration: 12, delay: 0 },
  {
    style: {
      left: '0%',
      top: '0%',
      width: '44%',
      background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-accent-soft) 9%, transparent), transparent)',
    },
    duration: 14,
    delay: -5,
  },
  {
    style: {
      left: '34%',
      top: '20%',
      width: '46%',
      background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-brand-end) 14%, transparent), transparent)',
    },
    duration: 10,
    delay: -3,
  },
  {
    style: {
      left: '44%',
      top: '46%',
      width: '54%',
      background: 'radial-gradient(closest-side, color-mix(in srgb, var(--color-primary) 12%, transparent), transparent)',
    },
    duration: 13,
    delay: -8,
  },
];

const clamp = (value: number) => Math.max(-1, Math.min(1, value));

type Hero3DEcosystemProps = {
  /** Bring one world forward and send the rest back — the scene as a brand chooser. */
  focus?: WorldId | null;
  /** Makes the worlds clickable. */
  onSelectWorld?: (id: WorldId) => void;
  /** The story chapter on screen (0–2), if any. Starts that chapter's loops in the focused world. */
  chapter?: number | null;
  /** Which of the Cloudversity photographs exist yet. */
  photos?: PhotoAvailability;
};

export function Hero3DEcosystem({
  focus = null,
  onSelectWorld,
  chapter = null,
  photos = NO_PHOTOS,
}: Hero3DEcosystemProps = {}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<WorldId | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    /* Tilt is for a mouse, with motion welcome. On touch there is no hover
       to leave the scene in, and the CSS sway already keeps it alive. */
    const canTilt = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    let last = 0;
    let inView = true;

    const write = () => {
      stage.style.setProperty('--ry', `${(current.x * TILT.y).toFixed(3)}deg`);
      stage.style.setProperty('--rx', `${(BASE_TILT_X - current.y * TILT.x).toFixed(3)}deg`);
      stage.style.setProperty('--px', current.x.toFixed(4));
      stage.style.setProperty('--py', current.y.toFixed(4));
    };

    const tick = (now: number) => {
      /* Frame-rate independent easing; the cap stops a long frame (a tab
         coming back) from jumping the whole distance at once. */
      const step = 1 - Math.exp(-Math.min((now - last) / 1000, 0.05) * EASE_RATE);
      last = now;
      current.x += (target.x - current.x) * step;
      current.y += (target.y - current.y) * step;
      write();

      if (Math.abs(target.x - current.x) < 0.0005 && Math.abs(target.y - current.y) < 0.0005) {
        frame = 0;
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    const run = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    /* Straight back to rest, no easing — for when nobody is watching the
       move, or motion has just been turned off. */
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      target.x = target.y = current.x = current.y = 0;
      write();
    };

    /* Measured from the stage's centre against half the viewport, so the
       whole screen steers it, not just the few hundred pixels of the scene. */
    const onMove = (event: PointerEvent) => {
      if (!inView || !canTilt.matches || event.pointerType === 'touch') return;
      const rect = stage.getBoundingClientRect();
      target.x = clamp((event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2));
      target.y = clamp((event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2));
      run();
    };

    /* The pointer left the window: drift back to centre. */
    const onOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      target.x = target.y = 0;
      run();
    };

    const onPreferenceChange = () => {
      if (!canTilt.matches) reset();
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        stage.toggleAttribute('data-paused', !inView);
        if (!inView) reset();
      },
      { rootMargin: '120px 0px' },
    );

    observer.observe(stage);
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerout', onOut);
    canTilt.addEventListener('change', onPreferenceChange);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onOut);
      canTilt.removeEventListener('change', onPreferenceChange);
    };
  }, []);

  const hoverFor = (id: WorldId) => ({
    active: active === id,
    onEnter: () => setActive(id),
    onLeave: () => setActive((current) => (current === id ? null : current)),
    focus: focus ? (focus === id ? ('in' as const) : ('out' as const)) : undefined,
    onSelect: onSelectWorld ? () => onSelectWorld(id) : undefined,
  });

  return (
    <div
      ref={stageRef}
      role="img"
      aria-label="The Ayadi ecosystem: the Ayadi Cloudversity learning world and the AyaTech technology world, connected through a shared core."
      className={styles.stage}
      data-focus={focus ?? undefined}
      data-chapter={chapter ?? undefined}
      style={{ '--rx': `${BASE_TILT_X}deg`, '--ry': '0deg' } as CSSProperties}
    >
      <div aria-hidden="true" className={styles.backdrop}>
        {WASHES.map((wash) => (
          <span
            key={`${wash.style.left}-${wash.style.top}`}
            className={styles.wash}
            style={
              {
                ...wash.style,
                aspectRatio: '1',
                '--breathe-duration': `${wash.duration}s`,
                '--breathe-delay': `${wash.delay}s`,
                '--breathe-min': 0.72,
              } as CSSProperties
            }
          />
        ))}
        <span className={styles.dots} />
      </div>

      <div aria-hidden="true" className={styles.camera}>
        <div className={styles.sway}>
          <div className={styles.scene}>
            {/* One arc per composition; CSS shows the one that matches. */}
            <ConnectionStream layout="wide" className="max-sm:hidden" />
            <ConnectionStream layout="compact" className="sm:hidden" />

            <CloudversityWorld {...hoverFor('cloudversity')} photos={photos} />
            <EcosystemCore focus={focus ? 'out' : undefined} />
            <AyatechWorld {...hoverFor('ayatech')} />

            {MOTES.map((mote) => (
              <Billboard key={mote.at.join()} at={mote.at} className={mote.className}>
                <span
                  className={styles.mote}
                  style={
                    {
                      ...box(mote.size, mote.size),
                      '--mote': mote.color,
                      '--drift-duration': `${mote.duration}s`,
                      '--drift-delay': `${mote.delay}s`,
                    } as CSSProperties
                  }
                />
              </Billboard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
