'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis, { type VirtualScrollData } from 'lenis';
import { useEffect } from 'react';

import { bindScroll, releaseScroll } from '@/lib/smooth-scroll';

import 'lenis/dist/lenis.css';

/*
 * The public site's scroll — a wheel, a touchpad or a finger — driven from the
 * page's own frame loop (Lenis) instead of by the browser.
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
 * So the scroll is taken here, and the page moved once per frame, on GSAP's
 * ticker, just before the timelines and the scene read where it is. That is
 * the whole of the gain; it does not come from smoothing, and almost none is
 * added (see "how closely" and "a finger", below).
 *
 *   One instance, for the whole public site and every kind of device. No
 *   loop of its own: it steps on GSAP's ticker, first in line, and tells
 *   ScrollTrigger at once — so the gesture, the page, the timeline and the
 *   scene are all the same frame.
 *
 *   The keyboard and the scrollbar are still the browser's; the driver
 *   follows those.
 *
 *   Not with reduced motion, which gets the browser's scrolling untouched.
 *
 *   Anything that scrolls inside the page scrolls itself (allowNestedScroll),
 *   and a locked page — a modal is open — is left alone.
 *
 * Code that moves the page goes through lib/smooth-scroll.ts.
 */

/** Where the scroll is ours: wherever motion is welcome. */
const MOTION = '(prefers-reduced-motion: no-preference)';

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

/* ---------- a finger ----------
   On a phone or a tablet the page is driven the same way (Lenis's
   `syncTouch`). While the finger is down the page goes with it, one to one
   and as directly as it follows a touchpad. Lifted, it is thrown on and
   glides to rest; touched again, it stops where it is.

   The throw is this file's, not the library's. Left to itself the library
   works it out from how far the page moved in its last frame, which is not
   the finger's speed: half as much on a 120 Hz phone as on a 60 Hz one for
   the same swipe, and all but nothing if the finger lifts a frame after its
   last move, by when the page has caught up with it (measured: a 300px flick
   that coasted 18px). And what it makes of that speed falls away sharply
   for a gentle swipe, which then hardly coasts at all.

   So the speed is taken from the finger — its travel over the last RELEASE
   milliseconds of the touch, and nothing if it had come to rest first — and
   the page is carried on by as far as the finger would have gone in CARRY
   milliseconds at that speed, easing out over about a third of a second
   (GLIDE). That is the usual model of a phone's own momentum, a little on
   the short side of it: enough to feel like the platform, not enough to
   feel adrift. The library is handed the distance and the direction as the
   finger lifts (its exponent set to 1, so the number it reads is the
   distance), and does the gliding as it always does.

   Three kinds of touch are left to the browser: a second finger (that is a
   pinch), any touch while the page is zoomed in (that is panning round it),
   and a pull down from the very top (its pull-to-refresh, or its rubber
   band). A touch that is one of those is the browser's whole, from wherever
   it became one to the last finger lifting. */

/** How far back from the lift the finger's speed is taken over, milliseconds. */
const RELEASE = 100;
/** The most touch moves kept for that. */
const TRAIL = 32;
/** The throw: this many milliseconds' travel at the finger's speed as it lifted. */
const CARRY = 260;
/** How the throw is eased out, as `lerp` is: about a third of a second. */
const GLIDE = 0.05;
/** And never further than this many screens. */
const FURTHEST = 3;

/** How far to throw the page as the finger lifts, in pixels, from `trail` —
    the touch's moves as a flat list of time, step, time, step… */
function throwFor(trail: number[], liftedAt: number) {
  let since = -1;
  let travelled = 0;

  for (let i = 0; i < trail.length; i += 2) {
    if (liftedAt - trail[i] > RELEASE) continue;
    /* The first move in the window only says when it starts. */
    if (since < 0) since = trail[i];
    else travelled += trail[i + 1];
  }
  if (since < 0 || liftedAt <= since) return 0;

  const reach = window.innerHeight * FURTHEST;
  return Math.min(Math.max((travelled / (liftedAt - since)) * CARRY, -reach), reach);
}

/** Whether the page has been pinched in. */
const isZoomed = () => (window.visualViewport?.scale ?? 1) > 1.01;

/** A page whose scroll has been locked (the modals do it on <body>). */
const isLocked = (node: HTMLElement) => node === document.body && document.body.style.overflow === 'hidden';

export function SmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add(MOTION, () => {
      let lastWheel = -Infinity;
      let notched = false;
      /* Whether the touch in hand is the browser's; null until it has shown which. */
      let theirs: boolean | null = null;
      /* That touch's latest moves: time, step, time, step… */
      const trail: number[] = [];
      /* Whether the last thing to move the page was a finger lifting off it. */
      let thrown = false;

      const lenis: Lenis = new Lenis({
        lerp: DIRECT,
        syncTouch: true,
        syncTouchLerp: GLIDE,
        touchInertiaExponent: 1,
        autoRaf: false,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        prevent: isLocked,
        virtualScroll: (step: VirtualScrollData) => {
          const { deltaY, event } = step;

          if (event.type === 'wheel') {
            thrown = false;
            if (event.timeStamp - lastWheel > PAUSE) notched = Math.abs(deltaY) >= NOTCH;
            lastWheel = event.timeStamp;
            lenis.options.lerp = notched ? EASED : DIRECT;
            return true;
          }

          if (event.type === 'touchstart') {
            thrown = false;
            theirs = null;
            trail.length = 0;
            return true;
          }

          if (('touches' in event && event.touches.length > 1) || isZoomed()) theirs = true;
          else if (theirs === null && deltaY !== 0) theirs = deltaY < 0 && lenis.actualScroll <= 0;
          if (theirs) return false;

          if (event.type === 'touchmove') {
            if (trail.length >= TRAIL * 2) trail.splice(0, 2);
            trail.push(event.timeStamp, deltaY);
          } else {
            /* Lifted. The library reads two things next (lenis 1.3): `velocity`,
               as how far to throw the page, and this step, as which way. Left
               alone the step is the finger's very last move — and a finger
               rolls back a pixel as it lifts, which would turn the whole throw
               round — so it is given the throw's own direction. The throw is
               trimmed to land on a whole pixel: the glide ends when it rounds
               to where it is going, and short of a fraction it creeps for
               seconds. */
            const carry = throwFor(trail, event.timeStamp);
            const landing = carry === 0 ? 0 : Math.round(lenis.targetScroll + carry) - lenis.targetScroll;
            lenis.velocity = landing;
            step.deltaY = landing;
            thrown = landing !== 0;
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

      /* A thrown page takes a couple of seconds to come to rest completely,
         and for as long as it is gliding it is the driver's: anything the
         browser scrolls in that time is put straight back. A key pressed, or
         a step back or forward through history (which restores where that
         page was), is the browser about to scroll — so the glide ends there,
         where it is, and the driver goes back to following. Only a finger's
         throw lasts long enough to need this; a wheel's is left as it was. */
      const yieldToBrowser = () => {
        if (thrown && lenis.isScrolling === 'smooth') releaseScroll();
      };
      window.addEventListener('keydown', yieldToBrowser, { passive: true });
      window.addEventListener('popstate', yieldToBrowser);

      return () => {
        window.removeEventListener('keydown', yieldToBrowser);
        window.removeEventListener('popstate', yieldToBrowser);
        bindScroll(null);
        gsap.ticker.remove(step);
        lenis.destroy();
      };
    });

    return () => media.revert();
  }, []);

  return null;
}
