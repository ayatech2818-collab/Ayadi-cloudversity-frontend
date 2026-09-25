'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';

import type { Rig } from '../rig';
import type { Frame } from './frame';
import { buildMarkGeometry, buildWordmarkGeometry, LOCKUP } from './geometry';
import { LOGO_FRAGMENT, LOGO_VERTEX, WORDMARK_FRAGMENT, WORDMARK_VERTEX } from './shaders';

/*
 * The official Ayadi Cloudversity logo, in 3D — the mark, AYADI and
 * CLOUDVERSITY, each extruded from the brand's own artwork.
 *
 * It opens docked in the logo slot above the headline — the Director shifts
 * the lens so the whole lockup lands exactly there. Then, as it comes free,
 * it holds its place while the wordmark gathers into the mark (the letters
 * farthest from it going first), and only then does the mark fly: out to
 * the centre, turning to show its depth, and on into the globe as its
 * glowing core — exactly as it always has, because from there on it is the
 * same mark.
 *
 * Three transform owners: the holder carries the story (position, scale),
 * the turn group the rotation (story spin + idle sway + pointer), and the
 * mark mesh its own offset — where the artwork puts it in the lockup,
 * sliding to the centre as the lockup opens.
 */

/* How far along its undocking the wordmark starts and finishes gathering.
   `dock` is 1 in the slot and 0 once the mark is free. */
const GATHER_FROM = 0.97;
const GATHER_TO = 0.5;

/* The lockup's greatest distance from the mark — how far the gathering
   front has to travel. */
const REACH = Math.max(
  ...[
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].map(([sx, sy]) => Math.hypot((sx * LOCKUP.width) / 2 - LOCKUP.mark[0], (sy * LOCKUP.height) / 2 - LOCKUP.mark[1])),
);

/* The gathering front's soft edge — WORDMARK_FRAGMENT's SOFT. */
const SOFT = 0.9;

/* The stretch of the gather over which the front crosses a word, as
   [gather when it starts to go, gather when it is gone]. */
function crossing(geometry: THREE.BufferGeometry) {
  const position = geometry.getAttribute('position');
  let near = Infinity;
  let far = 0;
  for (let i = 0; i < position.count; i++) {
    const d = Math.hypot(position.getX(i) - LOCKUP.mark[0], position.getY(i) - LOCKUP.mark[1]);
    near = Math.min(near, d);
    far = Math.max(far, d);
  }
  return [(far + SOFT) / (REACH + SOFT), near / (REACH + SOFT)] as const;
}

export function Mark({ rig, frame }: { rig: RefObject<Rig>; frame: RefObject<Frame> }) {
  const geometry = useMemo(() => buildMarkGeometry({ trueOutline: true }), []);
  const words = useMemo(() => buildWordmarkGeometry(), []);
  useEffect(
    () => () => {
      geometry.dispose();
      words.ayadi.dispose();
      words.cloudversity.dispose();
    },
    [geometry, words],
  );

  const uniforms = useMemo(
    () => ({
      uKey: { value: new THREE.Vector3(-0.4, 0.55, 0.75) },
      uGlow: { value: 0 },
      uFade: { value: 1 },
      uDark: { value: 0 },
    }),
    [],
  );

  const wordUniforms = useMemo(
    () => ({
      uKey: { value: new THREE.Vector3(-0.4, 0.55, 0.75) },
      uFade: { value: 1 },
      uWord: { value: 1 },
      uCentre: { value: new THREE.Vector2(LOCKUP.mark[0], LOCKUP.mark[1]) },
      uReach: { value: REACH },
    }),
    [],
  );

  /* CLOUDVERSITY fades out over the stretch in which the front crosses AYADI. */
  const ayadiCrossing = useMemo(() => crossing(words.ayadi), [words]);

  const holder = useRef<THREE.Group>(null);
  const turn = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const wordmark = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const wordMaterial = useRef<THREE.ShaderMaterial>(null);
  const cloudMaterial = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const r = rig.current;
    const f = frame.current;
    const group = holder.current;
    const turning = turn.current;
    const mesh = body.current;
    const letters = wordmark.current;
    const shader = material.current;
    const wordShader = wordMaterial.current;
    const cloudShader = cloudMaterial.current;
    if (!group || !turning || !mesh || !letters || !shader || !wordShader || !cloudShader) return;

    group.visible = r.logoFade > 0.002;
    if (!group.visible) return;

    /* 1 while the whole lockup is showing, 0 once only the mark is left. */
    const gather = THREE.MathUtils.smoothstep(r.dock, GATHER_TO, GATHER_FROM);
    /* How docked the lockup still looks: it keeps its size and layout while
       the wordmark gathers, and opens out after — so the letters never
       balloon on their way out. */
    const hold = THREE.MathUtils.lerp(r.dock, 1, gather);

    /* Docked, the lockup is sized to fill the slot from wherever the camera is. */
    const camera = state.camera as THREE.PerspectiveCamera;
    const distance = Math.max(0.5, camera.position.z - r.logoZ);
    const docked =
      (f.slotFrac * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2) / LOCKUP.height;
    group.scale.setScalar(THREE.MathUtils.lerp(r.logoScale, docked, hold));

    const idle = 1 - r.morph;
    group.position.set(0, Math.sin(f.time * 0.8) * 0.035 * idle, r.logoZ);

    /* The mark sits where the artwork has it, and slides to the centre as
       the lockup opens. */
    mesh.position.set(LOCKUP.mark[0] * hold, LOCKUP.mark[1] * hold, 0);

    /* A wide lockup turns further at its edges than the mark alone ever
       did; while it is whole, the story's turn and the pointer are eased so
       it still reads as the logo first. */
    const steady = 1 - 0.35 * gather;
    turning.rotation.y = (r.logoSpin + f.px * 0.22 * idle) * steady + Math.sin(f.time * 0.45) * 0.07 * idle;
    turning.rotation.x = r.logoTilt + Math.sin(f.time * 0.6 + 1.3) * 0.03 * idle + f.py * 0.14 * idle * steady;

    const u = shader.uniforms;
    u.uKey.value.set(-0.4 + f.px * 0.25, 0.55 - f.py * 0.2, 0.75);
    u.uGlow.value = r.logoGlow;
    u.uFade.value = r.logoFade;
    u.uDark.value = r.dark;

    letters.visible = gather > 0.001;
    if (!letters.visible) return;
    const w = wordShader.uniforms;
    (w.uKey.value as THREE.Vector3).copy(u.uKey.value as THREE.Vector3);
    w.uWord.value = gather;
    w.uFade.value = r.logoFade;

    /* CLOUDVERSITY fades as a whole, steadily from full to nothing while the
       front crosses AYADI, so the two go together. Its uWord stays 1: the
       front never cuts it. */
    const c = cloudShader.uniforms;
    (c.uKey.value as THREE.Vector3).copy(u.uKey.value as THREE.Vector3);
    const [whole, gone] = ayadiCrossing;
    c.uFade.value = r.logoFade * THREE.MathUtils.clamp(THREE.MathUtils.inverseLerp(gone, whole, gather), 0, 1);
  });

  return (
    <group ref={holder}>
      <group ref={turn}>
        <mesh ref={body} geometry={geometry} renderOrder={5}>
          <shaderMaterial
            ref={material}
            uniforms={uniforms}
            vertexShader={LOGO_VERTEX}
            fragmentShader={LOGO_FRAGMENT}
            transparent
          />
        </mesh>

        {/* Each material gets its own copy of wordUniforms (R3F copies every
            uniform in), so each is written on its own every frame. */}
        <group ref={wordmark}>
          <mesh geometry={words.ayadi} renderOrder={6}>
            <shaderMaterial
              ref={wordMaterial}
              uniforms={wordUniforms}
              vertexShader={WORDMARK_VERTEX}
              fragmentShader={WORDMARK_FRAGMENT}
              transparent
            />
          </mesh>
          <mesh geometry={words.cloudversity} renderOrder={6}>
            <shaderMaterial
              ref={cloudMaterial}
              uniforms={wordUniforms}
              vertexShader={WORDMARK_VERTEX}
              fragmentShader={WORDMARK_FRAGMENT}
              transparent
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
