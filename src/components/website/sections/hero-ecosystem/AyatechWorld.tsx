import { Cpu } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import styles from './ecosystem.module.css';
import { LAYOUTS, r, translate3d, u, type Vec3 } from './geometry';
import {
  Billboard,
  box,
  cx,
  GroundShadow,
  Link3D,
  MiniLabel,
  Orb,
  Prism,
  Runner,
  SceneAnchor,
  WorldLabel,
  type WorldProps,
} from './primitives';

/*
 * AyaTech — a miniature technology infrastructure.
 *
 * A processor package turned 45° so it reads as a diamond, hovering over a
 * field of grid, its die the system's core. On three of its corners stand the
 * three zones AyaTech teaches — an AI network, a cloud cluster and a stack of
 * software architecture — each on a pedestal with a column of data rising to
 * it. A server rack blinks on the fourth corner.
 *
 * In the Universe story the world tells each chapter itself (signals from the
 * focus layer, see ecosystem.module.css):
 *   1 Focus  — AI, then Cloud, then Software: each zone's circuit draws out of
 *              the core, its column lights and the zone grows to full size.
 *   2 Tracks — the network splits: a branch from the core to every zone, the
 *              zones spread, and one track at a time comes forward, bright,
 *              with data running its branch.
 *   3 Build  — Learn: the zones draw in and the knowledge node at the core
 *              swells. Build: it breaks into blocks that assemble into a
 *              structure. Grow: the structure rises, lit — a finished system.
 *
 * Green, white and deeper green only. The brand is green and white, so there
 * is no teal and no navy anywhere in this world — the difference from
 * Cloudversity is carried by form, not by a borrowed colour.
 */

const TURN = 45;
const CHIP = { y: 58, size: 176, h: 14 };
const DIE = { size: 64, h: 12 };
/** World height of the die's top face — the core. */
const CORE_TOP = CHIP.y - DIE.h;
const PEDESTAL = { size: 26, h: 6 };

const PRIMARY = 'var(--color-primary)';
const PRIMARY_DEEP = 'var(--color-primary-hover)';
const START = 'var(--color-brand-start)';
const WHITE_SIDE = 'color-mix(in srgb, var(--color-primary) 8%, #fff)';
const SHADED_SIDE = 'color-mix(in srgb, var(--color-primary) 24%, #fff)';

/* ---------- the three zones ----------
   `corner` is chip-local; (58,-58) turns to the back, (-58,-58) to the left,
   (58,58) to the right. `centre` is where the zone floats, in world space.
   `trace` is the zone's circuit in the top face's own 176-unit square, from
   the die to the corner pad. */
type Zone = {
  id: 'ai' | 'cloud' | 'software';
  name: string;
  corner: [number, number];
  centre: Vec3;
  dir: [number, number];
  /** When it activates in chapter one; AI first, then Cloud, then Software. */
  from: number;
  /** Its turn in chapter two's 7.2s loop. */
  delay: number;
  trace: string;
};

const ZONES: Zone[] = [
  { id: 'ai', name: 'AI', corner: [58, -58], centre: [0, -24, -82], dir: [0, -1], from: 0, delay: 0, trace: 'M100 76 L124 52 H146 V30' },
  { id: 'cloud', name: 'Cloud', corner: [-58, -58], centre: [-82, -8, 0], dir: [-1, 0], from: 0.33, delay: 2.4, trace: 'M76 76 L52 52 H30 V30' },
  { id: 'software', name: 'Software', corner: [58, 58], centre: [82, 8, 0], dir: [1, 0], from: 0.66, delay: 4.8, trace: 'M100 100 L124 124 H146 V146' },
];

/* ---------- the circuit, in the top face's own 176-unit square ---------- */
const TRACES = [
  'M72 57V34H34V14',
  'M104 57V26H150',
  'M119 76H146V44',
  'M119 102H160',
  'M104 119V146H136V162',
  'M72 119V158',
  'M57 100H28V132',
  'M57 74H16',
];

const PADS = [
  [34, 14],
  [150, 26],
  [146, 44],
  [160, 102],
  [136, 162],
  [72, 158],
  [28, 132],
  [16, 74],
];

/* Straight runs of the traces above that carry a signal, always outward from
   the die. `turn` rotates the track about its start. */
const PULSES = [
  { from: [104, 26], length: 46, turn: 0, duration: 3.4, delay: -0.4 },
  { from: [119, 102], length: 41, turn: 0, duration: 3.9, delay: -2.1 },
  { from: [72, 119], length: 39, turn: 90, duration: 4.2, delay: -1.2 },
  { from: [57, 74], length: 41, turn: 180, duration: 3.6, delay: -3 },
];

const pct = (n: number) => `${r((n / CHIP.size) * 100)}%`;

function Circuit() {
  const line = 'color-mix(in srgb, var(--color-primary) 48%, transparent)';

  return (
    <>
      <svg viewBox={`0 0 ${CHIP.size} ${CHIP.size}`} aria-hidden="true">
        {/* The pad ring round the package edge. */}
        <rect
          x="7"
          y="7"
          width={CHIP.size - 14}
          height={CHIP.size - 14}
          rx="6"
          fill="none"
          strokeWidth="3"
          strokeDasharray="3 7"
          style={{ stroke: 'color-mix(in srgb, var(--color-primary) 26%, transparent)' }}
        />
        {TRACES.map((d) => (
          <path key={d} d={d} fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ stroke: line }} />
        ))}
        {PADS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3" style={{ fill: 'var(--color-surface)', stroke: line, strokeWidth: 1.6 }} />
        ))}

        {/* Chapter one: each zone's circuit draws out of the die, in turn. */}
        {ZONES.map((zone) => (
          <path
            key={zone.id}
            className={styles.zoneTrace}
            d={zone.trace}
            pathLength={100}
            strokeWidth={2.6}
            style={{ '--from': zone.from } as CSSProperties}
          />
        ))}
      </svg>

      {PULSES.map((pulse) => (
        <span
          key={pulse.from.join()}
          className={styles.trace}
          style={
            {
              left: pct(pulse.from[0]),
              top: pct(pulse.from[1]),
              width: pct(pulse.length),
              transform: `rotate(${pulse.turn}deg)`,
              '--pulse-duration': `${pulse.duration}s`,
              '--pulse-delay': `${pulse.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}

/* ================= what stands in each zone ================= */

/* AI — a small network: three layers of nodes, every link drawn. */
const AI_NODES: Vec3[] = [
  [-28, -12, 0],
  [-28, 12, 0],
  [0, -22, 8],
  [0, 0, 12],
  [0, 22, 8],
  [28, -12, 0],
  [28, 12, 0],
];

const AI_LINKS: [number, number][] = [
  [0, 2],
  [0, 3],
  [1, 3],
  [1, 4],
  [2, 5],
  [3, 5],
  [3, 6],
  [4, 6],
];

function AiNetwork() {
  return (
    <>
      {AI_LINKS.map(([a, b]) => {
        const from = AI_NODES[a];
        const to = AI_NODES[b];
        return from && to ? (
          <Link3D key={`${a}-${b}`} from={from} to={to} crossed={false} style={{ '--link': START } as CSSProperties} />
        ) : null;
      })}
      {AI_NODES.map((node, index) => (
        <Orb
          key={node.join()}
          at={node}
          size={index === 3 ? 11 : 8}
          color={index === 3 ? START : PRIMARY}
          dotClassName={styles.aiBlink}
          dotStyle={{ '--blink-delay': `${-index * 0.45}s` } as CSSProperties}
        />
      ))}
    </>
  );
}

/* Cloud — soft white spheres in a cluster, with a data point riding along. */
const CLOUD_PUFFS: { at: Vec3; size: number }[] = [
  { at: [0, 0, 0], size: 30 },
  { at: [-18, 6, 6], size: 22 },
  { at: [18, 5, 4], size: 24 },
  { at: [-5, 10, 14], size: 18 },
  { at: [9, -10, -4], size: 16 },
];

function CloudCluster() {
  return (
    <>
      {CLOUD_PUFFS.map((puff) => (
        <Orb key={puff.at.join()} at={puff.at} size={puff.size} color="color-mix(in srgb, var(--color-brand-start) 22%, #fff)" />
      ))}
      <Orb at={[26, -14, 8]} size={5} color={START} dotClassName={styles.aiBlink} />
    </>
  );
}

/* Software — layers of architecture, stacked on a column, turned with the chip. */
const SLABS = [-14, 0, 14];

function SoftwareStack() {
  return (
    <div className={styles.group} style={{ transform: `rotateY(${TURN}deg)` }}>
      {[0, 90].map((turn) => (
        <div
          key={turn}
          className={cx(styles.plane, styles.beam)}
          style={{ ...box(2, 40), transform: `translateY(${u(2)}) rotateY(${turn}deg)`, '--beam': START } as CSSProperties}
        />
      ))}
      {SLABS.map((top) => (
        <Prism
          key={top}
          w={34}
          d={34}
          h={4}
          at={[0, top, 0]}
          topClassName={styles.slabTop}
          sideClassName={styles.dieSide}
          shades={[PRIMARY_DEEP, PRIMARY_DEEP, PRIMARY, PRIMARY]}
        />
      ))}
    </div>
  );
}

const ZONE_CONTENT: Record<Zone['id'], () => ReactNode> = {
  ai: AiNetwork,
  cloud: CloudCluster,
  software: SoftwareStack,
};

/*
 * One zone in place. The placement carries its chapter-one activation
 * (`zoneAct`) so the column and the zone read the same value; then the
 * zone's state (grow · spread · draw back), then chapter two's loop, then
 * the zone itself with its glow and its name.
 */
function ZonePlace({ zone }: { zone: Zone }) {
  const [x, y, z] = zone.centre;
  const columnBottom = CHIP.y - PEDESTAL.h;
  const Content = ZONE_CONTENT[zone.id];

  return (
    <div
      className={cx(styles.group, styles.zoneAct)}
      style={
        {
          transform: translate3d([x, 0, z]),
          '--from': zone.from,
          '--dx': zone.dir[0],
          '--dz': zone.dir[1],
          '--loop-delay': `${zone.delay}s`,
        } as CSSProperties
      }
    >
      {/* The column of data from the pedestal up to the zone. */}
      {[0, 90].map((turn) => (
        <div
          key={turn}
          className={cx(styles.plane, styles.beam, styles.zoneColumn)}
          style={
            {
              ...box(2.5, columnBottom - y),
              transform: `translateY(${u((y + columnBottom) / 2)}) rotateY(${turn}deg)`,
              '--beam': START,
            } as CSSProperties
          }
        />
      ))}
      <Billboard at={[0, columnBottom - 4, 0]}>
        <span
          className={styles.rise}
          style={
            {
              ...box(4, 4),
              '--mote': START,
              '--rise-duration': '3.6s',
              '--rise-delay': `${-zone.delay * 0.5}s`,
            } as CSSProperties
          }
        />
      </Billboard>

      <div className={styles.group} style={{ transform: `translateY(${u(y)})` }}>
        <div className={cx(styles.group, styles.zoneState)}>
          <div className={cx(styles.group, styles.zoneLoop)}>
            <Billboard at={[0, 0, -22]}>
              <span
                className={cx(styles.halo, styles.zoneGlow)}
                style={{ ...box(110, 110), '--halo': 'color-mix(in srgb, var(--color-brand-start) 34%, transparent)' } as CSSProperties}
              />
            </Billboard>
            <Billboard at={[0, 0, -20]}>
              <span
                className={cx(styles.halo, styles.trackGlow)}
                style={{ ...box(150, 150), '--halo': 'color-mix(in srgb, var(--color-brand-start) 45%, transparent)' } as CSSProperties}
              />
            </Billboard>

            <Content />

            <MiniLabel
              at={[0, -36, 0]}
              className={styles.zoneLabel}
              style={{ '--label-ink': 'var(--color-primary-hover)' } as CSSProperties}
            >
              {zone.name}
            </MiniLabel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- chapter three: the blocks the core builds ----------
   Chip-local, relative to the die's top. Two-by-two on the die, two on top of
   those, a crown, and two annexes that reach down to the package. `at` is the
   top face's centre; each body hangs down by `h`. */
const BLOCKS: { at: Vec3; w: number; h: number }[] = [
  { at: [-14, -22, -14], w: 24, h: 22 },
  { at: [14, -22, -14], w: 24, h: 22 },
  { at: [-14, -22, 14], w: 24, h: 22 },
  { at: [14, -22, 14], w: 24, h: 22 },
  { at: [-44, -2, 0], w: 16, h: 14 },
  { at: [44, -2, 0], w: 16, h: 14 },
  { at: [0, -44, -14], w: 22, h: 22 },
  { at: [0, -44, 14], w: 22, h: 22 },
  { at: [0, -70, 0], w: 20, h: 26 },
];

/* When each block leaves the core, as a share of the "build" third. */
const BLOCK_FROM = [0, 0.08, 0.16, 0.24, 0.3, 0.36, 0.44, 0.52, 0.62];

export function AyatechWorld({ active, onEnter, onLeave, focus, onSelect }: WorldProps) {
  const { wide, compact } = LAYOUTS;

  return (
    <SceneAnchor
      wide={wide.ayatech}
      compact={compact.ayatech}
      wideScale={wide.worldScale}
      compactScale={compact.worldScale}
      enterDelay={0.45}
      float={{ duration: 10, delay: -3.5, amp: -6 }}
      active={active}
      world="ayatech"
      focus={focus}
      hit={{ w: 290, h: 300, y: 30, onEnter, onLeave, onSelect }}
      ground={
        <>
          {/* The grid the package hovers over. Outside the float, so the chip
              bobs against a field that holds still. */}
          <div
            className={cx(styles.plane, styles.substrate)}
            style={{ ...box(270, 270), transform: `translateY(${u(96)}) rotateY(${TURN}deg) rotateX(90deg)` }}
          />
          <GroundShadow y={90} w={200} d={200} />
        </>
      }
    >
      <Billboard at={[0, 20, -80]}>
        <span
          className={cx(styles.halo, styles.worldGlow)}
          style={{ ...box(360, 360), '--halo': 'color-mix(in srgb, var(--color-primary) 16%, transparent)' } as CSSProperties}
        />
      </Billboard>
      <Billboard at={[0, -30, -30]}>
        <span
          className={cx(styles.halo, styles.worldGlow)}
          style={{ ...box(240, 240), '--halo': 'color-mix(in srgb, var(--color-brand-start) 14%, transparent)' } as CSSProperties}
        />
      </Billboard>

      {/* ================= the package, in its own 45° frame ================= */}
      <div className={styles.group} style={{ transform: `translateY(${u(CHIP.y)}) rotateY(${TURN}deg)` }}>
        <Prism
          w={CHIP.size}
          d={CHIP.size}
          h={CHIP.h}
          at={[0, 0, 0]}
          topClassName={styles.chipTop}
          sideClassName={styles.chipSide}
          shades={[PRIMARY_DEEP, PRIMARY_DEEP, PRIMARY, 'var(--color-brand-middle)']}
          top={<Circuit />}
        />

        {/* The core. */}
        <Prism
          w={DIE.size}
          d={DIE.size}
          h={DIE.h}
          at={[0, -DIE.h, 0]}
          topClassName={styles.dieTop}
          sideClassName={styles.dieSide}
          shades={[PRIMARY, PRIMARY, START, START]}
        />
        <div className={styles.group} style={{ transform: `translateY(${u(-DIE.h - 0.5)})` }}>
          <span className={styles.corePulse} style={box(60, 60)} />
        </div>

        {/* Pedestals for the three zones. */}
        {ZONES.map((zone) => (
          <Prism
            key={zone.id}
            w={PEDESTAL.size}
            d={PEDESTAL.size}
            h={PEDESTAL.h}
            at={[zone.corner[0], -PEDESTAL.h, zone.corner[1]]}
            topClassName={styles.towerTop}
            sideClassName={styles.towerSide}
            shades={[SHADED_SIDE, SHADED_SIDE, WHITE_SIDE, WHITE_SIDE]}
          />
        ))}

        {/* The server rack on the front corner. */}
        <Prism
          w={22}
          d={22}
          h={40}
          at={[-58, -40, 58]}
          topClassName={styles.towerTop}
          sideClassName={styles.rackSide}
          shades={[PRIMARY_DEEP, PRIMARY_DEEP, PRIMARY, PRIMARY]}
          side={
            <>
              <span className={styles.rackLights} />
              <span className={styles.rackGrow} />
            </>
          }
          className="max-sm:hidden"
        />

        {/* ---------- chapter three: build, then grow ---------- */}
        <div className={styles.group} style={{ transform: `translateY(${u(-DIE.h)})` }}>
          <div className={cx(styles.group, styles.buildRise)}>
            {BLOCKS.map((block, index) => (
              <div
                key={block.at.join()}
                className={cx(styles.group, styles.block)}
                style={
                  {
                    '--from': BLOCK_FROM[index] ?? 0,
                    '--bx': block.at[0],
                    '--by': block.at[1],
                    '--bz': block.at[2],
                  } as CSSProperties
                }
              >
                <Prism
                  w={block.w}
                  d={block.w}
                  h={block.h}
                  at={[0, 0, 0]}
                  topClassName={index === BLOCKS.length - 1 ? styles.dieTop : styles.blockTop}
                  sideClassName={styles.towerSide}
                  shades={[SHADED_SIDE, SHADED_SIDE, WHITE_SIDE, WHITE_SIDE]}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= the zones ================= */}
      {ZONES.map((zone) => (
        <ZonePlace key={zone.id} zone={zone} />
      ))}

      {/* ---------- chapter two: the network splits, one branch per zone ---------- */}
      {ZONES.map((zone, index) => (
        <Link3D
          key={zone.id}
          from={[0, CORE_TOP - 14, 0]}
          to={zone.centre}
          className={styles.branch}
          style={{ '--from': index * 0.2, '--link': START, '--loop-delay': `${zone.delay}s` } as CSSProperties}
        >
          <span className={styles.branchPulse} style={{ position: 'absolute', inset: 0 }}>
            <Runner duration={1.2} />
          </span>
        </Link3D>
      ))}

      {/* ---------- chapter three: learn — the knowledge node at the core ----------
          Small at rest; it swells for "learn" and gives itself up to the
          blocks for "build". */}
      <div className={styles.group} style={{ transform: translate3d([0, CORE_TOP - 22, 0]) }}>
        <div className={cx(styles.group, styles.knowledge)}>
          <Billboard at={[0, 0, -2]}>
            <span
              className={cx(styles.halo, styles.breathe)}
              style={
                {
                  ...box(64, 64),
                  '--halo': 'color-mix(in srgb, var(--color-brand-start) 50%, transparent)',
                  '--breathe-duration': '3.4s',
                  '--breathe-min': 0.6,
                } as CSSProperties
              }
            />
          </Billboard>
          <Orb at={[0, 0, 0]} size={20} color={START} />
        </div>
      </div>

      {/* ---------- chapter three: grow — the finished system, lit ---------- */}
      <div className={styles.group} style={{ transform: translate3d([0, CORE_TOP, 0]) }}>
        <div className={cx(styles.group, styles.buildRise)}>
          <div className={styles.group} style={{ transform: `translateY(${u(-84)})` }}>
            <div className={cx(styles.group, styles.beacon)}>
              <Billboard at={[0, 0, -2]}>
                <span
                  className={cx(styles.halo, styles.breathe)}
                  style={
                    {
                      ...box(60, 60),
                      '--halo': 'color-mix(in srgb, var(--color-brand-start) 55%, transparent)',
                      '--breathe-duration': '2.8s',
                      '--breathe-min': 0.6,
                    } as CSSProperties
                  }
                />
              </Billboard>
              <Orb at={[0, 0, 0]} size={12} color={START} />
            </div>
          </div>
          <div className={styles.group} style={{ transform: `translateY(${u(2)})` }}>
            <span className={styles.growRing} style={box(150, 150)} />
          </div>
        </div>
      </div>

      <Billboard at={[-12, CORE_TOP - 4, 8]}>
        <span
          className={styles.rise}
          style={
            {
              ...box(4, 4),
              '--mote': START,
              '--rise-duration': '6.5s',
              '--rise-delay': '-2s',
            } as CSSProperties
          }
        />
      </Billboard>

      <WorldLabel
        at={[0, 146, 60]}
        name="AyaTech"
        kind="Technology world"
        icon={Cpu}
        ring="var(--color-primary)"
        fill="linear-gradient(135deg, var(--color-brand-start), var(--color-primary-hover))"
      />
    </SceneAnchor>
  );
}
