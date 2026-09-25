import { AYADI, type Glyph } from './scene/logo-paths';

/*
 * The official AYADI letterforms as one 2D path — for the opening's faint
 * watermark, which the page draws as SVG and the scene redraws into its
 * backdrop. Both use this, so neither is ever set in some other typeface.
 * No three.js here: the page's bundle imports it.
 */

function bounds(glyphs: Glyph[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const glyph of glyphs) {
    for (let i = 0; i < glyph.outer.length; i += 2) {
      minX = Math.min(minX, glyph.outer[i]);
      maxX = Math.max(maxX, glyph.outer[i]);
      minY = Math.min(minY, glyph.outer[i + 1]);
      maxY = Math.max(maxY, glyph.outer[i + 1]);
    }
  }
  return [minX, minY, maxX - minX, maxY - minY] as const;
}

/** AYADI's box in the artwork's pixels: x, y, width, height. */
export const AYADI_BOX = bounds(AYADI);

/** The letters as an SVG path, relative to AYADI_BOX — draw with evenodd. */
export const AYADI_PATH = AYADI.flatMap((glyph) => [glyph.outer, ...glyph.holes])
  .map((loop) => {
    let d = '';
    for (let i = 0; i < loop.length; i += 2) {
      const x = +(loop[i] - AYADI_BOX[0]).toFixed(1);
      const y = +(loop[i + 1] - AYADI_BOX[1]).toFixed(1);
      d += `${i ? 'L' : 'M'}${x} ${y}`;
    }
    return `${d}Z`;
  })
  .join('');
