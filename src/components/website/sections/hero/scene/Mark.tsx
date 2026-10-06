'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';

import type { Rig } from '../rig';
import type { Frame } from './frame';
import { buildMarkGeometry, buildWordmarkGeometry, GLOBE_R, LOCKUP } from './geometry';
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
 *
 * Before any of that it takes over from the fallback image the page shows
 * while the scene loads. Until the scene has woken (rig.wake, 0 → 1) the
 * lockup is drawn as that image: square-on, still and unlit, in the
 * artwork's two flat colours. Its resting turn, the idle drift, the pointer
 * and the light all come in with the wake; at 1 nothing here is changed.
 *
 * And once it is the globe's core it gives the name back (rig.rebuild,
 * 0 → 1). The same mark moves out to its place in the lockup — sized now to
 * sit inside the globe — and the same words build back out from it: first
 * as green structure running ahead, then filled in behind, in the pale ink
 * the dark needs. AYADI from the mark, then CLOUDVERSITY from its own
 * middle. It is the gather run the other way, on its own value, so neither
 * touches the other: at rebuild 0 nothing here is changed either.
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

/* ---------- the rebuild ----------
   Where each part of it falls in rig.rebuild, as [from, to]. The mark
   settles into its place in the lockup; a front of structure runs out from
   it across AYADI, and the fill follows a little behind; then the same for
   CLOUDVERSITY, once AYADI is mostly there. */
const SETTLE = [0, 0.42] as const;
const AYADI_TRACE = [0.08, 0.5] as const;
const AYADI_FILL = [0.2, 0.68] as const;
const CLOUD_TRACE = [0.52, 0.84] as const;
const CLOUD_FILL = [0.64, 1] as const;

/** The rebuilt lockup's size, on logoScale's terms: two-thirds of the way
    across the globe, so the whole name sits well inside it. */
const REBUILT_SCALE = (GLOBE_R * 2 * 0.68) / LOCKUP.width;

/* The rebuilt words clear before the mark does as the logo leaves through
   the portal — gone by this much of logoFade, which is before the Why stage
   takes the glass. */
const WORDS_GONE_BY = 0.35;

/** How far through one of those stretches `x` is. */
function along(x: number, [from, to]: readonly [number, number]) {
  return THREE.MathUtils.clamp((x - from) / (to - from), 0, 1);
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
      uWake: { value: 0 },
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
      uWake: { value: 0 },
      uTrace: { value: 0 },
      uHatch: { value: 1 },
      uLight: { value: 0 },
      /* #f5f7f4, as the shaders write colour: display values. */
      uPaper: { value: new THREE.Vector3(0.961, 0.969, 0.957) },
    }),
    [],
  );

  /* CLOUDVERSITY's own. Its fronts run from the middle of the word outwards
     — which, with uWord at 1 as it is right up to the rebuild, shows nothing
     — and its hairlines are too fine to draw as bars. */
  const cloudUniforms = useMemo(() => {
    words.cloudversity.computeBoundingBox();
    const box = words.cloudversity.boundingBox as THREE.Box3;
    const centre = new THREE.Vector2((box.min.x + box.max.x) / 2, (box.min.y + box.max.y) / 2);
    return {
      uKey: { value: new THREE.Vector3(-0.4, 0.55, 0.75) },
      uFade: { value: 1 },
      uWord: { value: 1 },
      uCentre: { value: centre },
      uReach: { value: Math.hypot(box.max.x - centre.x, box.max.y - centre.y) },
      uWake: { value: 0 },
      uTrace: { value: 0 },
      uHatch: { value: 0 },
      uLight: { value: 0 },
      /* #dde5e0 — a shade softer than AYADI. */
      uPaper: { value: new THREE.Vector3(0.867, 0.898, 0.878) },
    };
  }, [words]);

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

    /* The rebuild, and how far the mark has settled back into the lockup. */
    const rebuild = r.rebuild;
    const rebuilding = rebuild > 0;
    const settle = THREE.MathUtils.smoothstep(rebuild, SETTLE[0], SETTLE[1]);

    /* Docked, the lockup is sized to fill the slot from wherever the camera
       is. Free, the mark is the story's size — until it settles, when the
       lockup takes the size that fits the globe. */
    const camera = state.camera as THREE.PerspectiveCamera;
    const distance = Math.max(0.5, camera.position.z - r.logoZ);
    const docked =
      (f.slotFrac * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 2) / LOCKUP.height;
    const free = THREE.MathUtils.lerp(r.logoScale, REBUILT_SCALE, settle);
    group.scale.setScalar(THREE.MathUtils.lerp(free, docked, hold));

    /* Asleep, the lockup is the image it replaces: no drift, no pointer, and
       (below) no resting turn. The story cannot have moved yet — the
       Director wakes the scene outright the moment it does. */
    const wake = r.wake;
    const idle = (1 - r.morph) * wake;
    group.position.set(0, Math.sin(f.time * 0.8) * 0.035 * idle, r.logoZ);

    /* The mark sits where the artwork has it, slides to the centre as the
       lockup opens, and back out to its place as it rebuilds. */
    const placed = Math.max(hold, settle);
    mesh.position.set(LOCKUP.mark[0] * placed, LOCKUP.mark[1] * placed, 0);

    /* A wide lockup turns further at its edges than the mark alone ever
       did; while it is whole, the story's turn and the pointer are eased so
       it still reads as the logo first. */
    const steady = 1 - 0.35 * Math.max(gather, settle);
    turning.rotation.y = (r.logoSpin * wake + f.px * 0.22 * idle) * steady + Math.sin(f.time * 0.45) * 0.07 * idle;
    turning.rotation.x = r.logoTilt + Math.sin(f.time * 0.6 + 1.3) * 0.03 * idle + f.py * 0.14 * idle * steady;

    const u = shader.uniforms;
    u.uKey.value.set(-0.4 + f.px * 0.25, 0.55 - f.py * 0.2, 0.75);
    u.uGlow.value = r.logoGlow;
    u.uFade.value = r.logoFade;
    u.uDark.value = r.dark;
    u.uWake.value = wake;

    letters.visible = gather > 0.001 || rebuilding;
    if (!letters.visible) return;
    const w = wordShader.uniforms;
    const c = cloudShader.uniforms;
    (w.uKey.value as THREE.Vector3).copy(u.uKey.value as THREE.Vector3);
    (c.uKey.value as THREE.Vector3).copy(u.uKey.value as THREE.Vector3);
    w.uWake.value = wake;
    c.uWake.value = wake;

    if (rebuilding) {
      /* The words come back from the mark — from wherever it is on its way
         to its place — each behind its own front of structure, and in their
         pale ink: they were out of sight when it changed. */
      (w.uCentre.value as THREE.Vector2).set(LOCKUP.mark[0] * settle, LOCKUP.mark[1] * settle);
      w.uWord.value = along(rebuild, AYADI_FILL);
      w.uTrace.value = along(rebuild, AYADI_TRACE);
      c.uWord.value = along(rebuild, CLOUD_FILL);
      c.uTrace.value = along(rebuild, CLOUD_TRACE);
      w.uLight.value = 1;
      c.uLight.value = 1;

      /* Leaving through the portal they go first, and the mark last. */
      const fade = THREE.MathUtils.clamp((r.logoFade - WORDS_GONE_BY) / (1 - WORDS_GONE_BY), 0, 1);
      w.uFade.value = fade;
      c.uFade.value = fade;
      return;
    }

    (w.uCentre.value as THREE.Vector2).set(LOCKUP.mark[0], LOCKUP.mark[1]);
    w.uWord.value = gather;
    w.uTrace.value = 0;
    w.uLight.value = 0;
    w.uFade.value = r.logoFade;

    /* CLOUDVERSITY fades as a whole, steadily from full to nothing while the
       front crosses AYADI, so the two go together. Its uWord stays 1: the
       front never cuts it. */
    const [whole, gone] = ayadiCrossing;
    c.uWord.value = 1;
    c.uTrace.value = 0;
    c.uLight.value = 0;
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

        {/* Each word has its own uniforms, written on its own every frame.
            They draw after the globe's core light (6) and before its glass
            (7): rebuilt, they sit in front of the one and inside the other,
            as the mark does. Docked, neither is there to tell. */}
        <group ref={wordmark}>
          <mesh geometry={words.ayadi} renderOrder={6.5}>
            <shaderMaterial
              ref={wordMaterial}
              uniforms={wordUniforms}
              vertexShader={WORDMARK_VERTEX}
              fragmentShader={WORDMARK_FRAGMENT}
              transparent
            />
          </mesh>
          <mesh geometry={words.cloudversity} renderOrder={6.5}>
            <shaderMaterial
              ref={cloudMaterial}
              uniforms={cloudUniforms}
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
