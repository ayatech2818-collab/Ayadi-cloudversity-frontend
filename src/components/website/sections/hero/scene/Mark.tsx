'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';

import type { Rig } from '../rig';
import type { Frame } from './frame';
import { buildMarkGeometry } from './geometry';
import { LOGO_FRAGMENT, LOGO_VERTEX } from './shaders';

/*
 * The Ayadi mark, extruded.
 *
 * It opens docked in the logo slot beside the headline — the Director shifts
 * the lens so the mark lands exactly there — then comes free, turns to show
 * its depth, and shrinks into the globe as its glowing core. Two transform
 * owners: the group carries the story (position, scale), the mesh the turn
 * (story spin + idle sway + pointer).
 */
export function Mark({ rig, frame }: { rig: RefObject<Rig>; frame: RefObject<Frame> }) {
  const geometry = useMemo(() => buildMarkGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () => ({
      uKey: { value: new THREE.Vector3(-0.4, 0.55, 0.75) },
      uGlow: { value: 0 },
      uFade: { value: 1 },
      uDark: { value: 0 },
    }),
    [],
  );

  const holder = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const material = useRef<THREE.ShaderMaterial>(null);

  useFrame((state) => {
    const r = rig.current;
    const f = frame.current;
    const group = holder.current;
    const mesh = body.current;
    const shader = material.current;
    if (!group || !mesh || !shader) return;

    group.visible = r.logoFade > 0.002;
    if (!group.visible) return;

    /* Docked, the mark is sized to fill the slot from wherever the camera is. */
    const camera = state.camera as THREE.PerspectiveCamera;
    const distance = Math.max(0.5, camera.position.z - r.logoZ);
    const docked = f.slotFrac * distance * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    group.scale.setScalar(THREE.MathUtils.lerp(r.logoScale, docked, r.dock));

    const idle = 1 - r.morph;
    group.position.set(0, Math.sin(f.time * 0.8) * 0.035 * idle, r.logoZ);
    mesh.rotation.y = r.logoSpin + Math.sin(f.time * 0.45) * 0.07 * idle + f.px * 0.22 * idle;
    mesh.rotation.x = r.logoTilt + Math.sin(f.time * 0.6 + 1.3) * 0.03 * idle + f.py * 0.14 * idle;

    const u = shader.uniforms;
    u.uKey.value.set(-0.4 + f.px * 0.25, 0.55 - f.py * 0.2, 0.75);
    u.uGlow.value = r.logoGlow;
    u.uFade.value = r.logoFade;
    u.uDark.value = r.dark;
  });

  return (
    <group ref={holder}>
      <mesh ref={body} geometry={geometry} renderOrder={5}>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={LOGO_VERTEX}
          fragmentShader={LOGO_FRAGMENT}
          transparent
        />
      </mesh>
    </group>
  );
}
