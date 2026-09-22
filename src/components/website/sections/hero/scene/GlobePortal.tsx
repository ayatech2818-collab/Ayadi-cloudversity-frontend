'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';

import type { Quality, Rig } from '../rig';
import type { Frame } from './frame';
import { buildLattice, buildNetwork, GLOBE_R, PORTAL_DEPTH, PORTAL_EXP, PORTAL_HALF } from './geometry';
import {
  ARCS_FRAGMENT,
  ARCS_VERTEX,
  ATMOSPHERE_FRAGMENT,
  BODY_FRAGMENT,
  LATTICE_FRAGMENT,
  LATTICE_VERTEX,
  NODES_FRAGMENT,
  NODES_VERTEX,
  SHELL_VERTEX,
  SPRITE_FRAGMENT,
  SPRITE_VERTEX,
  SURFACE_FRAGMENT,
  SURFACE_VERTEX,
} from './shaders';

function latticeUniforms(width: number, opacity: number, brightness: number) {
  return {
    uRadius: { value: GLOBE_R },
    uGlobe: { value: 0 },
    uMorph: { value: 0 },
    uSpin: { value: 0 },
    uTime: { value: 0 },
    uWidth: { value: width },
    uSurface: { value: 0 },
    uFrame: { value: new THREE.Vector2(...PORTAL_HALF) },
    uExp: { value: PORTAL_EXP },
    uDepth: { value: PORTAL_DEPTH },
    uOpacity: { value: opacity },
    uBrightness: { value: brightness },
  };
}

/*
 * The globe and the portal it becomes.
 *
 * The globe is dark glass, an atmosphere, a lattice of rings and meridians,
 * and a quiet network of points and arcs. The portal is the same lattice —
 * tipped to face the camera and squared off into frames and rails (see
 * LATTICE_VERTEX) — with a liquid glass surface in its front frame. The
 * mark, shrunk to the globe's core, sits at the centre of both.
 */
export function GlobePortal({
  rig,
  frame,
  quality,
}: {
  rig: RefObject<Rig>;
  frame: RefObject<Frame>;
  quality: Quality;
}) {
  const lattice = useMemo(() => buildLattice(quality.segments), [quality.segments]);
  const network = useMemo(() => buildNetwork(), []);
  useEffect(
    () => () => {
      lattice.dispose();
      network.nodes.dispose();
      network.arcs.dispose();
    },
    [lattice, network],
  );

  const uniforms = useMemo(
    () => ({
      lattice: latticeUniforms(0.0085, 1, 1),
      halo: latticeUniforms(0.032, 0.2, 0.85),
      body: { uOpacity: { value: 0 } },
      atmosphere: { uOpacity: { value: 0 } },
      nodes: { uTime: { value: 0 }, uSize: { value: 5 }, uPixelRatio: { value: 1 }, uNodes: { value: 0 } },
      arcs: { uTime: { value: 0 }, uNodes: { value: 0 } },
      core: { uColor: { value: new THREE.Vector3(0.62, 0.92, 0.5) }, uStrength: { value: 0 } },
      surface: {
        uSurface: { value: 0 },
        uRipple: { value: 0 },
        uShine: { value: 0 },
        uTime: { value: 0 },
        uExp: { value: PORTAL_EXP },
        uFrame: { value: new THREE.Vector2(...PORTAL_HALF) },
      },
    }),
    [],
  );

  const latticeMesh = useRef<THREE.Mesh>(null);
  const haloMesh = useRef<THREE.Mesh>(null);
  const bodyMesh = useRef<THREE.Mesh>(null);
  const atmosphereMesh = useRef<THREE.Mesh>(null);
  const networkGroup = useRef<THREE.Group>(null);
  const coreMesh = useRef<THREE.Mesh>(null);
  const surfaceMesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const r = rig.current;
    const f = frame.current;
    const t = f.time;

    /* One rotation for everything on the globe: the scroll's share, the idle
       turn, and a touch of pointer — the last two fade out as it becomes the
       portal, so the frames end up square to the camera. */
    const spin = r.spin + f.idleSpin + f.px * 0.3 * (1 - r.morph);
    const inSpace = r.world < 0.999;

    for (const mesh of [latticeMesh.current, haloMesh.current]) {
      if (!mesh) continue;
      mesh.visible = r.globe > 0.001 && inSpace;
      const u = (mesh.material as THREE.ShaderMaterial).uniforms;
      u.uGlobe.value = r.globe;
      u.uMorph.value = r.morph;
      u.uSpin.value = spin;
      u.uTime.value = t;
      u.uSurface.value = r.surface;
    }

    const shellVisible = r.body > 0.002;
    for (const mesh of [bodyMesh.current, atmosphereMesh.current]) {
      if (!mesh) continue;
      mesh.visible = shellVisible;
      (mesh.material as THREE.ShaderMaterial).uniforms.uOpacity.value = r.body;
    }

    const network = networkGroup.current;
    if (network) {
      network.visible = r.nodes > 0.002;
      network.rotation.y = spin;
      for (const child of network.children) {
        const u = ((child as THREE.Mesh).material as THREE.ShaderMaterial).uniforms;
        u.uTime.value = t;
        u.uNodes.value = r.nodes;
        if (u.uPixelRatio) u.uPixelRatio.value = state.viewport.dpr;
      }
    }

    const core = coreMesh.current;
    if (core) {
      const strength = r.logoGlow * r.logoFade * 0.85;
      core.visible = strength > 0.002;
      core.position.set(0, 0, r.logoZ);
      core.quaternion.copy(state.camera.quaternion);
      (core.material as THREE.ShaderMaterial).uniforms.uStrength.value = strength;
    }

    const surface = surfaceMesh.current;
    if (surface) {
      surface.visible = r.surface > 0.002 && inSpace;
      const u = (surface.material as THREE.ShaderMaterial).uniforms;
      u.uSurface.value = r.surface;
      u.uRipple.value = r.ripple;
      u.uShine.value = r.shine;
      u.uTime.value = t;
    }
  });

  const segments = quality.tier === 'low' ? 32 : 48;

  return (
    <group>
      {/* Atmosphere first: it is the back faces of a larger sphere. */}
      <mesh ref={atmosphereMesh} renderOrder={4} visible={false}>
        <sphereGeometry args={[GLOBE_R * 1.22, segments, segments / 2]} />
        <shaderMaterial
          uniforms={uniforms.atmosphere}
          vertexShader={SHELL_VERTEX}
          fragmentShader={ATMOSPHERE_FRAGMENT}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={coreMesh} renderOrder={6} visible={false}>
        <planeGeometry args={[1.9, 1.9]} />
        <shaderMaterial
          uniforms={uniforms.core}
          vertexShader={SPRITE_VERTEX}
          fragmentShader={SPRITE_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh ref={bodyMesh} renderOrder={7} visible={false}>
        <sphereGeometry args={[GLOBE_R * 0.985, segments, segments / 2]} />
        <shaderMaterial
          uniforms={uniforms.body}
          vertexShader={SHELL_VERTEX}
          fragmentShader={BODY_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </mesh>

      <group ref={networkGroup} visible={false}>
        <mesh geometry={network.arcs} renderOrder={8}>
          <shaderMaterial
            uniforms={uniforms.arcs}
            vertexShader={ARCS_VERTEX}
            fragmentShader={ARCS_FRAGMENT}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <points geometry={network.nodes} renderOrder={8}>
          <shaderMaterial
            uniforms={uniforms.nodes}
            vertexShader={NODES_VERTEX}
            fragmentShader={NODES_FRAGMENT}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      {/* Drawn before the lattice, so the frames in front of it stay crisp;
          the ones behind are dimmed in the lattice shader instead. */}
      <mesh ref={surfaceMesh} renderOrder={9} visible={false}>
        <planeGeometry args={[PORTAL_HALF[0] * 2, PORTAL_HALF[1] * 2]} />
        <shaderMaterial
          uniforms={uniforms.surface}
          vertexShader={SURFACE_VERTEX}
          fragmentShader={SURFACE_FRAGMENT}
          transparent
          depthWrite={false}
        />
      </mesh>

      {quality.halo && (
        <mesh ref={haloMesh} geometry={lattice} renderOrder={10} frustumCulled={false} visible={false}>
          <shaderMaterial
            uniforms={uniforms.halo}
            vertexShader={LATTICE_VERTEX}
            fragmentShader={LATTICE_FRAGMENT}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      <mesh ref={latticeMesh} geometry={lattice} renderOrder={11} frustumCulled={false} visible={false}>
        <shaderMaterial
          uniforms={uniforms.lattice}
          vertexShader={LATTICE_VERTEX}
          fragmentShader={LATTICE_FRAGMENT}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
