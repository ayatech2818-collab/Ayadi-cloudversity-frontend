import type { LucideIcon } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';

import styles from './ecosystem.module.css';
import { anchorVars, r, translate3d, u, type Vec3 } from './geometry';

/** Sizes a w×h leaf and centres it on its group's origin. */
export const box = (w: number, h: number): CSSProperties => ({
  width: u(w),
  height: u(h),
  marginLeft: u(-w / 2),
  marginTop: u(-h / 2),
});

export const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

/** In a focused scene, the object brought forward ('in') or sent back ('out'). */
export type Focus = 'in' | 'out';

/** What each world takes from the stage: whether it is the hovered one, how to report hover,
    and — when the scene is used to choose a brand — its focus and what a click does. */
export type WorldProps = {
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  focus?: Focus;
  onSelect?: () => void;
};

/* ---------- a placed object ----------
   Position (per composition) → focus → entrance → hover lift → idle float.
   Nested groups, one transform each, so the entrance never snaps the float,
   the hover never fights the focus, and so on. The hit area rides the focus
   layer but stays below the lift, so the object rising toward the cursor
   cannot slide out from under it and flicker. */
type SceneAnchorProps = {
  wide: Vec3;
  compact: Vec3;
  wideScale?: number;
  compactScale?: number;
  enterDelay: number;
  float: { duration: number; delay: number; amp?: number };
  active?: boolean;
  /** Names the object for the stylesheet (`data-world`). */
  world?: string;
  focus?: Focus;
  hit?: { w: number; h: number; y: number; onEnter: () => void; onLeave: () => void; onSelect?: () => void };
  /** Rendered inside the lift but outside the float — a ground shadow stays put while its object bobs. */
  ground?: ReactNode;
  children: ReactNode;
};

export function SceneAnchor({
  wide,
  compact,
  wideScale = 1,
  compactScale = 1,
  enterDelay,
  float,
  active,
  world,
  focus,
  hit,
  ground,
  children,
}: SceneAnchorProps) {
  const floatVars = {
    '--float-duration': `${float.duration}s`,
    '--float-delay': `${float.delay}s`,
    '--float-amp': float.amp ?? -7,
  } as CSSProperties;

  return (
    <div
      className={cx(styles.group, styles.anchor)}
      data-active={active ? '' : undefined}
      data-world={world}
      style={anchorVars(wide, compact, wideScale, compactScale)}
    >
      <div className={cx(styles.group, styles.focusLayer)} data-focus={focus}>
        {hit ? (
          <div
            className={styles.hit}
            data-selectable={hit.onSelect ? '' : undefined}
            style={{ ...box(hit.w, hit.h), transform: `translateY(${u(hit.y)})` }}
            onPointerEnter={hit.onEnter}
            onPointerLeave={hit.onLeave}
            onClick={hit.onSelect}
          />
        ) : null}

        <div className={cx(styles.group, styles.enter)} style={{ '--enter-delay': `${enterDelay}s` } as CSSProperties}>
          <div className={cx(styles.group, styles.lift)} style={floatVars}>
            {ground}
            <div className={cx(styles.group, styles.float)}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- a camera-facing point ----------
   Positioned by the outer group, turned to face the viewer by the inner one. */
export function Billboard({ at, className, children }: { at: Vec3; className?: string; children: ReactNode }) {
  return (
    <div className={cx(styles.group, className)} style={{ transform: translate3d(at) }}>
      <div className={cx(styles.group, styles.billboard)}>{children}</div>
    </div>
  );
}

/** A small lit sphere, always round. `dotClassName` reaches the sphere itself, for loops. */
export function Orb({
  at,
  size,
  color,
  className,
  dotClassName,
  dotStyle,
}: {
  at: Vec3;
  size: number;
  color: string;
  className?: string;
  dotClassName?: string;
  dotStyle?: CSSProperties;
}) {
  return (
    <Billboard at={at} className={className}>
      <span
        className={cx(styles.node, dotClassName)}
        style={{ ...box(size, size), '--node': color, ...dotStyle } as CSSProperties}
      />
    </Billboard>
  );
}

/* ---------- a solid ----------
   A box with its origin at the centre of its top face and its body hanging
   down by `h`. Five faces — nothing ever sees the bottom — each culled from
   behind, so only the faces turned toward the camera draw. Sides take a
   `--shade` each, which is how the key light from the upper left is faked. */
type PrismProps = {
  w: number;
  d: number;
  h: number;
  at: Vec3;
  topClassName: string;
  sideClassName: string;
  /** front, right, back, left */
  shades: readonly [string, string, string, string];
  top?: ReactNode;
  /** Rendered inside every side face — lights on a server rack, say. */
  side?: ReactNode;
  className?: string;
};

export function Prism({ w, d, h, at, topClassName, sideClassName, shades, top, side, className }: PrismProps) {
  const sides = [
    { turn: 0, width: w, reach: d },
    { turn: 90, width: d, reach: w },
    { turn: 180, width: w, reach: d },
    { turn: -90, width: d, reach: w },
  ];

  return (
    <div className={cx(styles.group, className)} style={{ transform: translate3d(at) }}>
      <div className={cx(styles.face, topClassName)} style={{ ...box(w, d), transform: 'rotateX(90deg)' }}>
        {top}
      </div>

      {sides.map((face, index) => (
        <div
          key={face.turn}
          className={cx(styles.face, sideClassName)}
          style={
            {
              ...box(face.width, h),
              transform: `rotateY(${face.turn}deg) translateZ(${u(face.reach / 2)}) translateY(${u(h / 2)})`,
              '--shade': shades[index],
            } as CSSProperties
          }
        >
          {side}
        </div>
      ))}
    </div>
  );
}

/* ---------- the name plate under each world ----------
   Billboarded so it is always read square-on. Text sizes are fixed pixels,
   not scene units: the scene can shrink on a phone, the brand name cannot. */
type WorldLabelProps = {
  at: Vec3;
  name: string;
  kind: string;
  icon: LucideIcon;
  /** Hairline and hover glow. */
  ring: string;
  /** Icon disc. */
  fill: string;
};

export function WorldLabel({ at, name, kind, icon: Icon, ring, fill }: WorldLabelProps) {
  return (
    <Billboard at={at}>
      <div className={styles.label} style={{ '--label-ring': ring, '--label-fill': fill } as CSSProperties}>
        <span className={styles.labelIcon}>
          <Icon aria-hidden="true" size={13} strokeWidth={2.2} />
        </span>
        <span>
          <span className={styles.labelName}>{name}</span>
          <span className={styles.labelKind}>{kind}</span>
        </span>
      </div>
    </Billboard>
  );
}

/** A soft contact shadow on an imaginary floor `y` units below the object. */
export function GroundShadow({ y, w, d }: { y: number; w: number; d: number }) {
  return (
    <div className={styles.group} style={{ transform: `translateY(${u(y)})` }}>
      <div className={styles.shadow} style={box(w, d)} />
    </div>
  );
}

/* ================= chapter-driven pieces =================
   The Universe story scrubs --cp0/1/2 on the scene; the focus layer turns
   them into --k0/1/2 for the world in focus only (and --kl/--kb/--kg for the
   learn / build / grow thirds of chapter three). These helpers read them. */

type Signal = 'k0' | 'k1' | 'k2' | 'kl' | 'kb' | 'kg';

/* ---------- a piece that grows in with a chapter ----------
   Scale 0 → 1 as `src` moves through [from, from + span], and back down as
   `exit` rises. `--vis` is left on the group for leaves inside to fade by. */
export function Reveal({
  src,
  from = 0,
  span = 0.3,
  exit,
  at,
  grow = true,
  className,
  style,
  children,
}: {
  src: Signal;
  from?: number;
  span?: number;
  exit?: Signal;
  at?: Vec3;
  grow?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const vars = {
    '--src': `var(--${src})`,
    '--from': from,
    '--span': span,
    '--exit': exit ? `var(--${exit})` : 0,
    ...style,
  } as CSSProperties;

  const inner = (
    <div className={cx(styles.group, styles.reveal, grow && styles.grow, className)} style={vars}>
      {children}
    </div>
  );

  return at ? (
    <div className={styles.group} style={{ transform: translate3d(at) }}>
      {inner}
    </div>
  ) : (
    inner
  );
}

/* ---------- a line between two points in space ----------
   A thin plane along local x, turned to point from `from` to `to`, with a
   second plane crossed through it so it never goes edge-on. Children ride
   the first plane — a travelling data dot, for instance. */
export function Link3D({
  from,
  to,
  crossed = true,
  className,
  style,
  children,
}: {
  from: Vec3;
  to: Vec3;
  crossed?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);
  const yaw = (Math.atan2(-dz, dx) * 180) / Math.PI;
  const pitch = (Math.asin(dy / length) * 180) / Math.PI;

  return (
    <div className={styles.group} style={{ transform: `${translate3d(from)} rotateY(${r(yaw)}deg) rotateZ(${r(pitch)}deg)` }}>
      <span className={cx(styles.link, className)} style={{ width: u(length), ...style }}>
        {children}
      </span>
      {crossed ? (
        <span
          className={cx(styles.link, className)}
          style={{ width: u(length), ...style, '--flip': '90deg' } as CSSProperties}
        />
      ) : null}
    </div>
  );
}

/** A small camera-facing tag — a pathway, subject or zone name. Fixed pixel type. */
export function MiniLabel({
  at,
  children,
  className,
  style,
}: {
  at: Vec3;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Billboard at={at}>
      <span className={cx(styles.miniLabel, className)} style={style}>
        {children}
      </span>
    </Billboard>
  );
}

/** A dot running the length of its parent track or link, forever. */
export function Runner({ duration = 2.4, delay = 0 }: { duration?: number; delay?: number }) {
  return (
    <span className={styles.runner} style={{ '--run': `${duration}s`, '--run-delay': `${delay}s` } as CSSProperties}>
      <span className={styles.runnerDot} />
    </span>
  );
}
