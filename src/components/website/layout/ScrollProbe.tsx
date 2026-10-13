'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef, useState } from 'react';

/*
 * TEMPORARY — a readout for chasing the Home journey's "stuck scrolling back
 * up on an iPhone", which no desktop or emulator reproduces. Delete this file
 * and its one line in (website)/page.tsx once that is settled.
 *
 * Does nothing unless the address ends in ?probe. Then it shows, live, the
 * things that can each be the cause, and notes down every time one of them
 * goes wrong — so a screenshot taken while the journey is stuck says which:
 *
 *   NO SCROLL EVENT   the page moved but the browser did not say so
 *   TIMELINE STUCK    it said so, and the journey's timeline did not follow
 *   STAGE OFF PIN     the journey's stage is not where `sticky` should hold it
 *   STALL             the page's script did not run for a while
 *   RESIZE            the browser's bars came or went
 *   REFRESH           ScrollTrigger re-measured the page
 *   WEBGL LOST        the hero's canvas lost its context
 *
 * If the journey looks stuck and none of these is noted, the script is right
 * and the browser is not drawing it — which is its own answer.
 */

const KEEP = 9;
const NAV = 84;

export function ScrollProbe() {
  const [on, setOn] = useState(false);
  const panel = useRef<HTMLPreElement>(null);

  useEffect(() => {
    /* After hydration, so the server's markup is never contradicted. */
    const id = requestAnimationFrame(() => setOn(new URLSearchParams(window.location.search).has('probe')));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!on) return;

    const began = performance.now();
    const notes: string[] = [];
    const lastNoted = new Map<string, number>();
    /** Notes `text` under `kind`, at most once a second per kind. */
    const note = (kind: string, text = '') => {
      const now = performance.now();
      if (now - (lastNoted.get(kind) ?? -Infinity) < 1000) return;
      lastNoted.set(kind, now);
      notes.push(`${((now - began) / 1000).toFixed(1)}s ${kind} ${text}`.trim());
      if (notes.length > KEEP) notes.shift();
    };

    let eventAt = performance.now();
    let eventY = window.scrollY;
    let resizes = 0;
    let refreshes = 0;
    let inner = window.innerHeight;
    let webgl = 'ok';

    const onScroll = () => {
      eventAt = performance.now();
      eventY = window.scrollY;
    };
    const onResize = () => {
      resizes += 1;
      if (window.innerHeight !== inner) note('RESIZE', `${inner}→${window.innerHeight}`);
      inner = window.innerHeight;
    };
    const onRefresh = () => {
      refreshes += 1;
      note('REFRESH');
    };
    const onLost = () => {
      webgl = 'LOST';
      note('WEBGL LOST');
    };
    const onRestored = () => {
      webgl = 'restored';
      note('WEBGL', 'restored');
    };
    const onError = (event: ErrorEvent) => note('ERROR', String(event.message).slice(0, 60));

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('error', onError);
    ScrollTrigger.addEventListener('refresh', onRefresh);

    let canvas: HTMLCanvasElement | null = null;
    let last = performance.now();
    let lastY = window.scrollY;
    let direction = '·';
    let got = Number.NaN;
    let gotAt = last;
    let worst = 0;
    let worstAt = last;
    let frames = 0;
    let raf = 0;

    const frame = (now: number) => {
      const gap = now - last;
      last = now;
      if (gap > 250) note('STALL', `${Math.round(gap)}ms`);
      if (gap > worst || now - worstAt > 1000) {
        worst = gap;
        worstAt = now;
      }

      const y = window.scrollY;
      if (y !== lastY) direction = y > lastY ? '↓' : '↑';
      if (Math.abs(y - eventY) > 40 && now - eventAt > 300) {
        note('NO SCROLL EVENT', `${Math.round(now - eventAt)}ms, y moved ${Math.round(y - eventY)} ${direction}`);
      }
      lastY = y;

      if (!canvas) {
        canvas = document.querySelector<HTMLCanvasElement>('section[data-mode] canvas');
        canvas?.addEventListener('webglcontextlost', onLost);
        canvas?.addEventListener('webglcontextrestored', onRestored);
      }

      /* The journey: where its timeline should be for this scroll position,
         where it is (its progress bar runs evenly with it), and where its
         stage is on screen. */
      let journey = 'journey not mounted';
      const section = document.querySelector<HTMLElement>('section[data-mode] + div section');
      const stage = section?.firstElementChild as HTMLElement | null | undefined;
      const bar = section?.querySelector<HTMLElement>('[data-bar]');
      if (section && stage && bar) {
        const top = section.getBoundingClientRect().top + y;
        const start = top - NAV;
        const end = top + section.offsetHeight - (NAV + stage.offsetHeight);
        const want = Math.min(1, Math.max(0, (y - start) / (end - start)));
        const now1 = Number(gsap.getProperty(bar, 'scaleX'));
        if (now1 !== got) {
          got = now1;
          gotAt = now;
        }
        const pin = Math.round(stage.getBoundingClientRect().top);
        const inside = want > 0.002 && want < 0.998;
        if (inside && Math.abs(pin - NAV) > 3) note('STAGE OFF PIN', `top ${pin} ${direction}`);
        if (Math.abs(want - got) > 0.03 && now - gotAt > 500) {
          note('TIMELINE STUCK', `want ${want.toFixed(3)} got ${got.toFixed(3)} ${Math.round(now - gotAt)}ms ${direction}`);
        }
        journey = `journey want ${want.toFixed(3)} got ${got.toFixed(3)} pin ${pin}`;
      }

      frames += 1;
      if (panel.current && frames % 6 === 0) {
        panel.current.textContent = [
          `y ${Math.round(y)} ${direction}  inner ${window.innerHeight}  dpr ${window.devicePixelRatio}`,
          journey,
          `worst frame ${Math.round(worst)}ms  scroll event ${Math.round(now - eventAt)}ms ago`,
          `refresh ${refreshes}  resize ${resizes}  webgl ${webgl}`,
          '— noted —',
          ...(notes.length ? notes : ['nothing yet']),
        ].join('\n');
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('error', onError);
      ScrollTrigger.removeEventListener('refresh', onRefresh);
      canvas?.removeEventListener('webglcontextlost', onLost);
      canvas?.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [on]);

  if (!on) return null;

  return (
    <pre
      ref={panel}
      aria-hidden="true"
      className="pointer-events-none fixed left-2 top-24 z-[9999] max-w-[94vw] whitespace-pre-wrap rounded-md bg-black/80 p-2 font-mono text-[10px] leading-[1.35] text-lime-300"
    />
  );
}
