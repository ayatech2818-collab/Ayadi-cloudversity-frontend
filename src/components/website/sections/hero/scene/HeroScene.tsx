'use client';

import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import gsap from 'gsap';
import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';

import type { Quality, Rig } from '../rig';
import { Backdrop, FarSide, Motes } from './Environment';
import { createFrame, type Frame } from './frame';
import { fullscreenTriangle, PORTAL_HALF } from './geometry';
import { GlobePortal } from './GlobePortal';
import { Mark } from './Mark';
import { LIQUID_FRAGMENT, SCREEN_VERTEX } from './shaders';

export type HeroSceneProps = {
  rig: RefObject<Rig>;
  quality: Quality;
  /** Called once, after the first frame is on screen. */
  onReady: () => void;
  /** The Why Choose Ayadi panel, kept on the portal's glass by the Director. */
  overlay: RefObject<HTMLDivElement | null>;
};

/*
 * The hero's single WebGL canvas. Loaded lazily (next/dynamic, no SSR) by
 * AyadiHero; everything in it reads the rig and nothing in it is React state.
 */
export default function HeroScene({ rig, quality, onReady, overlay }: HeroSceneProps) {
  const frame = useRef<Frame>(createFrame());

  return (
    <Canvas
      frameloop="never"
      flat
      dpr={quality.dpr}
      gl={{ antialias: quality.antialias, alpha: false, stencil: false, powerPreference: 'high-performance' }}
      camera={{ fov: 40, near: 0.05, far: 90, position: [0, 0, 7] }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
    >
      {/* The Director must stay first: its useFrame sets the camera and the
          shared frame values that every other part reads. */}
      <Director rig={rig} frame={frame} onReady={onReady} overlay={overlay} />
      <Backdrop rig={rig} frame={frame} />
      <Motes rig={rig} frame={frame} count={quality.particles} />
      <Mark rig={rig} frame={frame} />
      <GlobePortal rig={rig} frame={frame} quality={quality} />
      <FarSide rig={rig} frame={frame} />
      <LiquidPass rig={rig} frame={frame} scale={quality.liquidScale} />
    </Canvas>
  );
}

const target = new THREE.Vector3();
const offset = new THREE.Vector3();
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

/** Frame spacing: full rate while something moves, half rate at rest. */
const BUSY_GAP = 1 / 64;
const IDLE_GAP = 1 / 32;
/** How long after the last scroll or pointer move the scene still counts as busy. */
const BUSY_FOR_MS = 700;

function Director({
  rig,
  frame,
  onReady,
  overlay,
}: {
  rig: RefObject<Rig>;
  frame: RefObject<Frame>;
  onReady: () => void;
  overlay: RefObject<HTMLDivElement | null>;
}) {
  const advance = useThree((state) => state.advance);
  const get = useThree((state) => state.get);
  const setDpr = useThree((state) => state.setDpr);

  /*
   * The clock. The canvas never renders on its own (frameloop="never").
   * GSAP's ticker — the one ScrollTrigger scrubs on — calls advance() right
   * after the timeline has moved the rig, so the 3D and the HTML over it
   * always show the same moment. Off screen it renders nothing; at rest it
   * drops to half rate for the idle motion; and if frames stay slow while
   * the visitor is scrolling, it steps the pixel ratio down.
   */
  useEffect(() => {
    let last = -1;
    let wasBusy = false;
    let slowFrames = 0;
    let announced = false;

    const tick = (time: number) => {
      const r = rig.current;
      if (!r.live) {
        last = -1;
        return;
      }

      const busy = performance.now() - r.activeAt < BUSY_FOR_MS;
      if (last >= 0 && time - last < (busy ? BUSY_GAP : IDLE_GAP)) return;

      if (busy && wasBusy && last >= 0) {
        slowFrames = time - last > 1 / 40 ? slowFrames + 1 : Math.max(0, slowFrames - 2);
        if (slowFrames > 45) {
          slowFrames = 0;
          const dpr = get().viewport.dpr;
          if (dpr > 1) setDpr(Math.max(1, dpr - 0.25));
        }
      }

      wasBusy = busy;
      last = time;
      advance(time);

      if (!announced) {
        announced = true;
        onReady();
      }
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [advance, get, onReady, rig, setDpr]);

  useFrame((state, delta) => {
    direct(state, delta, rig.current, frame.current);
    placeInfo(state, rig.current, overlay.current);
  });

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
     story, eases off while the mark sits in its slot, and lets go entirely
     during the liquid pass. */
  const hold = (1 - r.distortion) * (1 - 0.75 * r.dock);
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

const glassCentre = new THREE.Vector3();
const glassTop = new THREE.Vector3();
const glassBottom = new THREE.Vector3();

/*
 * Keeps the Why Choose Ayadi panel on the portal's glass: centred on where
 * the glass is on screen this frame, and scaled to it — so it grows as the
 * camera approaches and sways with the pointer's orbit, exactly as the glass
 * does. The panel fits inside the glass (never below 85%, so the text stays
 * readable); only where the glass is far too small to read from — a phone —
 * is it sized to the screen instead, growing a little through the stage. A
 * compositor-only transform, written only while the stage runs.
 */
function placeInfo(state: RootState, r: Rig, panel: HTMLDivElement | null) {
  if (!panel || r.info <= 0 || r.info >= 1 || r.infoWidth <= 0 || r.infoHeight <= 0) return;

  const { camera, size } = state;
  const { width, height } = size;

  /* direct() has just moved the camera; its world matrix only updates at
     render time, so bring it up to date or the panel trails by a frame. */
  camera.updateMatrixWorld();
  glassCentre.set(0, 0, 0).project(camera);
  glassTop.set(0, 0.5, 0).project(camera);
  glassBottom.set(0, -0.5, 0).project(camera);

  const x = ((glassCentre.x + 1) / 2) * width;
  const y = ((1 - glassCentre.y) / 2) * height;
  const pixelsPerUnit = ((glassTop.y - glassBottom.y) / 2) * height;

  /* Room on screen: the width, and the height clear of the navbar. */
  const screenFit = Math.min((0.94 * width) / r.infoWidth, (height - 140) / r.infoHeight);

  const glassWidth = PORTAL_HALF[0] * 2 * pixelsPerUnit;
  const glassHeight = PORTAL_HALF[1] * 2 * pixelsPerUnit;
  const glassFit = 0.84 * Math.min(glassWidth / r.infoWidth, glassHeight / r.infoHeight);

  const scale =
    glassFit >= 0.6
      ? Math.min(Math.max(glassFit, 0.85), screenFit)
      : /* A phone: the glass is too small to read from. */
        screenFit * (0.95 + 0.07 * r.info);

  panel.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${scale.toFixed(4)})`;
}

/*
 * Draws the frame. Normally that is one plain render. During the crossing
 * the scene goes to a reduced-size target first and comes back through the
 * liquid shader — the only time the scene costs a second pass.
 */
function LiquidPass({ rig, frame, scale }: { rig: RefObject<Rig>; frame: RefObject<Frame>; scale: number }) {
  const pass = useRef<Liquid | null>(null);

  useEffect(() => {
    const liquid = createLiquid();
    pass.current = liquid;
    return () => {
      pass.current = null;
      disposeLiquid(liquid);
    };
  }, []);

  useFrame((state) => draw(state, rig.current, frame.current, pass.current, scale), 1);

  return null;
}

type Liquid = {
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  target: THREE.WebGLRenderTarget;
};

function createLiquid(): Liquid {
  const material = new THREE.ShaderMaterial({
    vertexShader: SCREEN_VERTEX,
    fragmentShader: LIQUID_FRAGMENT,
    uniforms: {
      uScene: { value: null },
      uDistortion: { value: 0 },
      uCrossing: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: 1 },
    },
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
  };
}

function disposeLiquid(liquid: Liquid) {
  liquid.target.dispose();
  liquid.material.dispose();
  liquid.mesh.geometry.dispose();
}

function draw(state: RootState, r: Rig, f: Frame, liquid: Liquid | null, scale: number) {
  const { gl, scene, camera, size, viewport } = state;

  if (!liquid || r.distortion < 0.002) {
    gl.setRenderTarget(null);
    gl.render(scene, camera);
    return;
  }

  const width = Math.max(2, Math.round(size.width * viewport.dpr * scale));
  const height = Math.max(2, Math.round(size.height * viewport.dpr * scale));
  if (liquid.target.width !== width || liquid.target.height !== height) liquid.target.setSize(width, height);

  gl.setRenderTarget(liquid.target);
  gl.render(scene, camera);
  gl.setRenderTarget(null);

  const u = liquid.material.uniforms;
  u.uScene.value = liquid.target.texture;
  u.uDistortion.value = r.distortion;
  u.uCrossing.value = r.crossing;
  u.uTime.value = f.time;
  u.uAspect.value = size.width / Math.max(size.height, 1);
  gl.render(liquid.scene, liquid.camera);
}
