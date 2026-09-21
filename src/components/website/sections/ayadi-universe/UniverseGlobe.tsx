import type { CSSProperties } from 'react';

import { AyadiMark3D } from '@/components/website/courses/AyadiMark3D';

import styles from './universe.module.css';

/*
 * The Ayadi universe, seen from outside: a wireframe globe of meridians and
 * latitudes with points of light on its surface, two orbits, and the Ayadi
 * mark as its core.
 *
 * CSS 3D like the rest of the site's 3D — every ring is a bordered circle
 * turned into place inside one `preserve-3d` sphere. All sizes are fractions
 * of `--globe`, so the same markup is a 400px decoration in the flow layout
 * and a 540px stage in the pinned story.
 *
 * `data-u` hooks are what AyadiUniverse's timeline animates: the camera (the
 * dive), the shell (the globe forming) and the logo (shrinking into the core).
 */

const MERIDIANS = Array.from({ length: 9 }, (_, index) => index * 20);
const LATITUDES = [-60, -30, 30, 60];

const RAD = Math.PI / 180;
const round = (n: number) => Math.round(n * 10000) / 10000;

type Tone = 'start' | 'end' | 'teal';

const TONES: Record<Tone, string> = {
  start: 'var(--color-brand-start)',
  end: 'var(--color-brand-end)',
  teal: 'var(--color-brand-teal)',
};

/* [latitude, longitude, colour] — scattered so no two share a meridian. */
const POINTS: [number, number, Tone][] = [
  [20, 10, 'start'],
  [48, 70, 'end'],
  [-12, 120, 'start'],
  [-40, 200, 'teal'],
  [8, 250, 'end'],
  [55, 300, 'start'],
  [-25, 330, 'end'],
  [30, 160, 'teal'],
  [-58, 60, 'start'],
  [0, 190, 'start'],
  [38, 230, 'end'],
  [-5, 40, 'teal'],
];

/* Fractions of the globe's diameter, ready for calc(var(--globe) * n). */
const nodes = POINTS.map(([lat, lon, tone]) => ({
  key: `${lat}-${lon}`,
  x: round(0.5 * Math.cos(lat * RAD) * Math.sin(lon * RAD)),
  y: round(-0.5 * Math.sin(lat * RAD)),
  z: round(0.5 * Math.cos(lat * RAD) * Math.cos(lon * RAD)),
  tone: TONES[tone],
}));

/* A latitude ring is a smaller circle lifted off the equator. Its lift is a
   percentage of its own height, so no pixel value is ever needed. */
const latitudes = LATITUDES.map((lat) => {
  const scale = Math.cos(lat * RAD);
  const inset = round(((1 - scale) / 2) * 100);
  const lift = round((-Math.sin(lat * RAD) / (2 * scale)) * 100);
  return { lat, inset, lift };
});

const ORBITS = [
  { tiltX: 74, tiltZ: -18, spin: 22 },
  { tiltX: 66, tiltZ: 32, spin: 31 },
];

const g = (n: number) => `calc(var(--globe) * ${n})`;

export function UniverseGlobe() {
  return (
    <div data-u="globe" aria-hidden="true" className={styles.globeCamera}>
      <div className={styles.globeWorld}>
        <span className={styles.globeHalo} />

        <div data-u="globe-shell" className={styles.globeShell}>
          <div className={styles.globeTilt}>
            <div className={styles.globeSpin}>
              {MERIDIANS.map((turn) => (
                <span
                  key={turn}
                  className={`${styles.ring} ${styles.meridian}`}
                  style={{ transform: `rotateY(${turn}deg)` }}
                />
              ))}

              <span className={`${styles.ring} ${styles.equator}`} style={{ transform: 'rotateX(90deg)' }} />

              {latitudes.map(({ lat, inset, lift }) => (
                <span
                  key={lat}
                  className={styles.ring}
                  style={{ inset: `${inset}%`, transform: `translateY(${lift}%) rotateX(90deg)` }}
                />
              ))}

              {nodes.map((node) => (
                <span
                  key={node.key}
                  className={styles.nodePos}
                  style={{ transform: `translate3d(${g(node.x)}, ${g(node.y)}, ${g(node.z)})` }}
                >
                  <span className={styles.nodeFace}>
                    <span className={styles.nodeDot} style={{ '--dot': node.tone } as CSSProperties} />
                  </span>
                </span>
              ))}
            </div>
          </div>

          {ORBITS.map((orbit) => (
            <span
              key={orbit.spin}
              className={styles.orbit}
              style={{ transform: `rotateZ(${orbit.tiltZ}deg) rotateX(${orbit.tiltX}deg)` }}
            >
              <span className={styles.orbitSpin} style={{ '--spin': `${orbit.spin}s` } as CSSProperties}>
                <span className={styles.comet} />
              </span>
            </span>
          ))}
        </div>

        <div data-u="globe-logo" className={styles.globeLogo}>
          <span className={styles.riseIn} style={{ '--rise-delay': '0.1s' } as CSSProperties}>
            <AyadiMark3D />
          </span>
        </div>
      </div>
    </div>
  );
}
