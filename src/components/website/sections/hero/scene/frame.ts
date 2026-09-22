/*
 * Per-frame values the scene shares between its parts. The Director writes
 * them first thing every frame; everything else only reads.
 */
export type Frame = {
  /** Seconds of scene time. Only advances while the scene is rendering. */
  time: number;
  dt: number;
  /** The pointer, smoothed. −1 … 1. */
  px: number;
  py: number;
  aspect: number;
  /** Dolly factor for portrait screens, so the globe and portal fit across. */
  fit: number;
  /** Lens shift this frame, in NDC — how the mark sits in the logo slot. */
  shiftX: number;
  shiftY: number;
  /** The logo slot's height as a share of the canvas. */
  slotFrac: number;
  /** The globe's idle turn; slows to a stop as it becomes the portal. */
  idleSpin: number;
};

export function createFrame(): Frame {
  return { time: 0, dt: 0, px: 0, py: 0, aspect: 1, fit: 1, shiftX: 0, shiftY: 0, slotFrac: 0.4, idleSpin: 0 };
}
