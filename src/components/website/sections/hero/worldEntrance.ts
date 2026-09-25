'use client';

import gsap from 'gsap';

import { playAyatechIntro } from './ayatechIntro';
import type { WorldId } from './ChooseWorld';

interface TransitionOutOptions {
  veil: HTMLElement | null;
  air: HTMLElement | null;
  worldEl: HTMLElement | null;
  onComplete?: () => void;
}

interface EntranceOptions {
  world: WorldId;
  worldEl: HTMLElement;
  veil: HTMLElement | null;
  air: HTMLElement | null;
  onComplete?: () => void;
}

/**
 * Transitions OUT the currently active world using the liquid veil and atmosphere.
 * Blurs and flares the screen softly so the world can unmount behind the veil
 * without any visual pop or static flash.
 */
export function playWorldTransitionOut({
  veil,
  air,
  worldEl,
  onComplete,
}: TransitionOutOptions): gsap.core.Timeline {
  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tl = gsap.timeline({
    onComplete,
  });

  if (isReduced) {
    if (veil && air) gsap.set([veil, air], { autoAlpha: 1 });
    if (worldEl) gsap.set(worldEl, { opacity: 0 });
    return tl;
  }

  // Softly flare the liquid refraction veil and emerald air
  if (veil && air) {
    tl.to(
      [veil, air],
      {
        autoAlpha: 1,
        duration: 0.35,
        ease: 'power2.inOut',
      },
      0,
    );
  }

  // Softly dissolve the departing world container
  if (worldEl) {
    tl.to(
      worldEl,
      {
        opacity: 0,
        duration: 0.32,
        ease: 'power2.in',
      },
      0,
    );
  }

  return tl;
}

/**
 * Plays a short, cinematic INITIAL ENTRANCE ANIMATION for the newly mounted world.
 * Reveals the world's existing initial scene and finishes at the EXACT rest state
 * expected by its ScrollTrigger timeline.
 */
export function playWorldEntrance({
  world,
  worldEl,
  veil,
  air,
  onComplete,
}: EntranceOptions): gsap.core.Timeline {
  const isReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const tl = gsap.timeline({
    onComplete: () => {
      onComplete?.();
    },
  });

  if (isReduced) {
    if (veil && air) gsap.set([veil, air], { autoAlpha: 0 });
    gsap.set(worldEl, { opacity: 1, clearProps: 'transform,opacity' });
    return tl;
  }

  // 1. Gently clear the liquid veil and atmosphere over the newly arriving world
  if (veil && air) {
    tl.to(
      [veil, air],
      {
        autoAlpha: 0,
        duration: 0.45,
        ease: 'power2.out',
      },
      0,
    );
  }

  // 2. World container opacity fade-in (avoiding transform containing blocks on .world)
  tl.to(
    worldEl,
    {
      opacity: 1,
      duration: 0.65,
      ease: 'power2.out',
    },
    0,
  );

  // 3. World-specific element entrance animations
  if (world === 'ayatech') {
    /* AyaTech's intro runs on its own clock (ayatechIntro.ts): longer than
       this entrance, and it must not hold the switcher while it plays. */
    playAyatechIntro(worldEl);
  } else if (world === 'cloudversity') {
    animateCloudversityEntrance(tl, worldEl);
  }

  return tl;
}

/**
 * Cloudversity World Entrance:
 * Cinematic entrance that makes the user feel like they are stepping into the
 * Ayadi Cloudversity world. The 3D Ayadi emblem is the hero of the entrance,
 * supported by atmospheric ambient light, decorative elements, and smooth unified typography.
 */
function animateCloudversityEntrance(tl: gsap.core.Timeline, worldEl: HTMLElement) {
  const heroAct = (worldEl.querySelector('[data-hero]') || worldEl.querySelector('[data-act="hero"]')) as HTMLElement | null;
  const heroBody = (worldEl.querySelector('[data-hero-body]') || heroAct) as HTMLElement | null;
  const wash = worldEl.querySelector('[data-drift="wash"]');
  const ghost = worldEl.querySelector('[data-intro="ghost"]');
  const markLayer = worldEl.querySelector('[data-mark-layer]');
  const mark = worldEl.querySelector('[data-mark]');
  const markSheen = worldEl.querySelector('[data-mark-sheen]');
  const eyebrow = worldEl.querySelector('[data-intro="eyebrow"]');
  const rule = worldEl.querySelector('[data-intro="rule"]');
  const heading = worldEl.querySelector('h2');
  const lines = worldEl.querySelectorAll('p[data-intro="line"]');
  const ctaBtn = worldEl.querySelector('button[data-intro="line"]');
  const stats = worldEl.querySelectorAll('[data-intro="stat"]');

  // 1. [0.00s] Cloudversity Environment & Atmospheric Light
  // The ambient glowing emerald sphere blooms softly into the space
  if (wash) {
    gsap.set(wash, { autoAlpha: 0, scale: 0.65 });
    tl.to(
      wash,
      {
        autoAlpha: 1,
        scale: 1,
        duration: 1.2,
        ease: 'power2.out',
      },
      0.05,
    );
  }

  // Giant watermark ("AYADI") materializes softly in the background depth
  if (ghost) {
    gsap.set(ghost, { autoAlpha: 0, x: 24 });
    tl.to(
      ghost,
      {
        autoAlpha: 1,
        x: 0,
        duration: 1.15,
        ease: 'power2.out',
      },
      0.05,
    );
  }

  // Gentle upward glide on the main body container
  if (heroBody) {
    gsap.set(heroBody, { y: 16, scale: 0.988 });
    tl.to(
      heroBody,
      {
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: 'power2.out',
        clearProps: 'transform',
      },
      0,
    );
  }

  // 2. [0.15s] Main Ayadi 3D Visual (Hero of the Entrance)
  // Glides smoothly forward from perspective depth, rotating into its resting 3D angle
  if (markLayer) {
    gsap.set(markLayer, { autoAlpha: 1 });
  }

  if (mark) {
    gsap.set(mark, {
      autoAlpha: 0,
      scale: 0.8,
      rotationY: -46,
      rotationX: 18,
      z: -110,
      y: 22,
    });
    tl.to(
      mark,
      {
        autoAlpha: 1,
        scale: 1,
        rotationY: -20,
        rotationX: 7,
        z: 0,
        y: 0,
        duration: 1.05,
        ease: 'power3.out',
      },
      0.15,
    );
  }

  // Specular sheen sweep across the 3D mark as it settles into place
  if (markSheen) {
    tl.fromTo(
      markSheen,
      { left: '-100%', autoAlpha: 0 },
      {
        left: '200%',
        autoAlpha: 0.85,
        duration: 0.75,
        ease: 'power2.inOut',
      },
      0.4,
    );
  }

  // 3. [0.42s] Supporting Visual Elements Appear
  // Eyebrow and gradient accent line
  if (eyebrow) {
    gsap.set(eyebrow, { autoAlpha: 0, y: 10 });
    tl.to(
      eyebrow,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      },
      0.42,
    );
  }

  if (rule) {
    gsap.set(rule, { autoAlpha: 1, scaleX: 0, transformOrigin: 'left center' });
    tl.to(
      rule,
      {
        scaleX: 1,
        duration: 0.7,
        ease: 'power2.inOut',
      },
      0.48,
    );
  }

  // 4. [0.55s] Heading & Text Reveal (Unified, dignified entrance — NO blinking text!)
  if (heading) {
    gsap.set(heading, { autoAlpha: 0, y: 16 });
    tl.to(
      heading,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
      },
      0.55,
    );
  }

  // Tagline and lede paragraphs
  if (lines.length > 0) {
    gsap.set(lines, { autoAlpha: 0, y: 12 });
    tl.to(
      lines,
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: 'power2.out',
      },
      0.65,
    );
  }

  // 5. [0.75s] Supporting UI & Stats Settle
  // CTA Button
  if (ctaBtn) {
    gsap.set(ctaBtn, { autoAlpha: 0, y: 14, scale: 0.96 });
    tl.to(
      ctaBtn,
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'power2.out',
      },
      0.75,
    );
  }

  // Platform stats grid
  if (stats.length > 0) {
    gsap.set(stats, { autoAlpha: 0, y: 10 });
    tl.to(
      stats,
      {
        autoAlpha: 1,
        y: 0,
        stagger: 0.06,
        duration: 0.6,
        ease: 'power2.out',
      },
      0.82,
    );
  }
}
