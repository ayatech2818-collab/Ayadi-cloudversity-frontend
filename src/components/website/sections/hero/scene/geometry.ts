import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

/*
 * Everything the hero draws is built here, once, from code. No models, no
 * textures — the whole scene downloads as a few kilobytes of numbers.
 */

/** Radius of the globe, in world units. The portal is sized to match it. */
export const GLOBE_R = 1.6;

/** Half-width and half-height of the portal's front frame. */
export const PORTAL_HALF: [number, number] = [1.95, 1.22];

/** Squircle exponent for the portal: higher is squarer. */
export const PORTAL_EXP = 4.5;

/** How far the portal's frames reach in front of and behind its surface. */
export const PORTAL_DEPTH = 1.8;

/** Small deterministic PRNG, so the scene is laid out the same on every visit. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One triangle that covers the screen; its shaders write clip space directly. */
export function fullscreenTriangle() {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  return geometry;
}

/* ---------- the Ayadi mark ----------
   Traced from /images/ayadi-mark.png (592 × 712): three identical slanted
   bars, each with a sharp top-right and bottom-left corner and the other two
   rounded. Image pixels, y down; each bar sits (84, 135) below the last. */
const BAR = {
  bottomLeft: [8, 432],
  bottomRoundStart: [72, 432],
  bottomRoundCorner: [110, 432],
  bottomRoundEnd: [130, 405],
  topRight: [425, 0],
  topRoundStart: [362, 0],
  topRoundCorner: [326, 0],
  topRoundEnd: [300, 36],
} as const;

const BAR_STEP: [number, number] = [84, 135];

/** Scales the traced pixels so the mark is two world units tall. */
const MARK_SCALE = 2 / 712;

export function buildMarkGeometry() {
  const shapes = [0, 1, 2].map((index) => {
    const dx = BAR_STEP[0] * index;
    const dy = BAR_STEP[1] * index;
    /* Into world space: y up, roughly centred (the geometry is centred exactly below). */
    const at = ([x, y]: readonly [number, number]) => [(x + dx - 300) * MARK_SCALE, (356 - (y + dy)) * MARK_SCALE] as const;

    const shape = new THREE.Shape();
    shape.moveTo(...at(BAR.bottomLeft));
    shape.lineTo(...at(BAR.bottomRoundStart));
    shape.quadraticCurveTo(...at(BAR.bottomRoundCorner), ...at(BAR.bottomRoundEnd));
    shape.lineTo(...at(BAR.topRight));
    shape.lineTo(...at(BAR.topRoundStart));
    shape.quadraticCurveTo(...at(BAR.topRoundCorner), ...at(BAR.topRoundEnd));
    shape.closePath();
    return shape;
  });

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.26,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.022,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geometry.center();
  return geometry;
}

/* ---------- the lattice ----------
   The globe's latitude rings and meridians as thin tubes, all in one draw
   call. The positions live in the vertex shader (LATTICE_VERTEX): each vertex
   only knows which loop it belongs to and where along it sits, so the same
   geometry can be a globe, a portal, or anything in between. */

const RINGS_DEG = [-64, -48, -32, -16, 0, 16, 32, 48, 64];
const MERIDIANS = 8;
/** Tube cross-section: a diamond is enough at this thickness. */
const RADIAL = 4;

export function buildLattice(segments: number) {
  type Loop = { kind: number; angle: number; stagger: number };

  const loops: Loop[] = [
    /* Rings draw in — and later square off — from the equator outwards. */
    ...RINGS_DEG.map((deg) => ({ kind: 0, angle: THREE.MathUtils.degToRad(deg), stagger: Math.abs(deg) / 64 })),
    ...Array.from({ length: MERIDIANS }, (_, index) => ({
      kind: 1,
      angle: (index / MERIDIANS) * Math.PI,
      stagger: 0.25 + (0.75 * index) / (MERIDIANS - 1),
    })),
  ];

  const perLoop = (segments + 1) * RADIAL;
  const count = loops.length * perLoop;
  const t = new Float32Array(count);
  const side = new Float32Array(count * 2);
  const loop = new Float32Array(count * 3);
  const index: number[] = [];

  loops.forEach((spec, loopIndex) => {
    const base = loopIndex * perLoop;

    for (let i = 0; i <= segments; i += 1) {
      for (let j = 0; j < RADIAL; j += 1) {
        const v = base + i * RADIAL + j;
        const phi = (j / RADIAL) * Math.PI * 2 + Math.PI / 4;
        t[v] = i / segments;
        side[v * 2] = Math.cos(phi);
        side[v * 2 + 1] = Math.sin(phi);
        loop[v * 3] = spec.kind;
        loop[v * 3 + 1] = spec.angle;
        loop[v * 3 + 2] = spec.stagger;
      }
    }

    for (let i = 0; i < segments; i += 1) {
      for (let j = 0; j < RADIAL; j += 1) {
        const a = base + i * RADIAL + j;
        const b = base + i * RADIAL + ((j + 1) % RADIAL);
        index.push(a, a + RADIAL, b, b, a + RADIAL, b + RADIAL);
      }
    }
  });

  const geometry = new THREE.BufferGeometry();
  /* Three needs a position attribute to draw; the shader ignores it. */
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute('aT', new THREE.BufferAttribute(t, 1));
  geometry.setAttribute('aSide', new THREE.BufferAttribute(side, 2));
  geometry.setAttribute('aLoop', new THREE.BufferAttribute(loop, 3));
  geometry.setIndex(index);
  return geometry;
}

/* ---------- the network on the globe ---------- */

const NODE_COUNT = 24;
const ARC_COUNT = 7;

function onSphere(next: () => number) {
  /* Even over the sphere, but kept off the poles where the lattice bunches up. */
  const y = next() * 1.5 - 0.75;
  const theta = next() * Math.PI * 2;
  const r = Math.sqrt(1 - y * y);
  return new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
}

export function buildNetwork() {
  const next = random(7);
  const directions = Array.from({ length: NODE_COUNT }, () => onSphere(next));

  const nodes = new THREE.BufferGeometry();
  const nodePositions = new Float32Array(NODE_COUNT * 3);
  const nodeSeeds = new Float32Array(NODE_COUNT);
  directions.forEach((direction, index) => {
    direction.clone().multiplyScalar(GLOBE_R * 1.004).toArray(nodePositions, index * 3);
    nodeSeeds[index] = next();
  });
  nodes.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  nodes.setAttribute('aSeed', new THREE.BufferAttribute(nodeSeeds, 1));

  /* Arcs between node pairs that are neither neighbours nor antipodes. */
  const tubes: THREE.BufferGeometry[] = [];
  const point = new THREE.Vector3();

  for (let attempt = 0; tubes.length < ARC_COUNT && attempt < 400; attempt += 1) {
    const a = directions[Math.floor(next() * NODE_COUNT)];
    const b = directions[Math.floor(next() * NODE_COUNT)];
    const angle = a.angleTo(b);
    if (angle < 0.6 || angle > 1.9) continue;

    const lift = 0.06 + angle * 0.09;
    const sin = Math.sin(angle);
    const points = Array.from({ length: 33 }, (_, i) => {
      const u = i / 32;
      point
        .copy(a)
        .multiplyScalar(Math.sin((1 - u) * angle) / sin)
        .addScaledVector(b, Math.sin(u * angle) / sin);
      return point.clone().multiplyScalar(GLOBE_R * (1 + lift * Math.sin(Math.PI * u)));
    });

    const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 64, 0.0065, 4, false);
    tube.setAttribute('aArc', new THREE.BufferAttribute(new Float32Array(tube.attributes.position.count).fill(tubes.length), 1));
    tubes.push(tube);
  }

  const arcs = mergeGeometries(tubes) ?? new THREE.BufferGeometry();
  tubes.forEach((tube) => tube.dispose());

  return { nodes, arcs };
}

/* ---------- drifting motes ----------
   Spread along the whole camera path, but kept out of a tube round it so
   none of them blows up across the lens on the way through. */
export function buildParticles(count: number) {
  const next = random(11);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    let x = (next() * 2 - 1) * 12;
    let y = (next() * 2 - 1) * 7;
    const z = 10 - next() * 34;
    if (Math.abs(x) < 1.6 && Math.abs(y) < 1.2) {
      x += Math.sign(x || 1) * 1.8;
      y += Math.sign(y || 1) * 1.2;
    }
    positions.set([x, y, z], i * 3);
    seeds[i] = next();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  return geometry;
}
