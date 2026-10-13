'use client';

import { cancelFrame, frame } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/*
 * TEMPORARY — a readout for what only an iPhone shows and no desktop or
 * emulator reproduces. Now: a page that freezes or is left half drawn after a
 * change of page from the bottom navigation (More → Blog / Media). Delete this
 * file and its one line in (website)/layout.tsx once that is settled.
 *
 * Does nothing until a page of the site is opened with ?probe on its address.
 * From then on it stays up in that tab, across changes of page, until a page
 * is opened with ?probe=off. It shows, live, the things that can each be the
 * cause, and notes down every time one of them goes wrong — so a screenshot
 * taken while the page is stuck says which:
 *
 *   LOAD             the tab loaded a page afresh — after a NAV, and with
 *                    nobody having reloaded it, the browser threw the page away
 *   NAV              a change of page, and how far down the old one was
 *   SWEEP            the new page was scrolled up to its top, and for how long
 *   NOT AT TOP       …and never got there
 *   STALL            the page's script did not run for a while
 *   MOTION DEAD      frames are running but the animation library's loop is not
 *   BACKDROP STUCK   More is closed and its backdrop is still over the page
 *   HERO STUCK       the new page's heading never finished coming in
 *   STILL LOADING    the new page's placeholders are still up
 *   ERROR            something threw
 *   RESIZE           the browser's bars came or went
 *
 * If the page looks stuck and none of these is noted, the script is right and
 * the browser is not drawing it — which is its own answer.
 */

const FLAG = 'ayadi-probe';
const LOG = 'ayadi-probe-log';
const KEEP = 10;

/** mm:ss on the wall clock: the notes outlive a reload, so they need a time
    that does too. */
const clock = () => new Date().toTimeString().slice(3, 8);

const describe = (element: Element | null) =>
  element ? `${element.tagName.toLowerCase()}${element.getAttribute('aria-label') ? ` "${element.getAttribute('aria-label')}"` : ''}` : 'nothing';

export function ScrollProbe() {
  const [on, setOn] = useState(false);
  const panel = useRef<HTMLPreElement>(null);

  useEffect(() => {
    /* After hydration, so the server's markup is never contradicted. */
    const id = requestAnimationFrame(() => {
      const asked = new URLSearchParams(window.location.search).get('probe');
      try {
        if (asked === 'off') sessionStorage.removeItem(FLAG);
        else if (asked !== null) sessionStorage.setItem(FLAG, 'on');
        setOn(sessionStorage.getItem(FLAG) === 'on');
      } catch {
        /* No storage (a private tab can refuse it): this page only, then. */
        setOn(asked !== null && asked !== 'off');
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!on) return;

    let notes: string[] = [];
    try {
      notes = JSON.parse(sessionStorage.getItem(LOG) ?? '[]') as string[];
    } catch {
      /* Starts empty. */
    }
    const lastNoted = new Map<string, number>();
    /** Notes `text` under `kind`, at most once a second per kind. */
    const note = (kind: string, text = '') => {
      const now = performance.now();
      if (now - (lastNoted.get(kind) ?? -Infinity) < 1000) return;
      lastNoted.set(kind, now);
      notes.push(`${clock()} ${kind} ${text}`.trim());
      if (notes.length > KEEP) notes.shift();
      try {
        sessionStorage.setItem(LOG, JSON.stringify(notes));
      } catch {
        /* Kept in memory only. */
      }
    };

    let path = window.location.pathname;
    note('LOAD', path);

    let eventAt = performance.now();
    let touchAt = -Infinity;
    let inner = window.innerHeight;
    /* Since the last change of page (or the load): when, how far down the old
       page was, and what has been said about the new one. */
    let since = performance.now();
    let from = 0;
    let atTop = true;
    let said = { top: false, hero: false, loading: false };
    let backdropSince = 0;
    let motionAt = performance.now();

    const onScroll = () => {
      eventAt = performance.now();
    };
    const onTouch = () => {
      touchAt = performance.now();
    };
    const onResize = () => {
      if (window.innerHeight !== inner) note('RESIZE', `${inner}→${window.innerHeight}`);
      inner = window.innerHeight;
    };
    const onError = (event: ErrorEvent) => note('ERROR', String(event.message).slice(0, 70));
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason: unknown = event.reason;
      note('ERROR', String(reason instanceof Error ? reason.message : reason).slice(0, 70));
    };
    /* On the animation library's own loop: it stops with it. */
    const beat = () => {
      motionAt = performance.now();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    frame.update(beat, true);

    let last = performance.now();
    let lastY = window.scrollY;
    let direction = '·';
    let worst = 0;
    let worstAt = last;
    let frames = 0;
    let slow = '';
    let raf = 0;

    const tick = (now: number) => {
      const gap = now - last;
      last = now;
      if (gap > 250) note('STALL', `${Math.round(gap)}ms`);
      if (gap > worst || now - worstAt > 1000) {
        worst = gap;
        worstAt = now;
      }
      if (gap < 100 && now - motionAt > 1000) note('MOTION DEAD', `${Math.round(now - motionAt)}ms`);

      const y = window.scrollY;
      if (y !== lastY) direction = y > lastY ? '↓' : '↑';
      lastY = y;

      if (window.location.pathname !== path) {
        note('NAV', `${path} → ${window.location.pathname} at y ${Math.round(y)}`);
        path = window.location.pathname;
        since = now;
        from = y;
        atTop = y === 0;
        said = { top: false, hero: false, loading: false };
      }
      const age = now - since;

      if (!atTop && y === 0) {
        atTop = true;
        note('SWEEP', `${Math.round(from)}→0 in ${Math.round(age)}ms`);
      }
      if (!atTop && !said.top && age > 3000 && touchAt < since) {
        said.top = true;
        note('NOT AT TOP', `y ${Math.round(y)}, 3s on`);
      }

      /* The rest reads the page's layout, so not on every frame. */
      frames += 1;
      if (frames % 6 === 0) {
        const more = document.querySelector('[aria-label="More navigation options"]');
        const open = more?.getAttribute('aria-expanded') === 'true';
        const backdrop = document.querySelector('[aria-label="Close More menu"]');
        if (backdrop && !open) {
          if (!backdropSince) backdropSince = now;
          if (now - backdropSince > 1500) note('BACKDROP STUCK', `${Math.round(now - backdropSince)}ms`);
        } else {
          backdropSince = 0;
        }

        /* The heading's lines slide up from under a mask as the page opens. */
        const line = document.querySelector('main h1 span span');
        const shift = line ? new DOMMatrixReadOnly(getComputedStyle(line).transform).m42 : 0;
        if (shift > 2 && !said.hero && age > 2500) {
          said.hero = true;
          note('HERO STUCK', `${Math.round(shift)}px down, ${Math.round(age)}ms on`);
        }

        const loading = document.querySelectorAll('main .animate-pulse').length;
        if (loading && !said.loading && age > 8000) {
          said.loading = true;
          note('STILL LOADING', `${loading} placeholders, 8s on`);
        }

        const hit = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
        slow = [
          `more ${open ? 'open' : 'closed'}  backdrop ${backdrop ? 'on' : 'off'}  under finger ${describe(hit)}`,
          `heading ${line ? (shift > 2 ? `${Math.round(shift)}px down` : 'in') : 'none'}  loading ${loading}`,
        ].join('\n');

        if (panel.current) {
          panel.current.textContent = [
            `${path}  y ${Math.round(y)} ${direction}  inner ${window.innerHeight}  page ${document.documentElement.scrollHeight}`,
            `worst frame ${Math.round(worst)}ms  scroll event ${Math.round(now - eventAt)}ms ago  motion ${now - motionAt > 1000 ? 'DEAD' : 'ok'}`,
            slow,
            '— noted —',
            ...notes,
          ].join('\n');
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      cancelFrame(beat);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
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
