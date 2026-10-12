'use client';

import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';

import { storyStarted, WHY_KEYS, type Quality, type Rig } from '../rig';
import { Backdrop, FarSide, Motes } from './Environment';
import { createFrame, type Frame } from './frame';
import { canRenderFields, createField, disposeField, drawField, fullscreenTriangle, type Field } from './geometry';
import { GlobePortal } from './GlobePortal';
import { Mark } from './Mark';
import { FLOW_FRAGMENT, LIQUID_FRAGMENT, SCREEN_VERTEX } from './shaders';
import {
  cardMatrix,
  cardProgress,
  createWhyPhase,
  isDrawable,
  layoutWhy,
  nearFade,
  toMatrix3d,
  whyPhase,
  wordsScale,
  type WhySizes,
} from './why';
import { WhyRipples } from './WhyRipples';

export type HeroSceneProps = {
  rig: RefObject<Rig>;
  quality: Quality;
  /** Called once, when the scene is on screen — still asleep, drawing the
      logo exactly as the fallback artwork — and about to wake. */
  onReady: () => void;
  /** The Why Choose Ayadi layer: the Director keeps its heading on the
      portal's glass and stands its cards in the portal's space. */
  overlay: RefObject<HTMLDivElement | null>;
};

/*
 * The hero's single WebGL canvas. Loaded lazily (next/dynamic, no SSR) by
 * AyadiHero; everything in it reads the rig and nothing in it is React state.
 */
export default function HeroScene({ rig, quality, onReady, overlay }: HeroSceneProps) {
  const frame = useRef<Frame>(createFrame());
  /* The canvas's pixel ratio: the tier's own range — until the Director has
     to bring it down (see "keeping up"), and then a number. Held here rather
     than set on the canvas's store, which takes the prop back every time the
     canvas renders. */
  const [dpr, setDpr] = useState<Quality['dpr'] | number>(quality.dpr);

  return (
    <Canvas
      frameloop="never"
      flat
      /* No shader here asks three for its colour-space conversion (see the
         top of shaders.ts), so this changes no pixel. What it changes is
         that drawing to the screen and drawing to the liquid's target then
         want the same program — one set to compile, not two. */
      linear
      dpr={dpr}
      resize={MEASURE}
      gl={{ antialias: quality.antialias, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 40, near: 0.05, far: 90, position: [0, 0, 7] }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* The Director must stay first: its useFrame sets the camera and the
          shared frame values that every other part reads. */}
      <Director
        rig={rig}
        frame={frame}
        onReady={onReady}
        overlay={overlay}
        warp={quality.tier !== 'low'}
        glow={quality.halo}
        onLower={setDpr}
      />
      <Backdrop rig={rig} frame={frame} />
      <Motes rig={rig} frame={frame} count={quality.particles} />
      <Mark rig={rig} frame={frame} />
      <GlobePortal rig={rig} frame={frame} quality={quality} />
      <WhyRipples rig={rig} frame={frame} />
      <FarSide rig={rig} frame={frame} />
      <LiquidPass rig={rig} frame={frame} scale={quality.liquidScale} />
    </Canvas>
  );
}

const target = new THREE.Vector3();
const offset = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

/** The canvas takes no pointer, so where it sits on the page is nothing to
    it: only its size is watched. (Left to itself it would also measure — and
    render again — whenever the page scrolled.) */
const MEASURE = { scroll: false };

/* ---------- pacing ----------
   The scene draws on GSAP's ticker, which runs once per frame the browser
   is ready to show — 60 a second on most screens, 144 or more on some.

   While something is moving it draws on every tick. That is not as greedy
   as it sounds: the browser hands ticks out no faster than the GPU gives
   frames back, so where a frame of the scene takes two of the display's the
   ticks arrive two apart, and the scene lands on every one. Holding it to a
   rate of its own instead (it was once held near 60) only loses frames: a
   tick the scene sits out still has the page composited for it, and the
   scene falls to the one after — every third frame of a 144 Hz display, as
   measured, on a GPU that could have kept every second.

   At rest it draws IDLE_FPS a second for the idle motion, by time: due once
   the gap since the last frame is within half a display frame of the one
   wanted. The half frame matters — the ticker's timing wanders by a
   millisecond or two, and a threshold set right at the interval turns that
   wander into skipped frames. */

/** What the scene draws at rest, frames a second. */
const IDLE_FPS = 30;
/** How long after the last scroll or pointer move the scene still counts as busy. */
const BUSY_FOR_MS = 700;

/** The least the scene should manage while something moves, frames a second
    — what "keeping up" is judged against, not a cap. */
const FLOOR_FPS = 60;

/** How many of the display's frames one of the scene's may take and still be
    keeping up, for a display with this frame interval in milliseconds: one
    up to ~100 Hz, two at 120–165 Hz… */
const framesEach = (refresh: number) => Math.max(1, Math.floor(1000 / refresh / FLOOR_FPS + 0.2));

/* ---------- keeping up ----------
   On most GPUs the scene is done long before its frame is due. Where it is
   not — an integrated GPU, a large window — the browser hands out frames
   late, and the journey judders. The Director watches for that while the
   visitor is scrolling, and when the scene is under FLOOR_FPS more often
   than not it lets something go, least noticed first: the lattice's soft
   glow (a second pass over it, and by far the dearest thing here on a
   multisampled canvas), then the canvas's pixel ratio, a quarter at a time,
   down to 1. Each stays let go: nothing flickers back and forth. */

/** A frame is late when it lands this much of a display frame after the floor allows. */
const LATE_BY = 0.75;
/** Judged over this many frames drawn while the visitor scrolls… */
const WATCH = 90;
/** …and something goes when more than this share of them were late. */
const LATE_SHARE = 0.5;
/** No sooner than this after the last time something went, ms. */
const SETTLE_MS = 1500;
/** A gap this long is a stall — the tab was away, a chunk arrived — and says
    nothing about the GPU. */
const STALL_MS = 250;

/* ---------- the handoff ----------
   The page shows the official logo as an image until the scene can draw it
   (.fallbackMark in hero.module.css). The scene starts asleep (rig.wake = 0),
   drawing the lockup exactly as that image — the same outlines in the same
   place, flat, square-on, still, on the bare page — so the image clears off
   a picture identical to itself. Then the scene wakes: the light, the turn,
   the idle drift, the wash and the motes all arrive together, and the logo
   reads as coming alive rather than as being swapped. */

/** Frames drawn before the page is told. The first compiles the shaders; by
    the second, the first is on the glass. */
const READY_AFTER = 2;
/** The wake, in seconds. It eases in slowly enough that the scene is still
    the image's twin for the moment the image takes to clear. The page's own
    glow fades over the same stretch (.slotGlow) — change the two together. */
const WAKE_FOR = 1.6;

function Director({
  rig,
  frame,
  onReady,
  overlay,
  warp,
  glow,
  onLower,
}: {
  rig: RefObject<Rig>;
  frame: RefObject<Frame>;
  onReady: () => void;
  overlay: RefObject<HTMLDivElement | null>;
  /** Whether a Why card is also bent as it comes through (an SVG filter on
      the card — not for the lowest tier). */
  warp: boolean;
  /** Whether the lattice has a glow to let go of. */
  glow: boolean;
  /** Brings the canvas's pixel ratio down to this. */
  onLower: (dpr: number) => void;
}) {
  const advance = useThree((state) => state.advance);
  const get = useThree((state) => state.get);
  const why = useRef<WhyNodes | null>(null);

  /*
   * The clock. The canvas never renders on its own (frameloop="never").
   * GSAP's ticker — the one ScrollTrigger scrubs on — calls advance() right
   * after the timeline has moved the rig, so the 3D and the HTML over it
   * always show the same moment. Off screen it renders nothing; on screen it
   * keeps the pace set out above (see "pacing"), and lets something go if
   * the GPU cannot ("keeping up").
   *
   * It also runs the handoff (see above): two frames asleep, then the wake.
   */
  useEffect(() => {
    /* performance.now() of the last tick, and of the last frame drawn. */
    let lastTick = -1;
    let last = -1;
    let wasBusy = false;
    let frames = 0;
    let waking: gsap.core.Tween | null = null;

    /* The display's frame interval, ms: the shortest the ticker has held for
       five ticks running (their median, so one early tick cannot fool it).
       It only ever comes down — under load the ticker slows, the display
       does not. */
    let refresh = 1000 / 60;
    const gaps = new Float64Array(5).fill(refresh);
    const sorted = new Float64Array(5);
    let gapAt = 0;

    /* Keeping up: frames judged, frames late, and when something last went. */
    let seen = 0;
    let late = 0;
    let easedAt = 0;

    const ease = (now: number) => {
      const f = frame.current;
      const dpr = get().viewport.dpr;
      if (glow && f.glowTo > 0) f.glowTo = 0;
      else if (dpr > 1) onLower(Math.max(1, dpr - 0.25));
      else return;
      easedAt = now;
    };

    const tick = () => {
      const now = performance.now();
      const r = rig.current;

      if (lastTick >= 0) {
        gaps[gapAt] = now - lastTick;
        gapAt = (gapAt + 1) % gaps.length;
        sorted.set(gaps);
        sorted.sort();
        if (sorted[2] > 3 && sorted[2] < refresh) refresh = sorted[2];
      }
      lastTick = now;

      /* The scroll has the logo now. Whatever is left of the handoff is over
         before this frame is drawn, so the two never show at once. */
      if (r.wake < 1 && storyStarted(r)) {
        waking?.kill();
        r.wake = 1;
      }

      if (!r.live) {
        last = -1;
        return;
      }

      const busy = now - r.activeAt < BUSY_FOR_MS;
      /* Waking is motion too, so it gets the full rate — but nobody is
         scrolling, so it stays out of the count below. */
      const moving = busy || (r.wake > 0 && r.wake < 1);
      if (!moving && last >= 0 && now - last < 1000 / IDLE_FPS - refresh / 2) return;

      if (busy && wasBusy && last >= 0 && now - last < STALL_MS) {
        seen += 1;
        if (now - last > refresh * (framesEach(refresh) + LATE_BY)) late += 1;
        if (seen >= WATCH) {
          if (late > seen * LATE_SHARE && now - easedAt > SETTLE_MS) ease(now);
          seen = 0;
          late = 0;
        }
      }

      wasBusy = busy;
      last = now;
      advance(now / 1000);

      if (frames === READY_AFTER) return;
      frames += 1;
      if (frames < READY_AFTER) return;

      onReady();
      /* Unless the story is already under way — a reload part-way down. */
      if (r.wake < 1) waking = gsap.to(r, { wake: 1, duration: WAKE_FOR, ease: 'power2.inOut' });
    };

    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      waking?.kill();
    };
  }, [advance, frame, get, glow, onLower, onReady, rig]);

  useFrame((state, delta) => {
    const r = rig.current;
    const f = frame.current;
    direct(state, delta, r, f);

    /* Where the Why stage stands, for the ripples as much as for the page. */
    sizes.cardWidth = r.cardWidth;
    sizes.cardHeight = r.cardHeight;
    sizes.wordsWidth = r.infoWidth;
    sizes.wordsHeight = r.infoHeight;
    layoutWhy(f.why, state.size.width, state.size.height, f.fit, sizes);

    const layer = overlay.current;
    if (!layer) return;
    if (why.current?.layer !== layer) why.current = findWhy(layer, warp);
    placeWhy(state, r, f, why.current);
  });

  /* The page keeps these elements when the scene goes (the still layout
     shows them as an ordinary panel): hand them back as they were found. */
  useEffect(() => {
    const layer = overlay.current;
    return () => {
      if (layer) releaseWhy(layer);
    };
  }, [overlay]);

  return null;
}

/*
 * Every frame, before anything else: advance the shared frame values and put
 * the camera where the rig says. A plain function rather than inline in the
 * component — `frame` is the scene's shared scratch state, written here and
 * read everywhere else.
 */
function direct(state: RootState, delta: number, r: Rig, f: Frame) {
  const camera = state.camera as THREE.PerspectiveCamera;

  const dt = Math.min(Math.max(delta, 0), 0.1);
  f.dt = dt;
  f.time += dt;

  const ease = 1 - Math.exp(-dt * 3.2);
  f.px += (r.pointerX - f.px) * ease;
  f.py += (r.pointerY - f.py) * ease;

  /* The lattice's glow, where it has been let go: out over about a second,
     never switched off (see "keeping up"). */
  if (f.glow !== f.glowTo) {
    f.glow += (f.glowTo - f.glow) * (1 - Math.exp(-dt * 4));
    if (Math.abs(f.glow - f.glowTo) < 0.004) f.glow = f.glowTo;
  }

  const { width, height } = state.size;
  const aspect = width / Math.max(height, 1);
  f.aspect = aspect;
  f.fit = aspect < 1.3 ? Math.pow(1.3 / aspect, 0.85) : 1;

  /* The camera, from the rig. On this side of the portal distances are
     scaled by `fit`; the look target never falls behind the camera, so it can
     fly straight through without flipping round. */
  const travel = r.camZ - r.push;
  const camZ = travel > 0 ? travel * f.fit : travel;
  target.set(0, r.lookY, Math.min(0, camZ - 4));
  offset.set(r.camX, r.camY, camZ).sub(target);

  /* The pointer orbits a few degrees round the target. It never moves the
     story, eases off while the mark sits in its slot, lets go entirely
     during the liquid pass, and waits for the scene to wake. */
  const hold = (1 - r.distortion) * (1 - 0.75 * r.dock) * r.wake;
  offset.applyAxisAngle(Y_AXIS, f.px * 0.07 * hold);
  offset.applyAxisAngle(X_AXIS, f.py * 0.045 * hold);
  camera.position.copy(target).add(offset);
  camera.lookAt(target);

  camera.fov = r.fov;
  camera.aspect = aspect;
  camera.updateProjectionMatrix();

  /* Dock: shift the lens so the mark, at the world origin, lands on the
     opening's logo slot. The slot is measured relative to the stage, and the
     canvas is the stage, so no scroll offset comes into it. */
  let slotX = 0.42;
  let slotY = 0;
  let slotFrac = 0.46;
  if (r.slotHeight > 0) {
    const top = r.slotTop;
    slotX = ((r.slotLeft + r.slotWidth / 2) / width) * 2 - 1;
    slotY = 1 - ((top + r.slotHeight / 2) / height) * 2;
    slotFrac = r.slotHeight / height;
  }
  f.shiftX = slotX * r.dock;
  f.shiftY = slotY * r.dock;
  f.slotFrac = slotFrac;

  const elements = camera.projectionMatrix.elements;
  elements[8] -= f.shiftX;
  elements[9] -= f.shiftY;
  camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

  f.idleSpin = (f.idleSpin + dt * 0.08 * (1 - r.morph)) % (Math.PI * 2);
}

/* ---------- the Why Choose Ayadi stage ----------
   Its heading and cards are elements of the page (WhyStage.tsx), drawn over
   the canvas; what makes them part of the portal is that the Director gives
   each a place in the portal's space and draws it there, through this
   camera, every frame. Compositor-only writes — a transform, a few custom
   properties — and only for what has changed. */

/** How hard the liquid bends a card as it starts through (the SVG filter's
    displacement, in the card's own pixels). */
const WARP = 22;

/** The page's measurements of the stage, as the layout wants them. */
const sizes: WhySizes = { cardWidth: 0, cardHeight: 0, wordsWidth: 0, wordsHeight: 0 };

type WhyNodes = {
  layer: HTMLDivElement;
  head: HTMLElement | null;
  cards: HTMLElement[];
  /** Each card's liquid: the filter primitive whose `scale` bends it. */
  warps: Element[];
  /** Whether any of it was on the stage last frame. */
  active: boolean;
  headShown: boolean;
  /** What each card was last drawn as, so nothing is written twice. */
  drawn: { shown: boolean; e: number; fade: number; liquid: boolean }[];
};

function findWhy(layer: HTMLDivElement, warp: boolean): WhyNodes {
  layer.toggleAttribute('data-warp', warp);
  const cards = [...layer.querySelectorAll<HTMLElement>('[data-why="card"]')];
  return {
    layer,
    head: layer.querySelector<HTMLElement>('[data-why="head"]'),
    cards,
    warps: warp ? [...layer.querySelectorAll('[data-why="warp"]')] : [],
    active: false,
    headShown: false,
    drawn: cards.map(() => ({ shown: false, e: -1, fade: -1, liquid: false })),
  };
}

/** Everything placeWhy writes, taken off again. */
function releaseWhy(layer: HTMLDivElement) {
  layer.removeAttribute('data-warp');
  for (const node of layer.querySelectorAll<HTMLElement>('[data-why="head"], [data-why="card"]')) {
    node.removeAttribute('data-liquid');
    for (const property of ['transform', 'visibility', '--within', '--shown', '--glow']) {
      node.style.removeProperty(property);
    }
  }
  for (const node of layer.querySelectorAll('[data-why="warp"]')) node.setAttribute('scale', '0');
}

const headPoint = new THREE.Vector3();
const headAbove = new THREE.Vector3();
const headBelow = new THREE.Vector3();
const pane = new THREE.Matrix4();
const phase = createWhyPhase();

function placeWhy(state: RootState, r: Rig, f: Frame, nodes: WhyNodes) {
  /* Nothing of it exists before the stage, and nothing of it is left in
     front of the camera once that is through the glass. One last pass as it
     goes, to put everything away; after that this costs a comparison. */
  const staged = r.info > 0 && r.info < 1 && r.infoWidth > 0;
  const active = r.camZ - r.push > 0 && (staged || r.why1 > 0 || r.why2 > 0 || r.why3 > 0);
  if (!active && !nodes.active) return;
  nodes.active = active;

  const { camera, size } = state;
  const { width, height } = size;
  const layout = f.why;

  /* direct() has just moved the camera; its world matrix only updates at
     render time, so bring it up to date or the stage trails by a frame. */
  camera.updateMatrixWorld();

  /* The words lie on the glass: centred on their point there, as wide as
     suits the glass — so they grow as the camera approaches and sway with
     the pointer's orbit, exactly as the glass does — but never too small to
     read, nor wider than the screen. That point is the middle of the glass
     wherever the frame has room for the cards beside them (a little above
     it on a phone, where the cards take their turns under them); where it
     has not, they start above the cards and settle there as the cards leave
     (rig.settle; scene/why.ts). For as long as they are there (rig.info). */
  const head = nodes.head;
  if (head) {
    if (staged) {
      const onGlassY = THREE.MathUtils.lerp(layout.headY, layout.restY, r.settle);
      headPoint.set(0, onGlassY, 0).project(camera);
      headAbove.set(0, onGlassY + 0.5, 0).project(camera);
      headBelow.set(0, onGlassY - 0.5, 0).project(camera);

      const x = ((headPoint.x + 1) / 2) * width;
      const y = ((1 - headPoint.y) / 2) * height;
      const pixelsPerUnit = ((headAbove.y - headBelow.y) / 2) * height;
      const scale = wordsScale(layout.wordsAcross, pixelsPerUnit, layout.wordsFloor, width, r.infoWidth);

      /* Centred on itself first, then scaled about that centre: the element
         is laid out from its corner (.whyAnchor). */
      head.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(4)}) translate(-50%, -50%)`;
    }
    if (staged !== nodes.headShown) {
      nodes.headShown = staged;
      head.style.visibility = staged ? 'visible' : '';
    }
  }

  /* The cards stand in front of the glass, each a pane with its own place
     (scene/why.ts). Nothing but the camera moves them: its approach spreads
     them, carries the nearest out of the frame, and passes each in turn —
     at which point there is no pane to draw. */
  nodes.cards.forEach((card, index) => {
    const drawn = nodes.drawn[index];
    const e = cardProgress(layout, index, r[WHY_KEYS[Math.min(index, WHY_KEYS.length - 1)]], r.info);

    let shown = active && e > 0 && layout.unit > 0;
    let fade = 1;
    if (shown) {
      const place = layout.cards[Math.min(index, layout.cards.length - 1)];
      const nearest = cardMatrix(pane, camera, width, height, place, layout.unit, r.cardWidth, r.cardHeight);
      shown = isDrawable(nearest);
      if (shown) {
        card.style.transform = toMatrix3d(pane);
        fade = nearFade(pane.elements[15], f.fit, layout.fade);
      }
    }

    if (shown !== drawn.shown) {
      drawn.shown = shown;
      card.style.visibility = shown ? 'visible' : '';
    }
    if (!shown || (e === drawn.e && fade === drawn.fade)) return;
    drawn.e = e;
    drawn.fade = fade;

    /* Its emergence: one number in, and everything the page draws it with
       out (.whyBody in hero.module.css). */
    whyPhase(e, phase);
    card.style.setProperty('--within', phase.within.toFixed(4));
    card.style.setProperty('--shown', (phase.shown * fade).toFixed(4));
    card.style.setProperty('--glow', phase.glow.toFixed(4));
    nodes.warps[index]?.setAttribute('scale', (phase.within * WARP).toFixed(2));

    const liquid = e < 1;
    if (liquid !== drawn.liquid) {
      drawn.liquid = liquid;
      card.toggleAttribute('data-liquid', liquid);
    }
  });
}

/*
 * Draws the frame. Normally that is one plain render. During the crossing
 * the scene goes to a reduced-size target first and comes back through the
 * liquid shader — the only time the scene costs a second pass.
 *
 * And, once, it warms the scene up (see warm, below).
 */
function LiquidPass({ rig, frame, scale }: { rig: RefObject<Rig>; frame: RefObject<Frame>; scale: number }) {
  const gl = useThree((state) => state.gl);
  const pass = useRef<Liquid | null>(null);
  const drawn = useRef(0);

  useEffect(() => {
    const liquid = createLiquid(canRenderFields(gl));
    pass.current = liquid;
    drawn.current = 0;
    return () => {
      pass.current = null;
      disposeLiquid(liquid);
    };
  }, [gl]);

  useFrame((state) => {
    const liquid = pass.current;
    draw(state, rig.current, frame.current, liquid, scale);

    /* The opening is on the glass: time to get the rest ready behind it. */
    if (!liquid || drawn.current >= READY_AFTER) return;
    drawn.current += 1;
    if (drawn.current === READY_AFTER) void warm(state, liquid, scale, () => pass.current === liquid);
  }, 1);

  return null;
}

type Liquid = {
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  target: THREE.WebGLRenderTarget;
  /** The slow part of the flow, drawn small (see the full-screen passes in
      shaders.ts) — or none, where the renderer cannot. */
  flow: Field | null;
};

function createLiquid(fields: boolean): Liquid {
  const uniforms = {
    uScene: { value: null },
    uFlow: { value: null },
    uDistortion: { value: 0 },
    uCrossing: { value: 0 },
    uTime: { value: 0 },
    uAspect: { value: 1 },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader: SCREEN_VERTEX,
    fragmentShader: LIQUID_FRAGMENT,
    uniforms,
    defines: fields ? { FLOW_TEXTURE: '' } : {},
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(fullscreenTriangle(), material);
  mesh.frustumCulled = false;
  const scene = new THREE.Scene();
  scene.add(mesh);

  return {
    material,
    mesh,
    scene,
    camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    target: new THREE.WebGLRenderTarget(2, 2, { depthBuffer: true, stencilBuffer: false }),
    flow: fields
      ? createField(
          new THREE.ShaderMaterial({
            vertexShader: SCREEN_VERTEX,
            fragmentShader: FLOW_FRAGMENT,
            /* The same two objects the liquid reads, so one write moves both. */
            uniforms: { uTime: uniforms.uTime, uAspect: uniforms.uAspect },
            depthTest: false,
            depthWrite: false,
          }),
        )
      : null,
  };
}

function disposeLiquid(liquid: Liquid) {
  liquid.target.dispose();
  liquid.material.dispose();
  liquid.mesh.geometry.dispose();
  if (liquid.flow) disposeField(liquid.flow);
}

/** Sizes the liquid's target for the canvas as it is now. */
function fit(liquid: Liquid, { size, viewport }: RootState, scale: number) {
  const width = Math.max(2, Math.round(size.width * viewport.dpr * scale));
  const height = Math.max(2, Math.round(size.height * viewport.dpr * scale));
  if (liquid.target.width !== width || liquid.target.height !== height) liquid.target.setSize(width, height);
}

function draw(state: RootState, r: Rig, f: Frame, liquid: Liquid | null, scale: number) {
  const { gl, scene, camera, size } = state;

  if (!liquid || r.distortion < 0.002) {
    gl.setRenderTarget(null);
    gl.render(scene, camera);
    return;
  }

  const u = liquid.material.uniforms;
  u.uDistortion.value = r.distortion;
  u.uCrossing.value = r.crossing;
  u.uTime.value = f.time;
  u.uAspect.value = size.width / Math.max(size.height, 1);

  if (liquid.flow) {
    u.uFlow.value = liquid.flow.target.texture;
    drawField(gl, liquid.flow);
  }

  fit(liquid, state, scale);
  gl.setRenderTarget(liquid.target);
  gl.render(scene, camera);
  gl.setRenderTarget(null);

  u.uScene.value = liquid.target.texture;
  gl.render(liquid.scene, liquid.camera);
}

/*
 * The warm-up. three compiles a material's program the first time something
 * wearing it is drawn, and waits while it does: left to that, the globe, the
 * network, the portal's glass, the ripples, the far side and the liquid each
 * stall a frame — tens of milliseconds apiece, on any GPU — at the very
 * moment they first appear, which is the visitor's first scroll through the
 * journey. So once the opening is on the glass they are all compiled
 * together, off the main thread where the browser can (compileAsync), and
 * then drawn once into the liquid's own target, which also gives that its
 * size before the crossing needs it.
 *
 * A visitor who scrolls before this has finished gets what they would have
 * had without it; nobody gets worse.
 */
type FirstUse = { getUniforms(): unknown; getAttributes(): unknown };

async function warm(state: RootState, liquid: Liquid, scale: number, alive: () => boolean) {
  const { gl, scene, camera } = state;

  try {
    await Promise.all([
      gl.compileAsync(scene, camera),
      gl.compileAsync(liquid.scene, liquid.camera),
      liquid.flow ? gl.compileAsync(liquid.flow.scene, liquid.flow.camera) : null,
    ]);
  } catch {
    return;
  }
  if (!alive()) return;

  /* What three leaves for a program's first use — reading back where its
     uniforms and attributes are — done for all of them now, before any is
     drawn with: each read waits for whatever the GPU has been given, and
     after a first draw that is a wait worth not having on this thread. */
  for (const root of [scene, liquid.scene, liquid.flow?.scene]) {
    root?.traverse((object) => {
      const material = (object as THREE.Mesh).material;
      if (!material || Array.isArray(material)) return;
      const { currentProgram } = gl.properties.get(material) as { currentProgram?: FirstUse };
      currentProgram?.getUniforms();
      currentProgram?.getAttributes();
    });
  }

  /* Everything, shown or not and wherever it stands, for one draw. */
  const hidden: THREE.Object3D[] = [];
  const culled: THREE.Object3D[] = [];
  scene.traverse((object) => {
    if (!object.visible) {
      hidden.push(object);
      object.visible = true;
    }
    if (object.frustumCulled) {
      culled.push(object);
      object.frustumCulled = false;
    }
  });

  fit(liquid, state.get(), scale);
  gl.setRenderTarget(liquid.target);
  gl.render(scene, camera);

  for (const object of hidden) object.visible = false;
  for (const object of culled) object.frustumCulled = true;

  /* And the liquid over it — anywhere but the screen. */
  const u = liquid.material.uniforms;
  if (liquid.flow) {
    u.uFlow.value = liquid.flow.target.texture;
    drawField(gl, liquid.flow);
  }
  u.uScene.value = liquid.target.texture;
  const scratch = new THREE.WebGLRenderTarget(2, 2, { depthBuffer: false, stencilBuffer: false });
  gl.setRenderTarget(scratch);
  gl.render(liquid.scene, liquid.camera);
  gl.setRenderTarget(null);
  scratch.dispose();
}
