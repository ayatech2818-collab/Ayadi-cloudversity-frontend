'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis, { type VirtualScrollData } from 'lenis';
import { useEffect } from 'react';

import { bindScroll } from '@/lib/smooth-scroll';

import 'lenis/dist/lenis.css';

/*
 * The public site's scroll, for a wheel or a touchpad, driven from the page's
 * own frame loop (Lenis) instead of by the browser.
 *
 * Why, when the browser's own scrolling is usually the smoother: because of
 * what this site is. Its journeys hold a stage still on screen and play a
 * WebGL scene and scrubbed timelines against the scroll position — all of it
 * drawn by this thread. The browser scrolls a wheel or a touchpad on another
 * one, and presents a frame of its own for every step: frames in which, here,
 * nothing can have moved, because what moves is ours to draw. They are not
 * free. Measured in Chrome on an integrated GPU with a touchpad's stream of
 * wheel events, two frames in three presented were the browser's alone, and
 * they took the GPU from the scene: it ran at 30–43 frames a second, one
 * frame in twenty 55–75ms late and the worst half a second, where the very
 * same scroll, made from this thread, runs at 50–72 with that one in twenty
 * at 21–28ms — and answers the first touch in about half the time. A held
 * arrow key did not feel that way, which is how it was found.
 *
 * So the wheel is taken here, and the page moved once per frame, on GSAP's
 * ticker, just before the timelines and the scene read where it is. That is
 * the whole of the gain; it does not come from smoothing, and almost none is
 * added (see "how closely", below).
 *
 *   One instance, for the whole public site. No loop of its own: it steps on
 *   GSAP's ticker, first in line, and tells ScrollTrigger at once — so a
 *   wheel, the page, the timeline and the scene are all the same frame.
 *
 *   Only for a wheel. Touch scrolls as it always did (the instance is not
 *   even made on a touch-first device: its listeners would only stand
 *   between a finger and the page). So do the keyboard and the scrollbar;
 *   the driver follows those.
 *
 *   Touch was driven from here too, for a while, and came back out. A
 *   phone's browser only slides its bars away for its own scrolling, so
 *   under the driver they stayed up — over the foot of every pinned stage,
 *   which is sized for the screen without them — and the browser's own
 *   momentum and pull-to-refresh are what a finger expects.
 *
 *   Not with reduced motion, which gets the browser's scrolling untouched.
 *
 *   Anything that scrolls inside the page scrolls itself (allowNestedScroll),
 *   and a locked page — a modal is open — is left alone.
 *
 * Code that moves the page goes through lib/smooth-scroll.ts.
 */

/** Where the wheel is ours: motion welcome, and a mouse or a touchpad to hand. */
const WHEEL = '(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)';

/* ---------- how closely the page follows the wheel ----------
   The share of the distance still to go that the page covers in a 60th of a
   second (Lenis's `lerp`).

   A touchpad sends a stream of small steps, and its own momentum after the
   fingers lift: that is already smooth, and anything laid over it is only
   delay. So it is followed as directly as the library allows — measured, the
   timelines then run no further behind the fingers than they do under the
   browser's own scrolling.

   A mouse wheel sends notches: a hundred pixels at a time, a few a second.
   The browser eases those when it does the scrolling; taken raw they are
   steps. So a notch is eased, over about what the browser takes.

   Which is which is told from how a gesture opens — after a pause, a first
   step of NOTCH pixels or more is a wheel's notch, and the gesture is a
   wheel's until the next pause; a touchpad's opens with a pixel or two. A
   wrong guess costs nothing worse than the other setting. */
const DIRECT = 1;
const EASED = 0.35;
/** The least a gesture's first step is, in pixels, for it to be a wheel's. */
const NOTCH = 45;
/** A gap this long between wheel events, in milliseconds, ends a gesture. */
const PAUSE = 150;

/** A page whose scroll has been locked (the modals do it on <body>). */
const isLocked = (node: HTMLElement) => node === document.body && document.body.style.overflow === 'hidden';

export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add(WHEEL, () => {
      let lastWheel = -Infinity;
      let notched = false;

      const lenis: Lenis = new Lenis({
        lerp: DIRECT,
        autoRaf: false,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        prevent: isLocked,
        virtualScroll: ({ deltaY, event }: VirtualScrollData) => {
          if (event.type === 'wheel') {
            if (event.timeStamp - lastWheel > PAUSE) notched = Math.abs(deltaY) >= NOTCH;
            lastWheel = event.timeStamp;
            lenis.options.lerp = notched ? EASED : DIRECT;
          }
          return true;
        },
      });
      lenis.on('scroll', ScrollTrigger.update);

      /* Prioritised: ahead of GSAP's own update, so this frame's timelines
         are built on this frame's scroll. */
      const step = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(step, false, true);
      bindScroll(lenis);

      return () => {
        bindScroll(null);
        gsap.ticker.remove(step);
        lenis.destroy();
      };
    });

    return () => media.revert();
  }, []);

  return null;
}
