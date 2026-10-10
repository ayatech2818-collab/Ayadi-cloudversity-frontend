import * as THREE from 'three';

import { WHY_ENTRANCES } from '../whyCards';
import { GLOBE_R, PORTAL_DEPTH, PORTAL_HALF } from './geometry';

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
 * A phone held upright gets a stage of its own (see "on a phone", below): the
 * portal stands upright in it, and the same things are arranged down it
 * rather than across — so the layout also says what shape the portal is.
 *
 * Nothing here knows about time or scroll. The Director asks for the layout
 * when the stage changes shape, and for a matrix per card per frame.
 */

/** The camera's lens through the stage, as the tangent of half its field of view. */
const HALF_FOV_TAN = Math.tan(THREE.MathUtils.degToRad(40 / 2));

/** Half the frame's height, in world units, at a depth from the camera. */
const halfHeight = (distance: number) => distance * HALF_FOV_TAN;

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

/** However far off the glass is, the words are never drawn smaller than
    this against their laid-out size — nor wider than this much of the screen. */
const WORDS_FLOOR = 0.85;
const WORDS_OF_SCREEN = 0.92;

/** How near the lens a card may come before it is no longer drawn, as its
    depth from the camera in world units. */
const NEAR = 0.12;

/** A card fades only as the lens reaches it: gone at the first of these
    depths from the camera, whole at the second (in the stage's own scale of
    distances — see nearFade). */
const NEAR_FADE: readonly [number, number] = [0.4, 1.25];

/* ---------- on a phone ----------
   A phone held upright is a tall frame, and the portal stands upright in it:
   the frame every other screen has, turned on end, and as wide as the globe
   it squares off from — so the whole of it, the flare of its mouth included,
   is inside the screen for as long as there is anything to read on it, and
   its glass fills a tall screen at the crossing as it fills a wide one.

   The stage is set for that frame too. The words stand on the glass from the
   start, a little above the middle of it, and there is room in front of it
   for one card with them, not three: so the cards take turns. Each comes
   through the portal's side into the one place under the words, clear of
   them, stands there, and goes back the way it came before the next one
   comes (PHONE_TURNS). There is no room
   beside the lens for the camera to pass a card here either, so that place
   is just in front of the portal's mouth, where a card grows with it.

   Everything else — the camera, the story, how a card comes through — is the
   same. */

/** Narrower than this, and no wider than it is tall: a phone, held upright.
    A tablet is not, and nor is a phone on its side. (hero.module.css makes
    the card smaller for the same screens — keep the two in step.) */
const PHONE_BELOW = 640;

/** How far the camera is from the glass as the stage ends and the approach
    begins — when everything on the stage is at its largest. */
const LEAVING = 5.69;

/** The outermost of the portal's frames against its glass: the flare at the
    near end of its rails (LATTICE_VERTEX in shaders.ts — 1 − 0.24 × height). */
const MOUTH = 1.24;

/** Kept clear on a phone: the fixed navbar and a little under it, in pixels
    (the portal's caption is said there on a phone — hero.module.css), and
    the foot of the frame as a share of its height (a phone's own bars). */
const PHONE_TOP = 92;
const PHONE_FOOT = 0.12;

/** How far in front of the glass a card stands there, as WhyEntrance.depth
    is measured: at the portal's mouth. */
const PHONE_CARD_DEPTH = 0.6;

/** A card's width on screen as it arrives, as a share of the frame's — about
    the width of the glass behind it — and never drawn much larger than it is
    laid out. Short of room, it gives up no more than this much of that size. */
const PHONE_CARD_ACROSS = 0.62;
const PHONE_CARD_MAGNIFY = 1.12;
const PHONE_CARD_LEAST = 0.86;

/** The words there: most of the glass's width, and allowed a little smaller.
    They stand a little above the middle of the glass — this far, in world
    units — which leaves clear room between them and the card under them. */
const PHONE_WORDS_OF_GLASS = 0.8;
const PHONE_WORDS_FLOOR = 0.74;
const PHONE_WORDS_UP = 0.4;

/** That room, as the words and the card fall on the glass — world units. */
const PHONE_GAP_WORDS = 0.57;

/** A card's fade there, as NEAR_FADE, should one still be standing as the
    camera closes: over as it would grow to the width of the screen. */
const PHONE_FADE: readonly [number, number] = [4.05, 4.85];

/** One card's turn on the stage, in the terms of the words' own life on the
    glass (rig.info, 0 → 1 — it runs evenly with the scroll): when it starts
    to come through, when it is through, when it starts back, when it is gone. */
export type WhyTurn = readonly [from: number, through: number, back: number, gone: number];

/** The turns on a phone, one after another with nothing between them. The
    first card comes exactly when the story brings it (AyadiHero's STAGE), and
    takes as long to; each then stands for a moment and goes more quickly than
    it came. The last is gone as the camera sets off for the glass, which
    leaves the words alone on it for the approach, as everywhere else. */
const TURN_FIRST = 1 / 12;
const TURN_COMES = 1 / 8;
const TURN_STAYS = 0.065;
const TURN_GOES = 0.06;
const PHONE_TURNS: readonly WhyTurn[] = WHY_ENTRANCES.map((_, index) => {
  const from = TURN_FIRST + index * (TURN_COMES + TURN_STAYS + TURN_GOES);
  const through = from + TURN_COMES;
  const back = through + TURN_STAYS;
  return [from, through, back, back + TURN_GOES];
});

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
  /** The smallest the words are drawn, against their laid-out size. */
  wordsFloor: number;
  /** A card's fade as the lens nears it — see NEAR_FADE. */
  fade: readonly [number, number];
  /** Where the cards take turns on the stage rather than gather on it, each
      one's turn (cardProgress); null where they gather. */
  turns: readonly WhyTurn[] | null;
  /** The portal itself, for a stage of this shape: its front frame's
      half-width and half-height, and how far its frames reach in front of
      and behind its glass. The lattice and the glass are drawn to these
      (GlobePortal.tsx). The one portal everywhere but on a phone. */
  frame: [number, number];
  depth: number;
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
    wordsFloor: WORDS_FLOOR,
    fade: NEAR_FADE,
    turns: null,
    frame: [PORTAL_HALF[0], PORTAL_HALF[1]],
    depth: PORTAL_DEPTH,
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
  if (width < PHONE_BELOW && aspect <= 1) {
    layoutPhone(layout, width, height, fit, sizes);
    return;
  }

  layout.frame[0] = PORTAL_HALF[0];
  layout.frame[1] = PORTAL_HALF[1];
  layout.depth = PORTAL_DEPTH;
  layout.wordsFloor = WORDS_FLOOR;
  layout.fade = NEAR_FADE;
  layout.turns = null;

  /* 0 on a tall screen, 1 on a wide one, and every shape between. */
  const wide = THREE.MathUtils.smoothstep(aspect, 0.85, 1.3);

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

/*
 * The same, on a phone held upright (see "on a phone", above): the portal
 * turned on end, the words in the middle of its glass, and one place in
 * front of it, under the words, that the cards take turns in.
 */
function layoutPhone(layout: WhyLayout, width: number, height: number, fit: number, sizes: WhySizes) {
  const { cardWidth, cardHeight, wordsWidth, wordsHeight } = sizes;

  /* The camera's distance from the glass at either end of the stage, and the
     cards' own from it. */
  const eye = ARRIVAL * fit;
  const end = LEAVING * fit;
  const z = PHONE_CARD_DEPTH * fit;

  /* The portal: as wide as the globe, with frames that reach as far as suits
     that width — and as tall as the other screens' is wide, where the mouth
     of it then still stands clear of the navbar and the foot of the frame as
     the stage ends. Never wider than it is tall. */
  const across = GLOBE_R;
  const depth = PORTAL_DEPTH * (across / PORTAL_HALF[0]);
  const clear = Math.min(1 - (2 * PHONE_TOP) / height, 1 - 2 * PHONE_FOOT);
  const upright = across * (PORTAL_HALF[0] / PORTAL_HALF[1]);
  layout.frame[0] = across;
  layout.frame[1] = Math.max(across, Math.min(upright, (clear * halfHeight(end - depth)) / MOUTH));
  layout.depth = depth;

  /* The words: a little above the middle of the glass, and nowhere else. */
  layout.headY = PHONE_WORDS_UP;
  layout.restY = PHONE_WORDS_UP;
  layout.wordsAcross = PHONE_WORDS_OF_GLASS * across * 2;
  layout.wordsFloor = PHONE_WORDS_FLOOR;
  layout.fade = PHONE_FADE;
  layout.turns = PHONE_TURNS;

  /* The cards' own plane: what one pixel of the stage is there, from the
     arrival, and how tall the words are in it as the Director draws them.
     That is most from the arrival — from there on a card draws away. Under
     them, the room; and from there down, the card. */
  const pixel = (2 * halfHeight(eye - z)) / height;
  const onGlass = eye / (eye - z);
  const words =
    wordsWidth > 0
      ? ((wordsHeight * wordsScale(layout.wordsAcross, height / (2 * halfHeight(eye)), PHONE_WORDS_FLOOR, width, wordsWidth)) / 2) *
        pixel
      : 0;
  const inner = words + (PHONE_GAP_WORDS - PHONE_WORDS_UP) / onGlass;

  /* A card's height, from its width on screen as it arrives — less, where
     it would not otherwise stand clear of the foot of the frame as the stage
     ends. */
  const below = halfHeight(end - z) * (1 - 2 * PHONE_FOOT) - inner;
  const drawn = Math.min(PHONE_CARD_ACROSS * width, PHONE_CARD_MAGNIFY * cardWidth);
  const full = cardWidth > 0 ? drawn * pixel * (cardHeight / cardWidth) : 0;
  const tall = Math.max(PHONE_CARD_LEAST * full, Math.min(full, below));
  layout.unit = cardHeight > 0 ? tall / cardHeight : 0;

  /* The one place, for whichever card's turn it is. */
  for (const place of layout.cards) {
    place.x = 0;
    place.y = -(inner + tall / 2);
    place.z = z;
    place.yaw = 0;
  }
}

/** How large the words are drawn, against their laid-out size: as wide as
    suits the glass, seen at this many pixels to a world unit — but never too
    small to read, nor wider than the screen. */
export function wordsScale(across: number, pixelsPerUnit: number, floor: number, width: number, wordsWidth: number) {
  return Math.min(Math.max((across * pixelsPerUnit) / wordsWidth, floor), (WORDS_OF_SCREEN * width) / wordsWidth);
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

/** That number, for one card: its own from the story (rig.why1…3), which
    only ever brings it — or, where the cards take turns on the stage, its
    turn: brought through, and taken back the way it came, by how far the
    words are through their life on the glass (rig.info). */
export function cardProgress(layout: WhyLayout, index: number, own: number, info: number) {
  const turn = layout.turns?.[index];
  if (!turn) return own;
  if (info <= turn[2]) return clamp((info - turn[0]) / (turn[1] - turn[0]), 0, 1);
  return 1 - clamp((info - turn[2]) / (turn[3] - turn[2]), 0, 1);
}

/** A card fades only as the lens reaches it — the way anything does that the
    camera flies through. `depth` is its distance from the camera, `fit` the
    stage's own scale of distances, and `fade` the layout's own: where it is
    gone, and where it is whole. */
export function nearFade(depth: number, fit: number, fade: readonly [number, number]) {
  return smoothstep(depth / fit, fade[0], fade[1]);
}
