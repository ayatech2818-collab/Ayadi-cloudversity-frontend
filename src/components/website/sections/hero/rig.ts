/*
 * The rig: every number the hero's scroll journey moves, in one plain object.
 *
 * AyadiHero's scrubbed GSAP timeline writes the story values; the pointer and
 * scroll listeners write the live ones; the WebGL scene reads the lot once per
 * frame. None of it is React state, so scrolling never re-renders anything —
 * scroll → ScrollTrigger → timeline → rig → uniforms and the camera.
 *
 * Scroll position is the only source of truth for the story values. They are
 * never advanced by time, so stopping, reversing or flinging the page always
 * lands on a frame the timeline can describe.
 */
export type Rig = {
  /* ---------- the story, written by the timeline ---------- */

  /** 1 = the 3D mark sits in the opening's logo slot; 0 = free in the scene. */
  dock: number;
  /** Mark rotation about Y and X, radians. */
  logoSpin: number;
  logoTilt: number;
  /** Mark size once undocked (1 = two world units tall). */
  logoScale: number;
  /** Mark depth — it drifts back through the portal ahead of the camera. */
  logoZ: number;
  /** The mark's own light once it has become the globe's core. */
  logoGlow: number;
  logoFade: number;

  camX: number;
  camY: number;
  camZ: number;
  lookY: number;
  /** Vertical field of view, degrees. Kicks wider for a moment at the crossing. */
  fov: number;

  /** 0 = the light page the hero opens on, 1 = deep green space. */
  dark: number;
  /** 0 = this side of the portal, 1 = the far side. */
  world: number;

  /** The globe's lattice drawing itself in. */
  globe: number;
  /** Globe body and atmosphere. */
  body: number;
  /** Network points and arcs. */
  nodes: number;
  /** Scroll-driven share of the globe's rotation, radians. */
  spin: number;
  /** 0 = globe, 1 = portal. The lattice tips toward the camera and squares off. */
  morph: number;
  /** The liquid glass surface inside the portal frame. */
  surface: number;
  ripple: number;
  /** Light coming through the surface as the camera nears it. */
  shine: number;

  /** Strength of the full-screen liquid pass. Zero everywhere but the crossing. */
  distortion: number;
  /** 0 → 1 across the crossing: the membrane's edge sweeping past the lens. */
  crossing: number;
  /** The far-side environment settling in. */
  arrive: number;
  /** Progress through the Why Choose Ayadi stage, 0 → 1. The Director keeps
      its panel on the portal's glass while this is between the two. */
  info: number;
  /** Extra travel toward the portal during the Why stage, world units. The
      story's own approach eases to a near stop there; this keeps the camera
      moving, and is handed back inside the fast approach that follows. */
  push: number;

  /* ---------- live input, written by the page ---------- */

  /** Pointer, −1 … 1 from the viewport centre. Smoothed in the scene. */
  pointerX: number;
  pointerY: number;
  /** performance.now() of the last scroll, pointer move or resize. */
  activeAt: number;
  /** The hero has the screen — the only time the scene renders at all. It
      loses it to the Ayadi journey below once a world has been chosen, so the
      two cinematics never run at once. */
  live: boolean;

  /** The opening's logo slot, in pixels from the stage's top-left (the
      canvas's own space), so the 3D mark can sit in it. */
  slotLeft: number;
  slotTop: number;
  slotWidth: number;
  slotHeight: number;

  /** The opening's AYADI watermark, as laid out on the page — the backdrop
      shader draws it from this, behind the 3D mark. */
  watermark: WatermarkSpec;

  /** The Why panel's laid-out size in CSS pixels, before it is scaled onto
      the glass. */
  infoWidth: number;
  infoHeight: number;
};

export type WatermarkSpec = {
  /** Pixels from the stage's top-left, as the slot. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** Pixels as drawn on screen (after the opening's --fit scale). */
  fontSize: number;
  letterSpacing: number;
  paddingLeft: number;
  fontFamily: string;
  fontWeight: string;
  /** Bumped on every measure, so the scene knows to redraw. */
  version: number;
};

/** The first frame of the story. Every timeline tween starts from these. */
export const RIG_START = {
  dock: 1,
  logoSpin: -0.26,
  logoTilt: 0,
  logoScale: 1,
  logoZ: 0,
  logoGlow: 0,
  logoFade: 1,
  camX: 0,
  camY: 0,
  camZ: 7,
  lookY: 0,
  fov: 40,
  dark: 0,
  world: 0,
  globe: 0,
  body: 0,
  nodes: 0,
  spin: 0,
  morph: 0,
  surface: 0,
  ripple: 0,
  shine: 0,
  distortion: 0,
  crossing: 0,
  arrive: 0,
  info: 0,
  push: 0,
} satisfies Partial<Rig>;

export type StoryKey = keyof typeof RIG_START;

export function createRig(): Rig {
  return {
    ...RIG_START,
    pointerX: 0,
    pointerY: 0,
    activeAt: 0,
    live: true,
    slotLeft: 0,
    slotTop: 0,
    slotWidth: 0,
    slotHeight: 0,
    watermark: {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
      fontSize: 0,
      letterSpacing: 0,
      paddingLeft: 0,
      fontFamily: 'sans-serif',
      fontWeight: '800',
      version: 0,
    },
    infoWidth: 0,
    infoHeight: 0,
  };
}

/** How much the scene is allowed to spend. Picked once, when the canvas mounts. */
export type Quality = {
  tier: 'high' | 'medium' | 'low';
  dpr: [number, number];
  antialias: boolean;
  particles: number;
  /** Segments per lattice loop. */
  segments: number;
  /** The soft second pass that makes the lattice glow. */
  halo: boolean;
  /** Render-target scale for the liquid pass. */
  liquidScale: number;
};

export function pickQuality(): Quality {
  const width = window.innerWidth;
  const cores = navigator.hardwareConcurrency || 4;

  if (width < 768 || cores <= 4) {
    return { tier: 'low', dpr: [1, 1.25], antialias: false, particles: 70, segments: 96, halo: false, liquidScale: 0.5 };
  }
  if (width < 1280) {
    return { tier: 'medium', dpr: [1, 1.25], antialias: false, particles: 130, segments: 128, halo: true, liquidScale: 0.6 };
  }
  return { tier: 'high', dpr: [1, 1.5], antialias: true, particles: 190, segments: 160, halo: true, liquidScale: 0.75 };
}
