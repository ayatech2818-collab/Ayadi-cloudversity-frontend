import { GraduationCap } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import { brandContentMap } from '@/components/website/courses/dummyData';
import { learningWorlds } from '@/components/website/courses/journey';

import styles from './ecosystem.module.css';
import { LAYOUTS, r, rotateX, rotateZ, translate3d, u, type Vec3 } from './geometry';
import { NO_PHOTOS, type PhotoAvailability, type PhotoId } from './photos';
import { PhotoPanel } from './PhotoPanel';
import {
  Billboard,
  box,
  cx,
  GroundShadow,
  MiniLabel,
  Orb,
  Prism,
  Reveal,
  Runner,
  SceneAnchor,
  WorldLabel,
  type WorldProps,
} from './primitives';

/*
 * Ayadi Cloudversity — a miniature learning ecosystem.
 *
 * A floating platform with a learning core at its heart: a glowing sphere
 * under a spiral of steps that climbs to the next step. Round it stand six
 * small learning structures, one for each subject the platform teaches —
 * an open book, a graduation cap, pages in flight, a laptop, creative forms
 * and a growing tree — with an orbit of knowledge nodes and pages above.
 *
 * In the Universe story the world tells each chapter itself (signals from the
 * focus layer, see ecosystem.module.css):
 *   1 Pathways   — four pathways draw out of the core, their ends light,
 *                  particles run them, the core brightens, the platform opens.
 *   2 Subjects   — six subject nodes rise round the ring; one at a time each
 *                  lights, a link runs to the core, and its structure answers.
 *   3 Programmes — the structures bow out, a portal opens in the platform and
 *                  the three featured programmes rise from it, one per step.
 * A real photograph arrives beside the world for each chapter.
 *
 * All positions are world units round the world's centre; 0° on the platform
 * is the back (up on screen), 90° the right.
 */

const RAD = Math.PI / 180;

const ISLAND_Y = 64;
/** Where things standing on the platform stand. */
const SURFACE = ISLAND_Y - 1;

const polar = (deg: number, radius: number, y: number): Vec3 => [
  r(radius * Math.sin(deg * RAD)),
  y,
  r(-radius * Math.cos(deg * RAD)),
];

/* Stacked discs under the top face: a lens-shaped underside that fades from
   the brand gradient down into a navy depth. */
const ISLAND_LAYERS = [
  { drop: 5, size: 232, tone: 'var(--color-brand-middle)' },
  { drop: 11, size: 222, tone: 'var(--color-brand-end)' },
  { drop: 19, size: 202, tone: 'var(--color-brand-teal)' },
  { drop: 29, size: 166, tone: 'color-mix(in srgb, var(--color-brand-teal) 62%, var(--color-accent-soft))' },
  { drop: 41, size: 112, tone: 'color-mix(in srgb, var(--color-brand-teal) 32%, var(--color-accent-soft))' },
];

/* ---------- the learning core and the steps that climb from it ---------- */
const CORE = { y: ISLAND_Y - 20, size: 26 };

const STEP_COUNT = 8;
const STEP_RADIUS = 26;
const STEP_BOTTOM = 32;
const STEP_RISE = 13;
const STEP = { w: 18, d: 12, edge: 4 };

const STEP_TONES = [
  'var(--color-brand-start)',
  'var(--color-brand-middle)',
  'color-mix(in srgb, var(--color-brand-start) 50%, var(--color-brand-end))',
  'var(--color-brand-end)',
  'var(--color-brand-teal)',
  'color-mix(in srgb, var(--color-brand-teal) 60%, var(--color-accent-soft))',
  'color-mix(in srgb, var(--color-accent-soft) 34%, var(--color-surface))',
  'color-mix(in srgb, var(--color-brand-end) 12%, var(--color-surface))',
];

const steps = Array.from({ length: STEP_COUNT }, (_, index) => ({
  y: STEP_BOTTOM - index * STEP_RISE,
  turn: index * (360 / STEP_COUNT),
  tone: STEP_TONES[index],
}));

const GOAL_Y = STEP_BOTTOM - STEP_COUNT * STEP_RISE - 6;
const BEAM = { top: GOAL_Y + 4, bottom: CORE.y };

/* ---------- the orbit of knowledge nodes ---------- */
const ORBIT = { y: -18, size: 250, tiltX: 76, tiltZ: -10 };

const onOrbit = (degrees: number): Vec3 => {
  const radius = ORBIT.size / 2;
  const radians = degrees * RAD;
  const [x, y, z] = rotateZ(rotateX([radius * Math.cos(radians), radius * Math.sin(radians), 0], ORBIT.tiltX), ORBIT.tiltZ);
  return [r(x), r(y + ORBIT.y), r(z)];
};

const ORBIT_NODES = [
  { at: onOrbit(28), size: 11, color: 'var(--color-brand-end)' },
  { at: onOrbit(152), size: 9, color: 'var(--color-brand-start)' },
  /* The one navy note in the scene that is not shadow. */
  { at: onOrbit(248), size: 8, color: 'color-mix(in srgb, var(--color-accent-soft) 70%, var(--color-brand-end))' },
];

const RISERS = [
  { at: [-52, ISLAND_Y - 6, 34] as Vec3, color: 'var(--color-brand-end)', duration: 7.5, delay: -1 },
  { at: [44, ISLAND_Y - 6, -18] as Vec3, color: 'var(--color-brand-start)', duration: 9, delay: -4.2 },
];

/* ---------- chapter one: four pathways out of the core ---------- */
const PATHWAYS = [
  { name: 'Academic', deg: 0 },
  { name: 'Skills', deg: 90 },
  { name: 'Career', deg: 180 },
  { name: 'Creative', deg: 270 },
];

const PATH_REACH = 108;
/** Stagger between pathways, in chapter-one progress. */
const PATH_STEP = 0.16;

const SURFACE_SIZE = 236;
const HALF = SURFACE_SIZE / 2;

/* The surface plane's own 2D frame: x as the world's, y as the world's z. */
const pathD = (deg: number) =>
  `M${HALF} ${HALF} L${r(HALF + PATH_REACH * Math.sin(deg * RAD))} ${r(HALF - PATH_REACH * Math.cos(deg * RAD))}`;

/* ---------- chapter two: the six subjects, from the Course page ---------- */
const SUBJECT_RING = 96;
const STRUCTURE_RING = 70;

/* The tints journey.ts gives the same subjects, as colours. */
const SUBJECT_TONES = [
  'var(--color-primary)',
  'var(--color-brand-teal)',
  'var(--color-accent)',
  'var(--color-accent-soft)',
  '#f59e0b',
  'var(--color-brand-start)',
];

const subjects = learningWorlds.map((world, index) => ({
  id: world.id,
  title: world.title,
  deg: index * 60,
  tone: SUBJECT_TONES[index] ?? 'var(--color-brand-end)',
  /* One subject every 1.2s round a 7.2s loop. */
  delay: index * 1.2,
}));

/* ---------- chapter three: the featured programmes, from dummyData ---------- */
const PROGRAMMES = brandContentMap.ayadi.courses.slice(0, 3);
const PROGRAMME_SLOTS: Vec3[] = [
  [-104, -50, 20],
  [0, -92, 40],
  [104, -50, 20],
];
/* One per scroll stop of chapter three. */
const PROGRAMME_FROM = [0.02, 0.36, 0.7];

/* ---------- a photograph per chapter ---------- */
const PHOTO_SPOTS: { id: PhotoId; at: Vec3; turn: number; src: string; exit?: string }[] = [
  { id: 'learning', at: [-182, -74, -30], turn: 24, src: 'k0', exit: 'k1' },
  { id: 'skills', at: [184, -92, -36], turn: -24, src: 'k1', exit: 'k2' },
  { id: 'career', at: [-186, -30, -16], turn: 22, src: 'k2' },
];

const TEAL = 'var(--color-brand-teal)';
const TEAL_DEEP = 'color-mix(in srgb, var(--color-brand-teal) 70%, var(--color-accent-strong))';
const NAVY = 'var(--color-accent-soft)';
const NAVY_DEEP = 'var(--color-accent)';

/* ================= the six learning structures ================= */

/* Academic — an open book on a small lectern, pages opening toward you. */
function Book() {
  return (
    <>
      <Prism
        w={26}
        d={12}
        h={7}
        at={[0, -7, 0]}
        topClassName={styles.laptopBase}
        sideClassName={styles.dieSide}
        shades={[TEAL_DEEP, TEAL_DEEP, TEAL, TEAL]}
      />
      <div
        className={cx(styles.plane, styles.bookPage, styles.bookLeft)}
        style={{ width: u(22), height: u(30), marginLeft: u(-22), marginTop: u(-15), transform: `translateY(${u(-22)}) rotateY(26deg)` }}
      />
      <div
        className={cx(styles.plane, styles.bookPage, styles.bookRight)}
        style={{ width: u(22), height: u(30), marginTop: u(-15), transform: `translateY(${u(-22)}) rotateY(-26deg)` }}
      />
    </>
  );
}

/* Exams — a graduation cap: a navy block with its board laid flat on top. */
function Mortarboard() {
  return (
    <>
      <Prism
        w={16}
        d={16}
        h={11}
        at={[0, -11, 0]}
        topClassName={styles.capTop}
        sideClassName={styles.dieSide}
        shades={[NAVY_DEEP, NAVY_DEEP, NAVY, NAVY]}
      />
      <div
        className={cx(styles.plane, styles.board)}
        style={{ ...box(30, 30), transform: `translateY(${u(-12)}) rotateX(90deg) rotateZ(45deg)` }}
      />
      <div className={cx(styles.plane, styles.tassel)} style={{ ...box(1.4, 14), transform: `translate3d(${u(19)}, ${u(-5)}, 0)` }} />
      <Orb at={[19, 2, 0]} size={4} color="var(--color-brand-start)" />
    </>
  );
}

/* Languages — pages in flight, fanned from one spine. */
function LanguagePages() {
  return (
    <div
      className={cx(styles.group, styles.float)}
      style={{ '--float-duration': '6s', '--float-delay': '-1.5s', '--float-amp': -4 } as CSSProperties}
    >
      {[-22, 0, 22].map((fan) => (
        <div
          key={fan}
          className={cx(styles.plane, styles.page)}
          style={{ width: u(18), height: u(24), marginTop: u(-12), transform: `translateY(${u(-26)}) rotateY(${fan}deg)` }}
        />
      ))}
    </div>
  );
}

/* Professional — a laptop: digital learning and the workplace it leads to. */
function Laptop() {
  return (
    <>
      <div className={cx(styles.plane, styles.laptopBase)} style={{ ...box(34, 22), transform: `translateY(${u(-1)}) rotateX(90deg)` }} />
      <div
        className={cx(styles.plane, styles.laptopScreen)}
        style={{
          width: u(34),
          height: u(23),
          marginLeft: u(-17),
          marginTop: u(-23),
          transform: `translate3d(0, ${u(-1)}, ${u(-11)}) rotateX(14deg)`,
        }}
      />
    </>
  );
}

/* Creative skills — overlapping forms: a design layer, a warm shape, a ring. */
function CreativeForms() {
  return (
    <>
      <div
        className={cx(styles.plane, styles.shapeA)}
        style={{ ...box(22, 22), transform: `translate3d(${u(-5)}, ${u(-20)}, 0) rotateY(28deg) rotateZ(14deg)` }}
      />
      <div
        className={cx(styles.plane, styles.shapeB)}
        style={{ ...box(17, 17), transform: `translate3d(${u(8)}, ${u(-30)}, ${u(5)}) rotateY(-24deg) rotateZ(-10deg)` }}
      />
      <div
        className={cx(styles.plane, styles.shapeRing)}
        style={{ ...box(20, 20), transform: `translate3d(${u(-9)}, ${u(-12)}, ${u(-6)}) rotateY(52deg)` }}
      />
    </>
  );
}

/* Personal growth — a tiered tree, lightest at the crown. */
const TIERS = [
  { y: -14, size: 30, tone: 'var(--color-brand-start)' },
  { y: -23, size: 22, tone: 'var(--color-brand-middle)' },
  { y: -31, size: 13, tone: 'var(--color-brand-end)' },
];

function GrowthTree() {
  return (
    <>
      {[0, 90].map((turn) => (
        <div
          key={turn}
          className={cx(styles.plane, styles.trunk)}
          style={{ ...box(3, 18), transform: `translateY(${u(-9)}) rotateY(${turn}deg)` }}
        />
      ))}
      {TIERS.map((tier) => (
        <div
          key={tier.y}
          className={cx(styles.plane, styles.leafTier)}
          style={{ ...box(tier.size, tier.size), transform: `translateY(${u(tier.y)}) rotateX(90deg)`, '--tone': tier.tone } as CSSProperties}
        />
      ))}
      <Orb at={[0, -36, 0]} size={7} color="var(--color-brand-start)" />
    </>
  );
}

/* In subject order, so structure i belongs to subject i. */
const STRUCTURES = [Book, Mortarboard, LanguagePages, Laptop, CreativeForms, GrowthTree];

/*
 * One structure in place: position → bows out in chapter three → answers
 * its subject's turn in chapter two → the geometry, with a glow at its foot.
 */
function Structure({ deg, delay, tone, children }: { deg: number; delay: number; tone: string; children: ReactNode }) {
  return (
    <div className={styles.group} style={{ transform: translate3d(polar(deg, STRUCTURE_RING, SURFACE)) }}>
      <div className={cx(styles.group, styles.sink)}>
        <div className={cx(styles.group, styles.respond)} style={{ '--loop-delay': `${delay}s` } as CSSProperties}>
          <span className={styles.respondGlow} style={{ ...box(40, 40), '--glow-tone': tone } as CSSProperties} />
          {children}
        </div>
      </div>
    </div>
  );
}

type CloudversityWorldProps = WorldProps & { photos?: PhotoAvailability };

export function CloudversityWorld({ active, onEnter, onLeave, focus, onSelect, photos = NO_PHOTOS }: CloudversityWorldProps) {
  const { wide, compact } = LAYOUTS;

  return (
    <SceneAnchor
      wide={wide.cloudversity}
      compact={compact.cloudversity}
      wideScale={wide.worldScale}
      compactScale={compact.worldScale}
      enterDelay={0.2}
      float={{ duration: 9, delay: 0 }}
      active={active}
      world="cloudversity"
      focus={focus}
      hit={{ w: 270, h: 320, y: 10, onEnter, onLeave, onSelect }}
      ground={<GroundShadow y={132} w={210} d={210} />}
    >
      {/* Light behind the world: teal atmosphere, and the faint navy accent
          that only Cloudversity carries. */}
      <Billboard at={[0, -20, -90]}>
        <span
          className={cx(styles.halo, styles.worldGlow)}
          style={{ ...box(380, 380), '--halo': 'color-mix(in srgb, var(--color-accent-soft) 15%, transparent)' } as CSSProperties}
        />
      </Billboard>
      <Billboard at={[0, 20, -40]}>
        <span
          className={cx(styles.halo, styles.worldGlow)}
          style={{ ...box(300, 300), '--halo': 'color-mix(in srgb, var(--color-brand-end) 22%, transparent)' } as CSSProperties}
        />
      </Billboard>

      {/* ================= the platform ================= */}
      <div className={cx(styles.group, styles.platformSway)}>
        {/* Only the discs grow — the things standing on them keep their places. */}
        <div className={cx(styles.group, styles.platformGrow)}>
          {ISLAND_LAYERS.map((layer) => (
            <div
              key={layer.drop}
              className={cx(styles.plane, styles.islandLayer)}
              style={
                {
                  ...box(layer.size, layer.size),
                  transform: `translateY(${u(ISLAND_Y + layer.drop)}) rotateX(90deg)`,
                  '--tone': layer.tone,
                } as CSSProperties
              }
            />
          ))}
          <div
            className={cx(styles.plane, styles.islandTop)}
            style={{ ...box(236, 236), transform: `translateY(${u(ISLAND_Y)}) rotateX(90deg)` }}
          />
        </div>

        {/* A pad of light under the core. */}
        <div
          className={cx(styles.plane, styles.islandLayer)}
          style={
            {
              ...box(44, 44),
              transform: `translateY(${u(ISLAND_Y - 1.2)}) rotateX(90deg)`,
              '--tone': 'color-mix(in srgb, var(--color-brand-end) 55%, var(--color-surface))',
            } as CSSProperties
          }
        />

        {/* ---------- what is drawn on the platform ----------
            Pathways (chapter one) and subject links (chapter two), in one
            plane just above the top face. */}
        <div
          className={cx(styles.plane, styles.surface)}
          style={{ ...box(SURFACE_SIZE, SURFACE_SIZE), transform: `translateY(${u(ISLAND_Y - 0.8)}) rotateX(90deg)` }}
        >
          <svg viewBox={`0 0 ${SURFACE_SIZE} ${SURFACE_SIZE}`} aria-hidden="true">
            {PATHWAYS.map((path, index) => (
              <g key={path.name} style={{ '--from': index * PATH_STEP } as CSSProperties}>
                <path className={styles.pathGlow} d={pathD(path.deg)} pathLength={100} strokeWidth={8} style={{ stroke: 'var(--color-brand-end)' }} />
                <path className={styles.pathLine} d={pathD(path.deg)} pathLength={100} strokeWidth={2.2} style={{ stroke: 'var(--color-brand-start)' }} />
              </g>
            ))}
          </svg>

          {PATHWAYS.map((path, index) => (
            <span
              key={path.name}
              className={cx(styles.track, styles.pathTrack)}
              style={{ width: u(PATH_REACH), transform: `rotate(${path.deg - 90}deg)`, '--from': index * PATH_STEP } as CSSProperties}
            >
              <Runner duration={2.6} delay={-index * 0.7} />
            </span>
          ))}

          {subjects.map((subject) => (
            <span
              key={subject.id}
              className={cx(styles.track, styles.subjectTrack)}
              style={
                {
                  width: u(SUBJECT_RING - 12),
                  transform: `rotate(${subject.deg - 90}deg)`,
                  '--loop-delay': `${subject.delay}s`,
                  '--node': subject.tone,
                } as CSSProperties
              }
            >
              <span className={styles.subjectLine} />
              <Runner duration={1.1} />
            </span>
          ))}
        </div>

        {/* ---------- the six structures ---------- */}
        {subjects.map((subject, index) => {
          const Shape = STRUCTURES[index];
          return Shape ? (
            <Structure key={subject.id} deg={subject.deg} delay={subject.delay} tone={subject.tone}>
              <Shape />
            </Structure>
          ) : null;
        })}

        {/* ---------- chapter one: where each pathway leads ---------- */}
        {PATHWAYS.map((path, index) => (
          <Reveal
            key={path.name}
            src="k0"
            from={index * PATH_STEP + 0.22}
            span={0.2}
            exit="k1"
            at={polar(path.deg, PATH_REACH, SURFACE - 8)}
          >
            <Orb at={[0, 0, 0]} size={9} color="var(--color-brand-end)" />
            <MiniLabel at={[0, -12, 0]} style={{ '--label-ink': 'var(--color-brand-teal)' } as CSSProperties}>
              {path.name}
            </MiniLabel>
          </Reveal>
        ))}

        {/* ---------- chapter two: the subjects rise round the ring ---------- */}
        {subjects.map((subject, index) => (
          <Reveal
            key={subject.id}
            src="k1"
            from={index * 0.1}
            span={0.3}
            exit="k2"
            at={polar(subject.deg, SUBJECT_RING, SURFACE - 16)}
            style={{ '--loop-delay': `${subject.delay}s`, '--node': subject.tone } as CSSProperties}
          >
            <div className={cx(styles.group, styles.subjectLoop)}>
              <Orb at={[0, 0, 0]} size={10} color={subject.tone} />
            </div>
            <Billboard at={[0, 0, -1]}>
              <span className={styles.subjectRing} style={box(14, 14)} />
            </Billboard>
            <MiniLabel at={[0, -13, 0]}>{subject.title}</MiniLabel>
          </Reveal>
        ))}

        {/* ---------- chapter three: the portal the programmes rise from ---------- */}
        <div className={styles.group} style={{ transform: `translateY(${u(ISLAND_Y - 1.6)})` }}>
          <span className={styles.portal} style={box(84, 84)} />
        </div>
      </div>

      {/* ================= the learning core and its tower ================= */}
      <div className={cx(styles.group, styles.sink)}>
        <Billboard at={[0, CORE.y, -3]}>
          <span
            className={cx(styles.halo, styles.breathe)}
            style={
              {
                ...box(72, 72),
                '--halo': 'color-mix(in srgb, var(--color-brand-end) 45%, transparent)',
                '--breathe-duration': '5s',
                '--breathe-min': 0.55,
              } as CSSProperties
            }
          />
        </Billboard>
        <Billboard at={[0, CORE.y, -2]}>
          <span
            className={cx(styles.halo, styles.coreBright)}
            style={{ ...box(130, 130), '--halo': 'color-mix(in srgb, var(--color-brand-start) 40%, transparent)' } as CSSProperties}
          />
        </Billboard>
        <Orb at={[0, CORE.y, 0]} size={CORE.size} color="color-mix(in srgb, var(--color-brand-end) 60%, var(--color-surface))" />

        {/* The column of light the steps climb. Two crossed planes, so it
            reads as a column from any angle. */}
        {[0, 90].map((turn) => (
          <div
            key={turn}
            className={cx(styles.plane, styles.beam)}
            style={
              {
                ...box(2.5, BEAM.bottom - BEAM.top),
                transform: `translateY(${u((BEAM.top + BEAM.bottom) / 2)}) rotateY(${turn}deg)`,
                '--beam': 'var(--color-brand-end)',
              } as CSSProperties
            }
          />
        ))}

        <div className={cx(styles.group, styles.helix)}>
          {steps.map((step) => (
            <div
              key={step.turn}
              className={styles.group}
              style={
                {
                  transform: `translateY(${u(step.y)}) rotateY(${step.turn}deg) translateZ(${u(STEP_RADIUS)})`,
                  '--tone': step.tone,
                } as CSSProperties
              }
            >
              <div className={cx(styles.face, styles.stepTop)} style={{ ...box(STEP.w, STEP.d), transform: 'rotateX(90deg)' }} />
              <div
                className={cx(styles.face, styles.stepEdge)}
                style={{ ...box(STEP.w, STEP.edge), transform: `translateZ(${u(STEP.d / 2)}) translateY(${u(STEP.edge / 2)})` }}
              />
            </div>
          ))}
        </div>

        {/* The next step, at the top. The halo sits a hair behind the orb:
            coplanar planes in one 3D context have no reliable draw order. */}
        <Billboard at={[0, GOAL_Y, -3]}>
          <span
            className={cx(styles.halo, styles.breathe)}
            style={
              {
                ...box(64, 64),
                '--halo': 'color-mix(in srgb, var(--color-brand-end) 48%, transparent)',
                '--breathe-duration': '5.5s',
                '--breathe-min': 0.55,
              } as CSSProperties
            }
          />
        </Billboard>
        <Orb at={[0, GOAL_Y, 0]} size={14} color="color-mix(in srgb, var(--color-brand-end) 55%, var(--color-surface))" />
      </div>

      {/* ================= the orbit ================= */}
      <div
        className={cx(styles.plane, styles.orbit)}
        style={{
          ...box(ORBIT.size, ORBIT.size),
          transform: `translateY(${u(ORBIT.y)}) rotateZ(${ORBIT.tiltZ}deg) rotateX(${ORBIT.tiltX}deg)`,
        }}
      >
        <span className={styles.orbitSpin} style={{ '--spin-duration': '20s' } as CSSProperties}>
          <span className={styles.comet} style={{ ...box(3.5, 26), transform: `translateX(${u(ORBIT.size / 2 - 0.6)})` }} />
        </span>
      </div>
      {ORBIT_NODES.map((node) => (
        <Orb key={node.at.join()} at={node.at} size={node.size} color={node.color} />
      ))}

      {/* Two pages orbiting the core. Each turns back exactly as far as the
          orbit turns it, so its face stays toward the viewer. */}
      <div className={styles.group} style={{ transform: `translateY(${u(-40)})` }}>
        <div className={cx(styles.group, styles.pagesSpin)}>
          {[0, 180].map((angle) => (
            <div
              key={angle}
              className={styles.group}
              style={{ transform: `rotateY(${angle}deg) translateZ(${u(128)}) rotateY(${-angle}deg)` }}
            >
              <div className={cx(styles.group, styles.pagesCounter)}>
                <div className={cx(styles.plane, styles.page)} style={{ width: u(16), height: u(21), marginTop: u(-10.5), marginLeft: u(-8) }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {RISERS.map((riser) => (
        <Billboard key={riser.at.join()} at={riser.at}>
          <span
            className={styles.rise}
            style={
              {
                ...box(4, 4),
                '--mote': riser.color,
                '--rise-duration': `${riser.duration}s`,
                '--rise-delay': `${riser.delay}s`,
              } as CSSProperties
            }
          />
        </Billboard>
      ))}

      {/* ================= chapter three: the programmes rise ================= */}
      {PROGRAMMES.map((course, index) => {
        const [tx, ty, tz] = PROGRAMME_SLOTS[index] ?? [0, -80, 30];
        return (
          <div
            key={course.id}
            className={cx(styles.group, styles.progMove)}
            style={
              {
                '--from': PROGRAMME_FROM[index] ?? 0,
                '--span': 0.28,
                '--tx': tx,
                '--ty': ty,
                '--tz': tz,
                '--y0': ISLAND_Y - 6,
              } as CSSProperties
            }
          >
            <div className={cx(styles.group, styles.billboard)}>
              <div className={styles.progCard}>
                <span className={styles.progCategory}>{course.category}</span>
                <span className={styles.progTitle}>{course.title}</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* ================= a photograph per chapter ================= */}
      {PHOTO_SPOTS.map((spot) => (
        <div
          key={spot.id}
          className={styles.group}
          style={{ transform: `${translate3d(spot.at)} rotateY(${spot.turn}deg) rotateX(14deg)` }}
        >
          <div
            className={cx(styles.group, styles.photoMove)}
            style={
              {
                '--src': `var(--${spot.src})`,
                '--exit': spot.exit ? `var(--${spot.exit})` : 0,
                '--from': 0.05,
                '--span': 0.4,
                '--swing': `${spot.turn > 0 ? 30 : -30}deg`,
              } as CSSProperties
            }
          >
            <PhotoPanel id={spot.id} available={photos[spot.id]} />
          </div>
        </div>
      ))}

      <WorldLabel
        at={[0, 150, 40]}
        name="Ayadi Cloudversity"
        kind="Learning world"
        icon={GraduationCap}
        ring="var(--color-brand-end)"
        fill="linear-gradient(135deg, var(--color-brand-start), var(--color-brand-end) 60%, var(--color-accent-soft))"
      />
    </SceneAnchor>
  );
}
