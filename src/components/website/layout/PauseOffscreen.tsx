'use client';

import { useEffect, useRef } from 'react';

/*
 * Pauses the CSS animations of whatever part of the page is nowhere near the
 * screen — globals.css has the rule ([data-offscreen]) and the reason.
 *
 * It watches the blocks that come after it in the page, so where it is put
 * decides what it looks after: straight after the hero on the Home page, that
 * is every section below it, and the footer. Renders nothing that can be
 * seen.
 */

/** A block is let go this far before it comes into view — half a screen —
    so nothing is ever seen starting up. */
const AHEAD = '50% 0px';

export function PauseOffscreen() {
  const marker = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const blocks: Element[] = [];
    for (let block = marker.current?.nextElementSibling; block; block = block.nextElementSibling) blocks.push(block);

    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting);
      },
      { rootMargin: AHEAD },
    );
    for (const block of blocks) watch.observe(block);

    return () => {
      watch.disconnect();
      for (const block of blocks) block.removeAttribute('data-offscreen');
    };
  }, []);

  return <span ref={marker} hidden />;
}
