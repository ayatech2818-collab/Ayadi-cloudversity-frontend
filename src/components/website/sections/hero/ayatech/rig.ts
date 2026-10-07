/*
 * AyaTech's rig: every number its journey moves, in one plain object — the
 * same arrangement the hero has (../rig.ts), kept apart from it.
 *
 * The scrubbed timeline writes the story values (score.ts); the pointer
 * writes the live ones; the intro writes its own two (../ayatechIntro.ts);
 * the canvas reads the lot once a frame (scene/). None of it is React state.
 */
export type AyatechRig = {
  /* ---------- live ---------- */
  pointerX: number;
  pointerY: number;

  /* ---------- the intro's own ----------
     Never touched by the scroll: 1 and 0 are where the journey expects them. */
  /** The signal catching: 0 = dark, 1 = lit. */
  ignite: number;
  /** One wave thrown as it catches: 1 = just thrown, 0 = gone. */
  surge: number;

  /* ---------- the camera ---------- */
  /** Round the vertical axis, and looking down, in radians. */
  yaw: number;
  pitch: number;
  /** How far back from what it is looking at. */
  dist: number;
  /** How high the point it looks at is. */
  lift: number;
  /** 0 = the scene is centred; 1 = it has stepped aside for the copy. */
  aside: number;

  /* ---------- the idea ---------- */
  /** The signal's size: a point at 0.1, a presence at 1, gone at 0. */
  signal: number;
  /** Waves leaving it. */
  rings: number;
  /** How lit the dust is, and how much it answers the waves. */
  dust: number;
  /** Fragments of code round it. */
  code: number;

  /* ---------- explore / learn / experiment ---------- */
  /** The domains leaving the signal for their places. */
  field: number;
  /** Routes drawn through them. */
  routes: number;
  /** The domains drawn in to the ring, and trying things. */
  lab: number;
  /** The one arrangement that holds. */
  hold: number;

  /* ---------- build ---------- */
  /** Off the ring and into layers. */
  stack: number;
  /** The layers themselves, top to bottom. */
  plates: number;
  /** What joins them. */
  links: number;
  /** Requests running through. */
  flow: number;
  /** The pipeline shipping it: outline becomes solid, bottom to top. */
  deploy: number;

  /* ---------- deliver ---------- */
  /** The layers closing up into one slab. */
  slab: number;
  /** The ground it stands on. */
  map: number;
  /** The plots round it, drawn as blueprints. */
  plots: number;
  /** Signal reaching them. */
  reach: number;

  /* ---------- ayatech ---------- */
  /** All of it gathered into three arcs. */
  orbit: number;
  /** And the arcs letting go. */
  clear: number;
};

export type LiveKey = 'pointerX' | 'pointerY' | 'ignite' | 'surge';
export type StoryKey = Exclude<keyof AyatechRig, LiveKey>;

/** Where the story starts: dark, and one small point of light. */
export const RIG_START: Record<StoryKey, number> = {
  yaw: 0,
  pitch: 0,
  dist: 6.2,
  lift: 0,
  aside: 0,
  signal: 0.1,
  rings: 0,
  dust: 0.22,
  code: 0,
  field: 0,
  routes: 0,
  lab: 0,
  hold: 0,
  stack: 0,
  plates: 0,
  links: 0,
  flow: 0,
  deploy: 0,
  slab: 0,
  map: 0,
  plots: 0,
  reach: 0,
  orbit: 0,
  clear: 0,
};

export function createRig(): AyatechRig {
  return { pointerX: 0, pointerY: 0, ignite: 1, surge: 0, ...RIG_START };
}

/* The intro is started from outside the component (worldEntrance.ts), with
   nothing but the DOM to go on — so a world's section answers for its rig. */
const rigs = new WeakMap<Element, AyatechRig>();

export function registerRig(section: Element, rig: AyatechRig) {
  rigs.set(section, rig);
}

export function releaseRig(section: Element) {
  rigs.delete(section);
}

export function rigOf(section: Element) {
  return rigs.get(section);
}
