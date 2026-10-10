'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';

import { WHY_KEYS, type Rig } from '../rig';
import { WHY_ENTRANCES } from '../whyCards';
import type { Frame } from './frame';
import { RIPPLE_FRAGMENT, SPRITE_VERTEX } from './shaders';
import { cardProgress, createWhyPhase, whyPhase } from './why';

/** A ripple's height against its card's, and its width against its height. */
const TALL = 1.9;
const SLIM = 0.62;
/** Where it sits: this far out from the card's centre, in card widths — on
    the edge the card comes through. */
const OUT = 0.56;

/*
 * The liquid each Why card comes through: a small patch of the portal's own
 * membrane, opened in the card's plane at its outer edge for as long as the
 * card takes to push through it, and closed again once the card is clear.
 *
 * Three quads in the scene's one canvas, drawn only while a card is on its
 * way — at most one at a time, as the stage is scored. Their rings run on
 * the card's own number (rig.why1…3), not on time: scroll back and they run
 * back in, and the card goes back through.
 */
export function WhyRipples({ rig, frame }: { rig: RefObject<Rig>; frame: RefObject<Frame> }) {
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  const uniforms = useMemo(
    () =>
      WHY_ENTRANCES.map((entrance) => ({
        uStrength: { value: 0 },
        uPhase: { value: 0 },
        uRings: { value: entrance.rings },
      })),
    [],
  );
  const phase = useMemo(() => createWhyPhase(), []);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const r = rig.current;
    const layout = frame.current.why;

    meshes.current.forEach((mesh, index) => {
      if (!mesh) return;

      const e = cardProgress(layout, index, r[WHY_KEYS[Math.min(index, WHY_KEYS.length - 1)]], r.info);
      const through = e > 0 && e < 1 && layout.unit > 0;
      if (through) whyPhase(e, phase);
      mesh.visible = through && phase.ripple > 0.002;
      if (!mesh.visible) return;

      const entrance = WHY_ENTRANCES[index];
      const place = layout.cards[index];
      const cardWidth = layout.unit * r.cardWidth;
      const tall = layout.unit * r.cardHeight * TALL * entrance.ripple;

      /* Out along the card's own width, on the side it comes from. */
      const out = entrance.side * cardWidth * OUT;
      mesh.position.set(place.x + Math.cos(place.yaw) * out, place.y, place.z - Math.sin(place.yaw) * out);
      mesh.rotation.y = place.yaw;
      mesh.scale.set(tall * SLIM, tall, 1);

      const u = (mesh.material as THREE.ShaderMaterial).uniforms;
      u.uStrength.value = phase.ripple;
      u.uPhase.value = phase.rings;
    });
  });

  return (
    <group>
      {uniforms.map((own, index) => (
        <mesh
          key={index}
          ref={(mesh) => {
            meshes.current[index] = mesh;
          }}
          geometry={geometry}
          renderOrder={12}
          visible={false}
        >
          <shaderMaterial
            uniforms={own}
            vertexShader={SPRITE_VERTEX}
            fragmentShader={RIPPLE_FRAGMENT}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}
