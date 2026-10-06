import * as THREE from 'three';

import { WHY_ENTRANCES } from '../whyCards';
import { PORTAL_HALF } from './geometry';

/*
 * Where the Why Choose Ayadi heading and cards are, in the portal's space,
 * and how a card's place there becomes a transform on its element.
 *
 * The heading lies on the portal's glass. The cards stand in front of it, to
 * either side and one behind another, each a flat pane with a fixed place in
 * the world: the camera's approach is the only thing that moves them on
 * screen. It brings them closer and wider apart, carries the nearest out of
 * the frame first, and goes past each in turn before it reaches the glass.
 *
 * Nothing here knows about time or scroll. The Director asks for the layout
 * when the stage changes shape, and for a matrix per card per frame.
 */

/** The camera's lens through the stage, as the tangent of half its field of view. */
const HALF_FOV_TAN = Math.tan(THREE.MathUtils.degToRad(40 / 2));

/** How far the camera is from the glass (rig.camZ − rig.push) as the first
    card arrives — the moment the composition is laid out for. */
const ARRIVAL = 6.4;

/** A card is this wide on screen at that moment: most of a narrow screen,
    and never more than suits the height of a wide one. */
const CARD_ACROSS = 0.82;
const CARD_OF_HEIGHT = 0.44;

/** Wider than this and the cards stop following the frame's edges out: they
    belong beside the portal, not beside the window. */
const WIDEST = 16 / 9;

/** How far the cards turn in toward the middle on a wide screen, radians. */
const TURN_IN = THREE.MathUtils.degToRad(14);

/** Where the words — the heading, and its quote under it — belong: the
    middle of the glass, as a fraction of the half-height above its centre.
    It is also where the camera's last approach keeps them in the frame
    longest. */
const REST_TALL = 0.2;
const REST_WIDE = 0.14;

/** On a screen with room for it they stand there from the start, between
    the cards. That takes a frame about this much wider than it is tall… */
const ROOM_FROM = 1.4;
const ROOM_TO = 1.55;

/** …and with less, the cards are where the words would be. There they start
    above the cards instead — over them on a tall screen, in the upper part
    of the glass on a squarer one — and come down to the middle only as the
    cards leave (rig.settle). */
const HEAD_TALL = 0.6;
const HEAD_WIDE = 0.39;

/** The words' width on the glass, as a share of the glass's own — and the
    room they keep, on the glass, between themselves and a card standing
    beside them. */
const WORDS_OF_GLASS = 0.46;
const WORDS_CLEAR = 0.06;

/** How near the lens a card may come before it is no longer drawn, as its
    depth from the camera in world units. */
const NEAR = 0.12;

export type WhyPlace = { x: number; y: number; z: number; yaw: number };

export type WhyLayout = {
  /** What it was laid out for: a change in any of them means laying it out again. */
  width: number;
  height: number;
  sizes: WhySizes;
  /** World units to one CSS pixel of a card as it is laid out on the page. */
  unit: number;
  cards: WhyPlace[];
  /** The words' height on the glass, world units — the heading with its
      quote under it — as they arrive, and where they settle as the cards
      leave. The same height wherever the screen has room for it. */
  headY: number;
  restY: number;
  /** How wide the words are on the glass, world units. */
  wordsAcross: number;
};

/** The cards and the words as the page lays them out, in CSS pixels. */
export type WhySizes = { cardWidth: number; cardHeight: number; wordsWidth: number; wordsHeight: number };

export function createWhyLayout(): WhyLayout {
  return {
    width: 0,
    height: 0,
    sizes: { cardWidth: 0, cardHeight: 0, wordsWidth: 0, wordsHeight: 0 },
    unit: 0,
    cards: WHY_ENTRANCES.map(() => ({ x: 0, y: 0, z: 0, yaw: 0 })),
    headY: 0,
    restY: 0,
    wordsAcross: 0,
  };
}

/** Lays the stage out for a canvas of this size — only when that has changed. */
export function layoutWhy(layout: WhyLayout, width: number, height: number, fit: number, sizes: WhySizes) {
  const { cardWidth, cardHeight, wordsWidth, wordsHeight } = sizes;
  const was = layout.sizes;
  if (
    layout.width === width &&
    layout.height === height &&
    was.cardWidth === cardWidth &&
    was.cardHeight === cardHeight &&
    was.wordsWidth === wordsWidth &&
    was.wordsHeight === wordsHeight
  ) {
    return;
  }
  layout.width = width;
  layout.height = height;
  Object.assign(was, sizes);

  const aspect = width / Math.max(height, 1);
  /* 0 on a tall screen, 1 on a wide one, and every shape between. */
  const wide = THREE.MathUtils.smoothstep(aspect, 0.85, 1.3);

  /* Half the frame's height, in world units, at a depth from the camera. */
  const halfHeight = (distance: number) => distance * HALF_FOV_TAN;

  WHY_ENTRANCES.forEach((entrance, index) => {
    const place = layout.cards[index];
    place.z = entrance.depth * fit;

    const half = halfHeight((ARRIVAL - entrance.depth) * fit);
    place.x = THREE.MathUtils.lerp(entrance.tall[0], entrance.wide[0], wide) * half * Math.min(aspect, WIDEST);
    place.y = THREE.MathUtils.lerp(entrance.tall[1], entrance.wide[1], wide) * half;
    /* Turned to face in from its own side — hardly at all where it is centred. */
    place.yaw = -entrance.side * TURN_IN * wide;
  });

  /* One size for all three, so nearer reads as nearer: the first card's
     width on screen as it arrives, taken back into the world. */
  const across = Math.min(CARD_ACROSS * width, CARD_OF_HEIGHT * height);
  const first = halfHeight((ARRIVAL - WHY_ENTRANCES[0].depth) * fit);
  layout.unit = cardWidth > 0 ? (across * ((2 * first) / height)) / cardWidth : 0;

  /* The words: in the middle of the glass throughout, where the frame is
     wide enough for the cards to stand clear of it on either side. */
  const eye = ARRIVAL * fit;
  const glass = halfHeight(eye);
  const roomy = THREE.MathUtils.smoothstep(aspect, ROOM_FROM, ROOM_TO);
  layout.restY = THREE.MathUtils.lerp(REST_TALL, REST_WIDE, wide) * glass;
  layout.headY = THREE.MathUtils.lerp(THREE.MathUtils.lerp(HEAD_TALL, HEAD_WIDE, wide) * glass, layout.restY, roomy);

  /* As wide as suits the glass — but where a card stands beside them as
     they arrive, no wider than leaves it clear. Judged from where the camera
     is as the first card comes: from there on the cards only draw apart. */
  const suits = WORDS_OF_GLASS * PORTAL_HALF[0] * 2;
  let room = suits;
  if (wordsWidth > 0 && layout.unit > 0) {
    const reach = (suits * wordsHeight) / wordsWidth / 2;
    for (const place of layout.cards) {
      const halfAcross = (layout.unit * cardWidth) / 2;
      const halfUp = (layout.unit * cardHeight) / 2;
      /* The card, and its inner edge, as they fall on the glass from there. */
      const onGlass = eye / (eye - place.z);
      if (Math.abs(place.y * onGlass - layout.headY) >= halfUp * onGlass + reach) continue;
      const edgeX = Math.abs(place.x) - halfAcross * Math.cos(place.yaw);
      const edgeZ = place.z - halfAcross * Math.abs(Math.sin(place.yaw));
      room = Math.min(room, 2 * ((edgeX * eye) / (eye - edgeZ) - WORDS_CLEAR));
    }
    /* Never to nothing: on a frame that leaves no room at all, the words
       take theirs and are simply read over the card. */
    room = Math.max(room, suits * 0.6);
  }
  layout.wordsAcross = room;
}

const model = new THREE.Matrix4();
const scale = new THREE.Vector3();

/*
 * The transform that draws a card's element as that pane, seen through the
 * camera: CSS's matrix3d and three's matrices are both column-major, so the
 * camera's own projection is used as it is. The element is expected at the
 * stage's top-left with its transform origin there, centred on itself by a
 * `translate(-50%, -50%)` after this (so its height never comes into it).
 *
 * Returns the card's depth from the camera at its nearest corner, in world
 * units — at NEAR or less it must not be drawn at all: a pane crossing the
 * lens cannot be projected.
 */
export function cardMatrix(
  out: THREE.Matrix4,
  camera: THREE.Camera,
  width: number,
  height: number,
  place: WhyPlace,
  unit: number,
  cardWidth: number,
  cardHeight: number,
) {
  /* A CSS pixel of the card, in the world: y runs down the page. */
  model.makeRotationY(place.yaw).scale(scale.set(unit, -unit, unit)).setPosition(place.x, place.y, place.z);
  out.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(model);

  /* Clip space to the stage's pixels, keeping the divide for the browser. The
     pane is flat, so its depth is dropped — there is nothing for it to sort
     against, and a card must never be clipped by it. */
  const e = out.elements;
  for (let column = 0; column < 4; column += 1) {
    const i = column * 4;
    const x = e[i];
    const y = e[i + 1];
    const w = e[i + 3];
    e[i] = ((x + w) * width) / 2;
    e[i + 1] = ((w - y) * height) / 2;
    e[i + 2] = column === 2 ? 1 : 0;
  }

  const acrossW = Math.abs(e[3]) * (cardWidth / 2);
  const downW = Math.abs(e[7]) * (cardHeight / 2);
  return e[15] - acrossW - downW;
}

export function isDrawable(depth: number) {
  return depth > NEAR;
}

/** matrix3d(), to the precision a perspective needs. */
export function toMatrix3d(matrix: THREE.Matrix4) {
  const e = matrix.elements;
  let css = 'matrix3d(';
  for (let i = 0; i < 16; i += 1) css += (i ? ',' : '') + e[i].toFixed(6);
  return `${css}) translate(-50%, -50%)`;
}

/* ---------- coming through ----------
   One number per card — rig.why1…3, 0 → 1 across its stretch of scroll — is
   all the page and the scene share. This is how it is spent: the ripple
   first, then the card pushing through it, then nothing at all. Every part
   is a plain function of that number, so scrolling back runs it backwards. */

export type WhyPhase = {
  /** The ripple's strength: it opens, holds while the card comes through,
      and has closed again by the time the card is still. */
  ripple: number;
  /** How far the ripple's rings have run outward. */
  rings: number;
  /** How much of the card is still in the membrane: 1 as it starts to come
      through, 0 once it is clear and sharp. Its offset, hinge, blur and
      distortion all hang off this. */
  within: number;
  /** The card's opacity. */
  shown: number;
  /** The light on its edge: brightest as it breaks the surface, a trace after. */
  glow: number;
};

export function createWhyPhase(): WhyPhase {
  return { ripple: 0, rings: 0, within: 1, shown: 0, glow: 0 };
}

const { smoothstep, clamp } = THREE.MathUtils;

export function whyPhase(e: number, phase: WhyPhase) {
  phase.ripple = smoothstep(e, 0, 0.2) * (1 - smoothstep(e, 0.46, 0.84));
  phase.rings = e;
  /* Out fast, then easing into place. */
  const through = clamp((e - 0.14) / 0.62, 0, 1);
  phase.within = Math.pow(1 - through, 3);
  phase.shown = smoothstep(e, 0.12, 0.42);
  phase.glow = 0.1 * smoothstep(e, 0.1, 0.3) + 0.9 * smoothstep(e, 0.1, 0.34) * (1 - smoothstep(e, 0.42, 0.9));
  return phase;
}

/** A card fades only as the lens reaches it — the way anything does that the
    camera flies through. `depth` is its distance from the camera, `fit` the
    stage's own scale of distances. */
export function nearFade(depth: number, fit: number) {
  return smoothstep(depth / fit, 0.4, 1.25);
}
