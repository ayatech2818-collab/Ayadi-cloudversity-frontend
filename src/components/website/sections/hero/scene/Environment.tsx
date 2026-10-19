'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';

import type { Rig, WatermarkSpec } from '../rig';
import { AYADI_BOX, AYADI_PATH } from '../wordmark';
import type { Frame } from './frame';
import { buildParticles, canRenderFields, createField, disposeField, drawField, fullscreenTriangle } from './geometry';
import {
  BACKDROP_FRAGMENT,
  FLOOR_FRAGMENT,
  FLOOR_VERTEX,
  PARTICLES_FRAGMENT,
  PARTICLES_VERTEX,
  SCREEN_VERTEX,
  SKY_FRAGMENT,
  SPRITE_FRAGMENT,
  SPRITE_VERTEX,
} from './shaders';

type Props = { rig: RefObject<Rig>; frame: RefObject<Frame> };

/** Tells BACKDROP_FRAGMENT its skies come from the small target. */
const SKY_TEXTURE = { SKY_TEXTURE: '' };

/* The sky behind everything: page-light, then deep space, then the far side. */
export function Backdrop({ rig, frame }: Props) {
  const gl = useThree((state) => state.gl);
  const watermark = useRef<WatermarkLayer | null>(null);
  useEffect(() => {
    const layer: WatermarkLayer = { texture: null, drawn: -1, pending: false, shownAt: -1, alive: true };
    watermark.current = layer;
    return () => {
      watermark.current = null;
      layer.alive = false;
      layer.texture?.dispose();
    };
  }, []);

  const geometry = useMemo(() => fullscreenTriangle(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uDark: { value: 0 },
      uWorld: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uGlow: { value: new THREE.Vector2() },
      uPointer: { value: new THREE.Vector2() },
      uSky: { value: null },
      uWatermark: { value: null },
      uWatermarkRect: { value: new THREE.Vector4(0, 0, 1, 1) },
      uWatermarkAlpha: { value: 0 },
      uWake: { value: 0 },
    }),
    [],
  );
  const material = useRef<THREE.ShaderMaterial>(null);

  /* The skies, drawn small each frame and stretched over the screen (see the
     full-screen passes in shaders.ts). Where the renderer cannot draw into
     such a target there is none, and the backdrop works its skies out per
     pixel as it always did.

     Their pass has uniforms of its own, written alongside the backdrop's
     each frame (setSkies). It cannot share the object above: a material made
     in JSX is given its own copy of the uniforms it is handed, so nothing
     written to the backdrop's would ever reach a second material built from
     that object — it would go on drawing the first frame's sky. */
  const skyUniforms = useMemo(
    () => ({
      uDark: { value: 0 },
      uWorld: { value: 0 },
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uGlow: { value: new THREE.Vector2() },
      uPointer: { value: new THREE.Vector2() },
      uWake: { value: 0 },
    }),
    [],
  );
  const sky = useMemo(
    () =>
      canRenderFields(gl)
        ? createField(
            new THREE.ShaderMaterial({
              vertexShader: SCREEN_VERTEX,
              fragmentShader: SKY_FRAGMENT,
              uniforms: skyUniforms,
              depthTest: false,
              depthWrite: false,
            }),
          )
        : null,
    [gl, skyUniforms],
  );
  useEffect(
    () => () => {
      if (sky) disposeField(sky);
    },
    [sky],
  );

  useFrame((state) => {
    const shader = material.current;
    if (!shader) return;
    const r = rig.current;
    const f = frame.current;
    const u = shader.uniforms;
    setSkies(u, r, f);

    const layer = watermark.current;
    if (layer) updateWatermark(layer, r, f.time, u, state.size, state.viewport.dpr);

    if (sky) {
      setSkies(skyUniforms, r, f);
      u.uSky.value = sky.target.texture;
      drawField(state.gl, sky);
    }
  });

  return (
    <mesh geometry={geometry} frustumCulled={false} renderOrder={-1000}>
      <shaderMaterial
        key={sky ? 'field' : 'pixel'}
        ref={material}
        uniforms={uniforms}
        defines={sky ? SKY_TEXTURE : undefined}
        vertexShader={SCREEN_VERTEX}
        fragmentShader={BACKDROP_FRAGMENT}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

/** What the three skies are worked out from (SKIES in shaders.ts). */
function setSkies(u: Record<string, THREE.IUniform>, r: Rig, f: Frame) {
  u.uDark.value = r.dark;
  u.uWorld.value = r.world;
  u.uTime.value = f.time;
  u.uAspect.value = f.aspect;
  /* The opening's wash sits wherever the mark is on screen. */
  (u.uGlow.value as THREE.Vector2).set(f.shiftX, f.shiftY);
  (u.uPointer.value as THREE.Vector2).set(f.px, -f.py);
  u.uWake.value = r.wake;
}

/* ---------- the opening's AYADI watermark ----------
   The page lays it out (.watermark in hero.module.css) and AyadiHero measures
   it into the rig; here the official AYADI letterforms (wordmark.ts — the
   same path the page draws) are rasterised into that box, then placed on it
   (stage pixels, as the canvas is) every frame, fading as the logo comes
   free. */

type WatermarkLayer = {
  texture: THREE.CanvasTexture | null;
  /** The rig's watermark version the texture was drawn from. */
  drawn: number;
  pending: boolean;
  /** Scene time the first texture arrived — it fades in from there. */
  shownAt: number;
  alive: boolean;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function updateWatermark(
  layer: WatermarkLayer,
  r: Rig,
  time: number,
  u: Record<string, THREE.IUniform>,
  size: { width: number; height: number },
  dpr: number,
) {
  const spec = r.watermark;

  /* Redraw after every re-measure (resize, reflow) while it can be seen. */
  if (!layer.pending && layer.drawn !== spec.version && spec.width > 0 && r.dock > 0.3) {
    const version = spec.version;
    layer.pending = true;
    void drawWatermark(spec, dpr).then((texture) => {
      layer.pending = false;
      if (!layer.alive) {
        texture?.dispose();
        return;
      }
      layer.drawn = version;
      if (!texture) return;
      layer.texture?.dispose();
      layer.texture = texture;
      u.uWatermark.value = texture;
    });
  }

  if (!layer.texture) {
    u.uWatermarkAlpha.value = 0;
    return;
  }
  if (layer.shownAt < 0) layer.shownAt = time;

  const width = Math.max(size.width, 1);
  const height = Math.max(size.height, 1);
  const centreX = spec.left + spec.width / 2;
  const centreY = spec.top + spec.height / 2;
  (u.uWatermarkRect.value as THREE.Vector4).set(
    (centreX / width) * 2 - 1,
    1 - (centreY / height) * 2,
    spec.width / width,
    spec.height / height,
  );

  const appear = Math.min(1, (time - layer.shownAt) / 0.8);
  u.uWatermarkAlpha.value = appear * smoothstep(0.35, 1, r.dock);
}

/* White ink on transparent: the official letterforms, stretched to the
   element's box exactly as the page's SVG is (its viewBox is AYADI_BOX).
   Only the alpha is used — the shader tints it. */
async function drawWatermark(spec: WatermarkSpec, dpr: number) {
  const scale = Math.min(Math.max(dpr, 1), 2048 / spec.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(spec.width * scale);
  canvas.height = Math.ceil(spec.height * scale);
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.filter = `blur(${scale}px)`;
  context.scale((spec.width * scale) / AYADI_BOX[2], (spec.height * scale) / AYADI_BOX[3]);
  context.fillStyle = '#fff';
  context.fill(new Path2D(AYADI_PATH), 'evenodd');

  return new THREE.CanvasTexture(canvas);
}

/* A few hundred soft points along the whole camera path, in one draw call. */
export function Motes({ rig, frame, count }: Props & { count: number }) {
  const geometry = useMemo(() => buildParticles(count), [count]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 3 },
      uPixelRatio: { value: 1 },
      uNight: { value: 0 },
      uWake: { value: 0 },
    }),
    [],
  );
  const material = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const shader = material.current;
    if (!shader) return;
    const r = rig.current;
    const u = shader.uniforms;
    u.uTime.value = frame.current.time;
    u.uPixelRatio.value = state.viewport.dpr;
    u.uNight.value = r.dark * (1 - r.world);
    u.uWake.value = r.wake;
  });

  return (
    <points geometry={geometry} frustumCulled={false} renderOrder={3}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={PARTICLES_VERTEX}
        fragmentShader={PARTICLES_FRAGMENT}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

/* Cloudversity's emerald-to-teal. */
const WORLD_GLOW: [number, number, number] = [0.063, 0.725, 0.56];

/*
 * The far side of the portal, on the way into the light: a pale floor with a
 * fine grid running to the horizon, and a soft pool of Cloudversity's light
 * in the middle of the view. Placed relative to the camera, so it stays
 * centred at any aspect.
 */
export function FarSide({ rig }: Props) {
  const floorUniforms = useMemo(() => ({ uArrive: { value: 0 } }), []);
  const glowUniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Vector3(...WORLD_GLOW) },
      uStrength: { value: 0 },
    }),
    [],
  );

  const group = useRef<THREE.Group>(null);
  const floor = useRef<THREE.ShaderMaterial>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const holder = group.current;
    const floorShader = floor.current;
    if (!holder || !floorShader) return;
    const r = rig.current;

    holder.visible = r.arrive > 0.002;
    if (!holder.visible) return;
    floorShader.uniforms.uArrive.value = r.arrive;

    const camera = state.camera as THREE.PerspectiveCamera;
    const depth = 11;
    const halfHeight = depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const pool = glow.current;
    if (!pool) return;
    pool.position.set(0, 0.15, camera.position.z - depth);
    pool.quaternion.copy(camera.quaternion);
    pool.scale.setScalar(halfHeight * 1.5);
    (pool.material as THREE.ShaderMaterial).uniforms.uStrength.value = r.arrive * 0.5;
  });

  return (
    <group ref={group} visible={false}>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.7, -26]} renderOrder={1}>
        <planeGeometry args={[70, 50]} />
        <shaderMaterial
          ref={floor}
          uniforms={floorUniforms}
          vertexShader={FLOOR_VERTEX}
          fragmentShader={FLOOR_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </mesh>

      <mesh ref={glow} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          uniforms={glowUniforms}
          vertexShader={SPRITE_VERTEX}
          fragmentShader={SPRITE_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
