import gsap from 'gsap';

import { rigOf } from './ayatech/rig';

/*
 * AyaTech's intro — the moment the world is entered from the other one.
 *
 * The reader has just come through light (worldEntrance.ts clears the veil).
 * What is left of that light, in the middle of a dark room, folds down into
 * a single point; the point catches, gutters, throws one wave, and holds.
 * That point is the signal the whole journey is about, at exactly the rest
 * state the scroll starts from (AyatechWorld.tsx) — the story has not begun,
 * it has only been lit.
 *
 * It runs on its own clock, never the scroll's, and never holds up the world
 * switcher. It only ever animates *from* a hidden state *to* what is already
 * there, so wherever it is cut short it lands on that rest state. Scrolling
 * hurries it, and scrolling on finishes it at once, before the journey's
 * first move; leaving the world stops it (stopAyatechIntro).
 *
 * Arriving by scrolling down out of the hero plays none of this: there the
 * hero's own light does the revealing, and the point is simply found.
 */

/* The beats, in seconds from the moment the world is entered. */
const BEAT = {
  fold: 0, // the light folds into a point
  catch: 0.8, // the point catches
  wave: 0.95, // …and throws one wave
  rail: 1.7, // where you are
  hint: 2.1, // the way on
};

/* How far the reader may scroll before the intro gives way at once rather
   than just hurrying — short of the journey's first words. */
const GIVE_WAY = 120;

const running = new WeakMap<Element, { finish: () => void; stop: () => void }>();

/** Leaving the world: stop its intro where it is, and let go of the page. */
export function stopAyatechIntro(section: Element | null) {
  if (section) running.get(section)?.stop();
}

/** Plays the intro over the AyaTech world inside `root`. */
export function playAyatechIntro(root: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const section = root.querySelector<HTMLElement>('[data-ayatech]');
  /* No rig, no stage: the world is standing as a plain page (reduced motion
     turned on mid-visit, or no canvas), and has nothing to light. */
  const rig = section ? rigOf(section) : undefined;
  if (!section || !rig) return null;
  /* Never two at once: one already under way lands on its rest state first,
     so this one starts from that. */
  running.get(section)?.finish();

  const part = (name: string) => gsap.utils.toArray<Element>(section.querySelectorAll(`[data-intro="${name}"]`));
  const settle = { ease: 'power2.out', clearProps: 'opacity,visibility,transform' };

  const tl = gsap.timeline();

  /* 1. What is left of the light folds down into the middle of the room. */
  const afterglow = part('afterglow');
  if (afterglow.length) {
    tl.fromTo(
      afterglow,
      { autoAlpha: 0.9, scale: 1 },
      { autoAlpha: 0, scale: 0.03, duration: 1.1, ease: 'power3.in', clearProps: 'opacity,visibility,transform' },
      BEAT.fold,
    );
  }

  /* 2. The point catches — dark from the first frame, lit by the end — and
        throws one wave as it does. The scene draws both (scene/signal.ts). */
  tl.fromTo(rig, { ignite: 0 }, { ignite: 1, duration: 1.3, ease: 'power2.out' }, BEAT.catch);
  tl.fromTo(rig, { surge: 1 }, { surge: 0, duration: 1.7, ease: 'power2.out', immediateRender: false }, BEAT.wave);

  /* 3. Where you are, and the way on. */
  const rail = part('hud');
  if (rail.length) tl.from(rail, { ...settle, autoAlpha: 0, y: 12, duration: 0.7 }, BEAT.rail);
  const hint = part('hint');
  if (hint.length) tl.from(hint, { ...settle, autoAlpha: 0, y: 8, duration: 0.6 }, BEAT.hint);

  /* ---------- giving way to the reader ---------- */
  const startY = window.scrollY;
  const hurry = () => {
    if (tl.timeScale() === 1) gsap.to(tl, { timeScale: 5, duration: 0.3, ease: 'power1.in' });
  };
  const onScroll = () => {
    const moved = Math.abs(window.scrollY - startY);
    if (moved > GIVE_WAY) tl.progress(1);
    else if (moved > 4) hurry();
  };

  const release = () => {
    window.removeEventListener('wheel', hurry);
    window.removeEventListener('touchmove', hurry);
    window.removeEventListener('scroll', onScroll);
    gsap.killTweensOf(tl);
    /* Wherever it stopped, the signal is lit: the journey starts from there. */
    rig.ignite = 1;
    rig.surge = 0;
    running.delete(section);
  };

  window.addEventListener('wheel', hurry, { passive: true });
  window.addEventListener('touchmove', hurry, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  tl.eventCallback('onComplete', release);
  running.set(section, {
    finish: () => tl.progress(1),
    stop: () => {
      tl.kill();
      release();
    },
  });

  return tl;
}
