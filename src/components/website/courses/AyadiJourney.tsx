'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown, Plus } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useEffect, useLayoutEffect, useRef } from 'react';

import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import { AyadiMark3D } from './AyadiMark3D';
import { JourneyImage } from './JourneyImage';
import { brandById } from './brands';
import { collageItems, learningWorlds } from './journey';
import type { BrandId } from './types';

/* useLayoutEffect warns during SSR, but the layout swap below has to land
   before paint or the acts flash stacked. Swap the hook, not the timing. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* Ayadi Cloudversity — the one brand this journey is about. */
const brand = brandById.ayadi;

/* Act one's headline, a word at a time: each slides out of its own mask, and
   the last one wears the brand gradient. */
const headline = brand.tagline.split(' ');

/* ---------- the score ----------
   Positions on the scrubbed timeline, in arbitrary units. HOLD is how long a
   scene sits still and readable; FADE is how long a crossfade takes. Retune the
   pacing here rather than in the tweens. */
const HOLD = 1.3;
const FADE = 0.7;

const HERO_END = HOLD + FADE;
const COLLAGE_IN = HERO_END - 0.3;
const COLLAGE_OUT = COLLAGE_IN + 2.5;
const GRID_IN = COLLAGE_OUT + 0.6;

/* Act three shows the four categories one at a time, each blown up in the middle
   of the row, before they all fan out into the grid they belong in.
   GRID_SPOT_STEP is how much scroll one subject owns: it arrives, holds, and
   leaves inside that. */
const GRID_SPOT_IN = GRID_IN + 0.6;
const GRID_SPOT_STEP = 0.5;
const GRID_SPOT_OUT = GRID_SPOT_IN + learningWorlds.length * GRID_SPOT_STEP;
const TOTAL = GRID_SPOT_OUT + 1.9;

/* How much scroll the sequence owns, as a percentage of the screen. 440% was
   tuned for a 10.3-unit score (six subjects then); it scales with TOTAL, so
   every unit of the score — act one's hold included — keeps that pace. */
const TRAVEL = Math.round((TOTAL * 440) / 10.3);

/* How far a tile blows up while it holds the centre. 1.85 is the most the
   widest layout takes without the card running past the grid it sits in —
   which is why four tiles are a 2×2 grid at the old three-column tile size
   rather than one row, where a blown-up tile would cover the heading.
   Re-check it if the grid's shape changes. */
const TILE_SHOWCASE = 1.85;

/* A tile's comet laps its border on a CSS keyframe — along a path, which no
   browser moves off the main thread — and there are three dots to a comet and
   six comets. Left running, those eighteen cost a style pass and a repaint
   every frame for as long as the journey is mounted, seen or not: measured,
   they alone kept a phone-speed main thread fully busy with the page at
   rest, which is time the scrubbed timeline does not then get — the page
   goes on scrolling (the browser does that itself) and the acts stand still.
   So a comet's dots only run while its tile holds the light: this property
   is written on the comet as it shows and goes (lapComets), and the dots
   read it. Without the timeline (the flow layout) a comet is never shown,
   and never runs. */
const COMET = '--comet';
const COMET_STATE = `var(${COMET}, paused)`;

/* Where every tile ends up: its own slot in the grid, untransformed. autoAlpha
   rather than opacity so this one tween also brings it out of hidden. */
const TILE_EVEN = { filter: 'blur(0px)', autoAlpha: 1, x: 0, y: 0, scale: 1, zIndex: 1 };

/* Act one's padding and column grid, shared with the brand-mark layer that
   overlays it. The mark has to land in the column the copy leaves empty, so the
   two measure from one source. A phone's stage is short, so there the acts
   keep less of it to themselves. */
const ACT_PADDING = 'px-5 py-8 pb-14 max-sm:py-5 max-sm:pb-12 sm:px-8 sm:py-10 sm:pb-16 lg:px-12';
const HERO_GRID = 'mx-auto grid w-full max-w-[1180px] items-center gap-12 lg:grid-cols-[1.12fr_0.88fr]';

/* The card the acts play inside: rounded, lifted off the page and clipping
   its own contents, so the collage can fly outward without spilling across
   the section. The Home page passes `bare` and keeps only the clipping —
   there the journey is not a panel on a page, it is the world you have
   walked into, and a card edge would say otherwise. */
const CARD =
  'mx-4 my-10 rounded-[24px] bg-linear-to-b from-white via-[#f7fbf9] to-white shadow-[0_50px_120px_-55px_rgba(20,29,63,0.45)] ring-1 ring-inset ring-border/70 sm:mx-6 sm:rounded-[32px]';

/* The collage's box, shared by the 3D plane and the flat overlay that sits on
   top of it. Both have to measure the same or the script and the sparks drift
   off the cluster. Wide (12:5) so nine cards get room and air across the
   stage, as wide as a laptop or a wide monitor allows; capped at 156svh wide,
   which is 65svh tall, so it still fits a pinned act with its padding. */
const COLLAGE_BOX = 'sm:aspect-[12/5] sm:w-[min(100%,156svh)]';

/* ---------- on a phone ----------
   The same three acts on the same score, on a stage the size of a phone.

   PHONE_TRAVEL is how much scroll the sequence owns there, in small-viewport
   heights — the same TRAVEL the wide layout pins for.

   The collage is the same free-floating cluster, in a box that stands upright
   (5:7) because the stage does. Its width is capped against the stage's height
   — the navbar's 84px, the act's own padding and a little air come off first —
   so it always fits; each card's place in it is `phone` in journey.ts, and the
   script runs centred across the top, above them. The cards drift less, and
   less still in a smaller box, so the cluster holds together. */
const PHONE_TRAVEL = TRAVEL;
const PHONE_BOX = { aspectRatio: '5 / 7', width: 'min(100%, calc((100svh - 160px) / 1.4))' };

/* The soft lights behind the acts — a wash in act one, four behind the
   collage — are plain shapes under a very large CSS blur. Safari only blurs
   on the GPU what has a compositing layer of its own, and a filter does not
   earn an element one (FilterTrigger is not among WebKit's compositing
   triggers): left alone, each of these is blurred on the CPU, into its act's
   own picture, every time that picture is drawn again — and an act's is drawn
   again whenever the act comes back from hidden. At a phone's three pixels to
   one that is a region some thousands of pixels square, and long enough to
   stop the timeline where it stands: arriving at the collage on the way down,
   and — where it was reported, on an iPhone — coming back to it from the
   first subject on the way up. `will-change` gives each a layer, and the blur
   goes to the GPU. On a phone's stage only; nothing else is asked to change. */
const SOFT = 'max-md:will-change-transform';
const PHONE_SCRIPT = { left: '0%', top: '2%', width: '100%' };
const PHONE_DRIFT = 0.5;
/** The box width the phone places and that drift were laid out at, px. */
const PHONE_BOX_AT = 350;

/* The brand mark has no column of its own on a phone, so there it is the
   watermark from the start: behind the copy, dimmed (`opacity`), and turning
   with the scroll exactly as it does on a wide stage. `across` is where it
   goes as it crosses into act two — it still swells and settles, but not as
   far or as large as on a wide stage, which it would overflow. */
const PHONE_MARK = { opacity: 0.22, across: { xPercent: -6, scale: 1.45, opacity: 0.18 } };

/* Small marks scattered around the cluster, as in the reference. Positions are
   percentages of the collage box, not the section. */
const SPARKS = [
  { position: 'sm:left-[19%] sm:top-[26%]', size: 14, delay: '0s' },
  { position: 'sm:left-[91%] sm:top-[80%]', size: 11, delay: '0.9s' },
  { position: 'sm:left-[95%] sm:top-[18%]', size: 13, delay: '1.6s' },
  { position: 'sm:left-[31%] sm:top-[92%]', size: 10, delay: '2.3s' },
];

/*
 * Ayadi Cloudversity, as a pinned three-act sequence.
 *
 * Act one is the arrival: one headline and one way in. Act two drops the
 * copy for a floating photo collage. Act three spreads that collage outward
 * and lands on the subject grid. One ScrollTrigger drives all of it with
 * `scrub`, so the scene is wherever the reader's scroll position says it is —
 * nothing autoplays.
 *
 * The markup ships in normal document flow: three acts stacked down the page,
 * everything visible, no transforms. GSAP stacks them only after checking that
 * motion is welcome, which means the section is complete without JS and
 * degrades to plain sections otherwise.
 *
 * A phone held upright gets the same sequence on the same score. Only how it
 * is held differs: a wide screen is pinned by ScrollTrigger; a phone's stage
 * is `position: sticky` inside a section that much taller, so the browser
 * holds it and a finger never feels a script catching up. Its acts are laid
 * out for a stage that size (see "on a phone" above). Held sideways there is
 * no room for a stage at all, and the blocks simply arrive as they scroll in.
 *
 * A pinned act cannot scroll, so everything in one has to fit inside 100svh on
 * a laptop. That constraint — not taste — sets the type scale and the collage
 * sizing below; check it again before adding a line to any act. On a phone
 * the `max-sm:` sizes do the same job, and an act that is still too tall for
 * a short screen is scaled down whole to fit.
 */
export function AyadiJourney({
  onSelectBrand,
  bare = false,
}: {
  onSelectBrand: (id: BrandId) => void;
  /** Without the card around it — see CARD above. */
  bare?: boolean;
}) {
  const scope = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context((self) => {
      const q = self.selector!;
      const media = gsap.matchMedia();

      /* ---------- the opening ----------
         Scrubbed like acts two and three, so it builds and un-builds with the
         scroll wheel every time rather than firing once and staying put.

         It runs on the approach — from the section coming into view to its top
         reaching the top of the viewport — which is the stretch of scroll the
         pinned timeline cannot use, since that one only starts once the section
         is locked. By the time the pin takes hold the hero is fully composed.

         Every target here is a child of the hero. The pinned timeline further
         down only ever animates the hero itself, so the two never touch the
         same property. */
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const sectionEl = scope.current;
        if (!sectionEl) return;

        const words = q('[data-intro-word]');

        if (bare) {
          /* When bare (embedded in the Hero), the journey is revealed in place
             at top: 84px through the liquid veil. All intro elements are pre-composed
             at rest so there is zero bottom-to-top travel or internal scrub. */
          gsap.set(q('[data-intro]'), { autoAlpha: 1, y: 0 });
          gsap.set(words, { yPercent: 0 });
          gsap.set(q('[data-card]'), { autoAlpha: 1, y: 0, scale: 1 });
          gsap.set(q('[data-mark]'), { autoAlpha: 1, rotationY: -20, rotationX: 7, z: 0 });
          return;
        }

        gsap.set(q('[data-intro]'), { autoAlpha: 0, y: 18 });
        gsap.set(words, { yPercent: 115 });
        gsap.set(q('[data-mark]'), { autoAlpha: 0, rotationY: -52, rotationX: 16, z: -160 });

        gsap
          .timeline({
            /* power2 rather than expo: under a scrub an expo.out spends most of
               its travel in the first sliver of scroll, which reads as a snap. */
            defaults: { ease: 'power2.out' },
            scrollTrigger: { trigger: sectionEl, start: 'top 92%', end: 'top 84px', scrub: 1 },
          })
          /* The card lands first; the copy only starts arriving once there is
             something for it to arrive into. */
          .fromTo(
            q('[data-card]'),
            { autoAlpha: 0, y: 48, scale: 0.97 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out' },
          )
          .to(words, { yPercent: 0, duration: 1.1, stagger: 0.09 }, '-=0.45')
          .to(q('[data-intro="line"]'), { autoAlpha: 1, y: 0, duration: 0.75 }, '-=0.6')
          .to(q('[data-intro="ghost"]'), { autoAlpha: 1, y: 0, duration: 1.5 }, '-=1.6')
          .to(
            q('[data-mark]'),
            { autoAlpha: 1, rotationY: -20, rotationX: 7, z: 0, duration: 1.4, ease: 'power3.out' },
            '-=1.35',
          );
      });

      media.add(
        {
          motion: '(prefers-reduced-motion: no-preference)',
          wide: '(min-width: 768px)',
          upright: '(orientation: portrait)',
        },
        (mediaContext) => {
          const {
            motion: allowMotion,
            wide,
            upright,
          } = mediaContext.conditions as { motion: boolean; wide: boolean; upright: boolean };
          if (!allowMotion) return;

          const hero = q('[data-hero]');
          const cards = q('[data-collage-card]') as HTMLElement[];
          const script = q('[data-script]');
          const heads = q('[data-grid-head]');
          const tiles = q('[data-grid-card]') as Element[];
          /* Same DOM order as the tiles, so one index addresses both. */
          const comets = q('[data-tile-comet]') as Element[];

          /* ---------- a small screen on its side: no stage ----------
             A phone held sideways has a stage a few hundred pixels tall, which
             no act fits. Reveal each block as it arrives instead and leave the
             page scrolling normally.

             The hero is left out: it has its own entrance above, at every
             width. */
          if (!wide && !upright) {
            [...cards, ...script, ...heads, ...tiles, ...q('[data-grid-cta]')].forEach((element) => {
              gsap.from(element, {
                autoAlpha: 0,
                y: 30,
                duration: 0.7,
                ease: 'power3.out',
                scrollTrigger: { trigger: element, start: 'top 85%', once: true },
              });
            });

            return;
          }

          const sectionEl = scope.current;
          const stageEl = stage.current;
          if (!sectionEl || !stageEl) return;

          const followScroll = () => ScrollTrigger.update();

          /* ---------- cinematic layout ----------
             Collapse the three acts onto one screen. matchMedia reverts these on
             cleanup, so crossing the breakpoint or turning motion off restores
             the flow layout. */
          /* 84px is the clearance the sticky brand tabs below already use for
             the fixed navbar, so the card's top edge lands clear of it. */
          if (wide) {
            gsap.set(stageEl, { height: 'calc(100svh - 84px)', overflow: 'hidden' });
          } else {
            /* A phone: the section is the stage plus the scroll the sequence
               owns, and the stage sticks under the navbar for the length of
               it. Nothing is pinned by script.

               The stage is as tall as the screen is at that moment (dvh), so
               it reaches the foot of the screen whether the browser's bars
               are up or away. The scroll the sequence owns is still counted
               in small viewports, and the section is the two added together:
               it grows and shrinks with the stage, so the distance the stage
               stays stuck for — which is what the trigger below measures —
               is the same whatever the bars are doing. */
            const screen = typeof CSS !== 'undefined' && CSS.supports('height', '100dvh') ? '100dvh' : '100svh';
            gsap.set(sectionEl, { height: `calc(${screen} + ${PHONE_TRAVEL}svh - 84px)` });
            gsap.set(stageEl, { position: 'sticky', top: 84, height: `calc(${screen} - 84px)`, overflow: 'hidden' });

            /* On the Home page the stage is the page's colour too, not
               see-through. iOS paints the strip behind its own toolbar in the
               background colour of whatever is stuck to that edge of the
               screen; this stage had none to give, and on an iPhone the strip
               stayed as dark as the hero's night sky had left it — the
               journey looked cut off above a dark band. (With a card round it
               the stage stays clear: what is behind it there is not ours to
               assume.) */
            if (bare) gsap.set(stageEl, { backgroundColor: getComputedStyle(document.body).backgroundColor });

            /* And the acts follow the page every frame, not only when the
               browser says it has scrolled. ScrollTrigger moves a timeline
               when a scroll event arrives; a phone scrolls on a thread of its
               own and sends that word afterwards, and when it comes late or
               not at all — changing direction, say, as the browser's bars
               slide back in — ScrollTrigger does not find out by itself (its
               own re-check, four times a second, reads a cached position).
               update() reads the real one. */
            gsap.ticker.add(followScroll);

            /* The collage: out of its grid and into the upright box, each card
               to its own place. The flat tilt is the CSS `rotate` the wider
               layouts get from a class, so it composes with GSAP's transforms
               the same way. */
            gsap.set(q('[data-plane-inner]'), { display: 'block', marginLeft: 'auto', marginRight: 'auto', ...PHONE_BOX });
            cards.forEach((card, index) => {
              const at = collageItems[index]?.phone;
              if (!at) return;
              gsap.set(card, { position: 'absolute', left: `${at.left}%`, top: `${at.top}%`, width: `${at.width}%` });
              card.style.rotate = `${at.tilt}deg`;
            });

            /* And the script over it rather than under it, as from `sm` up. */
            gsap.set(q('[data-script-layer]'), {
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              marginTop: 0,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            });
            gsap.set(q('[data-script-box]'), PHONE_BOX);
            gsap.set(script, { position: 'absolute', textAlign: 'center', ...PHONE_SCRIPT });

            /* The mark: its layer is only laid out from `lg` up, where it has
               a column to stand in. Here it is laid out as well, behind
               everything, and dimmed from the first frame (PHONE_MARK). */
            gsap.set(q('[data-mark-layer]'), { display: 'flex' });
            gsap.set(q('[data-mark-travel]'), { opacity: PHONE_MARK.opacity });
          }
          /* The breath between the card's edge and the stage's. Without a
             card there is no edge, and the acts take the whole screen. */
          const inset = bare ? 0 : 14;
          gsap.set(q('[data-card]'), {
            position: 'absolute',
            margin: '0px',
            top: inset,
            right: inset,
            bottom: inset,
            left: inset,
            width: 'auto',
            height: 'auto',
          });
          gsap.set(q('[data-stack]'), { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' });

          /* ---------- the acts have to fit ----------
             The copy and the category grid are as tall as their text makes
             them; where that is more than a short screen's stage holds, the
             block is scaled down whole. On a phone both; on a wide screen
             only the grid, whose tiles are sized for a tall one. CSS `scale`, so it sits under whatever
             GSAP does to the same element, and measured from layout heights,
             which no transform changes. Again on every refresh.

             Fitted to the stage at its shortest — the browser's bars up —
             whatever it is when this runs: fitted to a taller one, an act
             would be cut each time the bars came back. */
          const fitted = q(wide ? '[data-grid-body]' : '[data-hero-body], [data-grid-body]') as HTMLElement[];
          const fit = () => {
            if (!fitted.length) return;

            /* How much taller the stage is now than it ever gets short. */
            const ruler = document.createElement('div');
            ruler.style.cssText = 'position:absolute;visibility:hidden;width:0;height:calc(100svh - 84px)';
            stageEl.appendChild(ruler);
            const spare = Math.max(0, stageEl.offsetHeight - ruler.offsetHeight);
            ruler.remove();

            for (const body of fitted) {
              const act = body.parentElement;
              if (!act) continue;
              const padding = getComputedStyle(act);
              const room = act.clientHeight - spare - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
              const needed = body.offsetHeight;
              body.style.scale = needed > room && needed > 0 && room > 0 ? (room / needed).toFixed(3) : '';
            }
          };
          fit();

          const collageAct = q('[data-act="collage"]');
          const gridAct = q('[data-act="grid"]');
          const rail = q('[data-rail]');
          const bar = q('[data-bar]');

          /* ---------- rest states ---------- */
          gsap.set([collageAct, gridAct], { autoAlpha: 0 });

          /* Cards start tipped away and pushed back down the z axis, so they
             arrive out of depth rather than just fading up. The flat `rotate`
             on each card is CSS, which composes with these without either side
             overwriting the other. */
          gsap.set(cards, { autoAlpha: 0, yPercent: 22, scale: 0.86, rotationX: -20, rotationY: 14, z: -220 });
          gsap.set(script, { autoAlpha: 0, yPercent: 26 });
          gsap.set(heads, { autoAlpha: 0, y: 28 });
          gsap.set(tiles, { autoAlpha: 0 });
          gsap.set(q('[data-grid-cta]'), { autoAlpha: 0, y: 18 });
          gsap.set(comets, { opacity: 0 });
          gsap.set([rail, q('[data-mark-layer]')], { autoAlpha: 1 });
          gsap.set(bar, { scaleX: 0, transformOrigin: 'left center' });

          /* A comet's lap runs only while the comet can be seen (COMET). Read
             off its opacity each time the timeline moves, rather than written
             by the timeline at set moments: so it is right whichever way the
             scroll gets there, and after a refresh has taken the timeline
             apart and put it back. */
          const lapping = comets.map(() => false);
          const lapComets = () => {
            comets.forEach((comet, index) => {
              const shown = Number((comet as HTMLElement).style.opacity) > 0;
              if (shown === lapping[index]) return;
              lapping[index] = shown;
              (comet as HTMLElement).style.setProperty(COMET, shown ? 'running' : 'paused');
            });
          };

          const timeline = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            onUpdate: lapComets,
            scrollTrigger: wide
              ? {
                  trigger: sectionEl,
                  start: 'top 84px',
                  end: `+=${TRAVEL}%`,
                  pin: true,
                  scrub: 1.2,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                  onRefresh: fit,
                }
              : {
                  /* No pin: the stage is sticky (above). The trigger only maps
                     the section's scroll onto the timeline, from the stage
                     locking under the navbar to the moment it lets go. */
                  trigger: sectionEl,
                  start: 'top 84px',
                  end: () => `bottom ${84 + stageEl.offsetHeight}px`,
                  scrub: 1.2,
                  invalidateOnRefresh: true,
                  onRefresh: fit,
                },
          });

          /* ---------- act one: the platform ----------
             The approach timeline has already built it, so this act starts
             composed. But a completely still hold reads as a stuck page — there
             is a stretch of scroll here between the build finishing and the fade
             starting — so the layers keep drifting at their own rates the whole
             way through. Scrolling always changes something.

             The drift uses `yPercent` and `x` where the approach used `y`. GSAP
             tracks those separately and composes them, so neither timeline has
             to know what the other left behind. */
          timeline
            .to(q('[data-hero-body]'), { yPercent: -8, duration: HOLD, ease: 'none' }, 0)
            /* Spins on its own element so it never contends with the
               entrance, which owns the rotation on [data-mark]. */
            .fromTo(
              q('[data-mark-spin]'),
              { rotationY: 0, rotationX: 0 },
              { rotationY: 34, rotationX: -9, duration: HOLD, ease: 'none' },
              0,
            )
            .fromTo(q('[data-mark-sheen]'), { xPercent: 0 }, { xPercent: 220, duration: HOLD, ease: 'none' }, 0)
            .to(q('[data-mark-travel]'), { yPercent: -5, duration: HOLD, ease: 'none' }, 0)
            /* The watermark slides left to right behind the mark as the
               scroll goes on — against the copy's upward drift, and slower
               than the mark, so the two read as separate depths. */
            .fromTo(q('[data-intro="ghost"]'), { x: -160 }, { x: 60, duration: HOLD + FADE, ease: 'none' }, 0)
            .to(q('[data-drift="wash"]'), { x: -70, y: 130, duration: HOLD, ease: 'none' }, 0)
            .to(hero, { autoAlpha: 0, yPercent: -8, duration: FADE }, HOLD);

          /* ---------- act two: the collage ---------- */
          timeline
            .to(collageAct, { autoAlpha: 1, duration: 0.3 }, COLLAGE_IN - 0.3)
            .to(
              cards,
              {
                autoAlpha: 1,
                yPercent: 0,
                scale: 1,
                rotationX: 0,
                rotationY: 0,
                /* Each card settles at its own depth, so the cluster keeps a
                   front and a back after it has landed. */
                z: (index: number) => collageItems[index]?.depth ?? 0,
                duration: 1,
                /* A total rather than a step, so the last card lands at the
                   same moment however many there are and the hold keeps its
                   length. */
                stagger: { amount: 0.56 },
                ease: 'power3.out',
              },
              COLLAGE_IN,
            )
            .to(script, { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: 'power3.out' }, COLLAGE_IN + 0.6);

          /* ---------- the mark crosses into act two ----------
             It does not leave with the hero — it drops back, swells and dims
             into a watermark behind the photographs. Everything it does between
             acts rides on [data-mark-travel]; [data-mark-spin] keeps the
             rotation, so neither tween has to know about the other. On a
             phone it is that watermark already, and only swells a little. */
          timeline
            .to(
              q('[data-mark-travel]'),
              {
                ...(wide ? { xPercent: -34, scale: 2.2, opacity: 0.18 } : PHONE_MARK.across),
                yPercent: 8,
                duration: 0.9,
                ease: 'power2.inOut',
              },
              COLLAGE_IN - 0.2,
            )
            .to(
              q('[data-mark-spin]'),
              { rotationY: 96, rotationX: -14, duration: COLLAGE_OUT - COLLAGE_IN, ease: 'none' },
              COLLAGE_IN,
            );

          /* A slow camera move across the whole act. It lives on the inner
             plane because the outer one is reserved for the pointer. */
          timeline.fromTo(
            q('[data-plane-inner]'),
            { rotationX: 5, rotationY: 8 },
            { rotationX: -3, rotationY: -6, duration: COLLAGE_OUT - COLLAGE_IN, ease: 'none' },
            COLLAGE_IN,
          );

          /* Parallax. `y` in pixels rather than `yPercent`, so it composes with
             the entrance above instead of fighting it for the same property.
             A phone's cluster is smaller and closer set, so it drifts less
             there — measured against the box, on every refresh. */
          const driftOf = (index: number) => collageItems[index]?.drift ?? -50;
          const phoneDrift = () => {
            const box = cards[0]?.offsetParent as HTMLElement | null;
            return PHONE_DRIFT * Math.min(1, (box?.offsetWidth ?? PHONE_BOX_AT) / PHONE_BOX_AT);
          };

          cards.forEach((card, index) => {
            timeline.to(
              card,
              {
                y: wide ? driftOf(index) : () => driftOf(index) * phoneDrift(),
                duration: COLLAGE_OUT - COLLAGE_IN,
                ease: 'none',
              },
              COLLAGE_IN + 0.2,
            );
          });

          /* ---------- the hand-off: the collage spreads outward ---------- */
          cards.forEach((card, index) => {
            const spread = collageItems[index]?.spread ?? { x: 0, y: 0 };

            timeline.to(
              card,
              {
                xPercent: spread.x,
                yPercent: spread.y,
                /* Forward past the camera rather than scaled up — under the
                   shared perspective that reads as the cluster opening out. */
                z: 340,
                rotationY: spread.x > 0 ? -14 : 14,
                autoAlpha: 0,
                duration: 0.9,
                ease: 'power2.in',
              },
              COLLAGE_OUT,
            );
          });

          timeline
            .to(script, { autoAlpha: 0, yPercent: -18, duration: 0.6 }, COLLAGE_OUT)
            .to(collageAct, { autoAlpha: 0, duration: 0.3 }, COLLAGE_OUT + 1);

          /* ---------- act three: the learning worlds ---------- */
          timeline
            .to(gridAct, { autoAlpha: 1, duration: 0.3 }, GRID_IN - 0.3)
            .to(heads, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, GRID_IN);

          /* ---------- one subject at a time, centre stage ----------
             Each tile leaves its slot for the middle of the row, blown up with a
             comet running its border, holds, then blurs away as the next takes
             over. The last one stays: the grid assembles around it.

             The trip to the centre is measured from `offsetLeft`/`offsetTop`,
             which are layout values and so unaffected by the transforms GSAP is
             writing at the same time. They are function-based, and the trigger
             runs `invalidateOnRefresh`, so a resize re-measures rather than
             flinging the tiles at stale coordinates.

             The comet's lap is a CSS keyframe that never stops — GSAP only fades
             it in. Scrubbing its position instead would freeze the comet
             mid-edge the moment the reader stopped scrolling, which is the one
             thing a highlight must not do. */
          const offsetToCentre = (axis: 'x' | 'y') => (_index: number, target: Element) => {
            const tile = target as HTMLElement;
            const row = tile.offsetParent as HTMLElement | null;
            if (!row) return 0;

            return axis === 'x'
              ? row.offsetWidth / 2 - (tile.offsetLeft + tile.offsetWidth / 2)
              : row.offsetHeight / 2 - (tile.offsetTop + tile.offsetHeight / 2);
          };

          const centreX = offsetToCentre('x');
          const centreY = offsetToCentre('y');

          tiles.forEach((tile, index) => {
            const at = GRID_SPOT_IN + index * GRID_SPOT_STEP;
            const beat = GRID_SPOT_STEP * 0.36;
            const isLast = index === tiles.length - 1;

            timeline
              .fromTo(
                tile,
                {
                  autoAlpha: 0,
                  x: centreX,
                  y: (i: number, target: Element) => centreY(i, target) + 46,
                  scale: TILE_SHOWCASE * 0.9,
                  filter: 'blur(9px)',
                  zIndex: 3,
                },
                {
                  autoAlpha: 1,
                  x: centreX,
                  y: centreY,
                  scale: TILE_SHOWCASE,
                  filter: 'blur(0px)',
                  zIndex: 3,
                  duration: beat,
                  ease: 'power3.out',
                  immediateRender: false,
                },
                at,
              )
              .to(comets[index], { opacity: 1, duration: beat, ease: 'power2.out' }, at);

            /* The last subject holds the centre and becomes part of the grid
               below, rather than leaving and coming back. */
            if (!isLast) {
              timeline
                .to(
                  tile,
                  {
                    autoAlpha: 0,
                    scale: TILE_SHOWCASE * 1.06,
                    filter: 'blur(9px)',
                    duration: beat,
                    ease: 'power2.in',
                  },
                  at + GRID_SPOT_STEP * 0.64,
                )
                .to(comets[index], { opacity: 0, duration: beat, ease: 'power2.in' }, at + GRID_SPOT_STEP * 0.64);
            }
          });

          /* ---------- and the grid assembles ----------
             Every tile is still parked at the centre, so they all fly out to
             their own slots at once — the showcase turning into the row rather
             than being replaced by it. */
          timeline
            .to(comets[comets.length - 1], { opacity: 0, duration: 0.4, ease: 'power2.in' }, GRID_SPOT_OUT)
            .to(
              tiles,
              { ...TILE_EVEN, duration: 0.8, stagger: 0.07, ease: 'power3.out' },
              GRID_SPOT_OUT,
            )
            .to(
              q('[data-grid-cta]'),
              { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power3.out' },
              GRID_SPOT_OUT + 1.1,
            );

          /* ---------- and turns through act three ----------
             The hand-off into the subject grid is the one moment the mark has
             nothing to compete with, so it takes a full revolution and keeps
             going, slowing as the grid settles. Sequential with the act-two
             rotation above, so one property, one writer at a time. */
          timeline.to(
            q('[data-mark-spin]'),
            { rotationY: 456, rotationX: 6, duration: TOTAL - GRID_IN + 0.3, ease: 'power2.out' },
            GRID_IN - 0.3,
          );

          /* Sets the timeline's length, and doubles as the progress read-out. */
          timeline.to(bar, { scaleX: 1, duration: TOTAL, ease: 'none' }, 0);

          /* What was added by hand — GSAP reverts only what it set itself.
             The ticker's listener and the last two are a phone's (`fitted`
             is empty on a wide stage, and its cards' tilt is a class). */
          return () => {
            gsap.ticker.remove(followScroll);
            for (const comet of comets) (comet as HTMLElement).style.removeProperty(COMET);
            for (const body of fitted) body.style.scale = '';
            if (!wide) for (const card of cards) card.style.rotate = '';
          };
        },
      );

      /* ---------- the gallery follows the cursor ----------
         Mouse only: a finger dragging the page should not swing the cluster,
         and there is no hover state to leave it in. quickTo re-uses one tween
         per axis rather than creating one per pointer event. */
      media.add('(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 768px)', () => {
        const area = q('[data-collage-area]')[0] as HTMLElement | undefined;
        const plane = q('[data-plane]')[0] as HTMLElement | undefined;
        if (!area || !plane) return;

        const tiltX = gsap.quickTo(plane, 'rotationX', { duration: 0.8, ease: 'power3' });
        const tiltY = gsap.quickTo(plane, 'rotationY', { duration: 0.8, ease: 'power3' });

        /* Listens on the act, not the cluster, so the tilt responds to the
           whole screen rather than only the few hundred pixels of photo. */
        const surface = area.closest('[data-act="collage"]') ?? area;

        const onMove = (event: PointerEvent) => {
          const rect = area.getBoundingClientRect();
          tiltY(((event.clientX - rect.left) / rect.width - 0.5) * 9);
          tiltX((0.5 - (event.clientY - rect.top) / rect.height) * 7);
        };

        const onLeave = () => {
          tiltX(0);
          tiltY(0);
        };

        surface.addEventListener('pointermove', onMove as EventListener);
        surface.addEventListener('pointerleave', onLeave);

        return () => {
          surface.removeEventListener('pointermove', onMove as EventListener);
          surface.removeEventListener('pointerleave', onLeave);
        };
      });

      return () => media.revert();
    }, scope);

    return () => context.revert();
  }, [bare]);

  const Icon = brand.icon;

  return (
    <section ref={scope} aria-label={brand.name} className="relative isolate">
      <div ref={stage} className="relative">
        {/* Everything plays inside this. It always clips; whether it also
            looks like a card is the caller's business. */}
        <div data-card className={`relative isolate overflow-hidden${bare ? '' : ` ${CARD}`}`}>
          {/* ================= ACT ONE — the platform ================= */}
          <div
            data-act="hero"
            data-hero
            data-stack
            className={`relative flex min-h-[70svh] w-full items-center overflow-hidden ${ACT_PADDING}`}
          >
            {/* Ambient wash in the brand's own colour */}
            <span
              data-drift="wash"
              aria-hidden="true"
              className={`pointer-events-none absolute -right-40 -top-40 -z-10 size-[620px] rounded-full blur-[140px] ${SOFT} ${brand.theme.glow}`}
            />

            {/* The watermark: a layer rather than an overlay — -z-10 drops it
                behind the content, and the 3D mark stands in front of it
                instead of being washed over by it. */}
            <span
              data-intro="ghost"
              aria-hidden="true"
              className="pointer-events-none absolute right-[2%] top-1/2 -z-10 hidden -translate-y-1/2 whitespace-nowrap text-[12vw] font-bold leading-none tracking-[-0.06em] text-accent/[0.045] lg:block"
            >
              {brand.shortName}
            </span>

            {/* The arrival: the hero has just said who this is, so act one
                only says what it is for — one line and one way in. */}
            <div data-hero-body className={HERO_GRID}>
              <div>
                <h2 className="text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.05em] text-accent sm:text-6xl lg:text-[4.4rem]">
                  {headline.map((word, index) => (
                    /* The mask the word slides out of. The padding keeps the
                       descenders clear of the clip; the matching negative
                       margin gives the space straight back to the layout.
                       The space between words sits outside the masks, so the
                       line can still wrap there. */
                    <Fragment key={word}>
                      {index > 0 ? ' ' : null}
                      <span className="inline-block overflow-hidden pb-[0.1em] align-bottom [margin-bottom:-0.1em]">
                        <span
                          data-intro-word
                          className={`inline-block${index === headline.length - 1 ? ' bg-brand-gradient bg-clip-text text-transparent' : ''}`}
                        >
                          {word}
                        </span>
                      </span>
                    </Fragment>
                  ))}
                </h2>

                <button
                  type="button"
                  data-intro="line"
                  onClick={() => onSelectBrand(brand.id)}
                  className={`group mt-9 inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 sm:px-7 ${brand.theme.gradient} ${brand.theme.outline}`}
                >
                  <Icon aria-hidden="true" size={16} strokeWidth={2} />
                  Explore programmes
                  <ArrowRight
                    aria-hidden="true"
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>

              {/* The second column is deliberately empty: the brand mark that
                  fills it lives on the card, not in this act, so that it can
                  carry on into the other two. */}
            </div>
          </div>

          {/* ================= ACT TWO — the collage ================= */}
          <div
            data-act="collage"
            data-stack
            className={`flex min-h-[70svh] w-full items-center ${ACT_PADDING}`}
          >
            <div className="mx-auto w-full max-w-[1520px]">
              {/* The camera. One shared vanishing point for the whole cluster, so
                  the cards read as one object seen in perspective rather than
                  nine separately skewed rectangles. */}
              <div data-collage-area className="relative isolate [perspective:1400px]">
                {/* Light behind the glass */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                  <div className={`absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl ${SOFT}`} />
                  <div className={`absolute left-[10%] top-[14%] size-[44%] rounded-full bg-primary/25 blur-[90px] ${SOFT}`} />
                  <div className={`absolute bottom-[8%] right-[6%] size-[46%] rounded-full bg-brand-end/25 blur-[100px] ${SOFT}`} />
                  <div className={`absolute left-[38%] top-[52%] size-[34%] rounded-full bg-accent/12 blur-[90px] ${SOFT}`} />
                </div>

                {/* Outer plane takes the pointer tilt, inner takes the scroll
                    drift — two layers so the two never write the same property. */}
                <div data-plane className="[transform-style:preserve-3d]">
                  {/* A free-floating cluster from `sm` up, its width capped
                      against the viewport height (156svh wide at 12:5 is 65svh
                      tall) so it always fits a pinned act. Below that the
                      classes leave a grid, which is what a phone shows without
                      motion; with it, GSAP stands the same cluster in an
                      upright box (PHONE_BOX). */}
                  <div
                    data-plane-inner
                    className={`relative grid grid-cols-2 gap-3 sm:mx-auto sm:block sm:gap-0 [transform-style:preserve-3d] ${COLLAGE_BOX}`}
                  >
                    {collageItems.map((item, index) => (
                      <div
                        key={item.id}
                        data-collage-card
                        /* White frame, hairline, green halo, then the ground
                           shadow — one box-shadow stack rather than extra
                           elements, so nothing else has to move with the card. */
                        className={`relative rounded-[26px] bg-white/85 p-[5px] shadow-[0_0_0_1px_rgba(255,255,255,0.7),0_0_34px_-4px_rgba(21,128,61,0.3),0_26px_60px_-26px_rgba(20,29,63,0.5)] ${item.span} ${item.aspect} ${item.tilt} ${item.position}`}
                      >
                        <div className="relative size-full overflow-hidden rounded-[21px]">
                          <JourneyImage src={item.src} alt={item.alt} sizes={item.sizes} seed={index} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Kept outside the plane: the script stays upright and sharp
                    instead of tilting with the gallery. Overlays the cluster;
                    under it only in a phone's flow layout. */}
                <div
                  data-script-layer
                  className="pointer-events-none mt-5 sm:absolute sm:inset-0 sm:mt-0 sm:flex sm:items-start sm:justify-center"
                >
                  <div data-script-box className={`relative w-full ${COLLAGE_BOX}`}>
                <p
                  data-script
                  className="text-center sm:absolute sm:left-[66%] sm:top-[8%] sm:w-[30%] sm:text-left"
                >
                  <span className="font-serif text-[1.6rem] italic leading-[1.15] tracking-[-0.01em] text-accent max-sm:text-[1.35rem] sm:text-[1.9rem] lg:text-[2.4rem]">
                    A place to celebrate
                    <span className="block text-primary">culture, creativity</span>
                    and community
                  </span>
                </p>

                    {SPARKS.map((spark) => (
                      <span
                        key={spark.position}
                        aria-hidden="true"
                        style={{ animationDelay: spark.delay }}
                        className={`absolute hidden text-primary/45 motion-safe:animate-[icon-float_5s_ease-in-out_infinite] sm:block ${spark.position}`}
                      >
                        <Plus size={spark.size} strokeWidth={2.5} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= ACT THREE — the learning worlds ================= */}
          <div
            data-act="grid"
            data-stack
            className={`flex min-h-[70svh] w-full items-center ${ACT_PADDING}`}
          >
            {/* Two columns at every width (TILE_SHOWCASE), and from `lg` up
                no wider than two big tiles. */}
            <div data-grid-body className="mx-auto w-full max-w-[1180px] lg:max-w-[880px]">
              <span
                data-grid-head
                className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary"
              >
                <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
                Explore our learning worlds
              </span>

              <h2
                data-grid-head
                className="mt-3 text-[1.8rem] font-semibold tracking-[-0.04em] text-accent max-sm:mt-2 max-sm:text-[1.4rem] max-sm:leading-[1.15] sm:text-[2.1rem] lg:text-[2.6rem]"
              >
                A brighter tomorrow, by subject.
              </h2>

              <ul className="relative mt-6 grid grid-cols-2 gap-3 max-sm:mt-3.5 max-sm:gap-2.5 sm:gap-4">
                {learningWorlds.map((world) => {
                  const WorldIcon = world.icon;

                  return (
                    <li key={world.id} data-grid-card className="relative">
                      {/* Comet riding the tile's border while it holds the
                          light. Outside the button, so the glow is not cut off
                          by the card's own overflow clip, and gated on
                          offset-path so browsers without it get nothing rather
                          than three dots parked in the corner.

                          Head, then two fainter bodies a fraction of a lap
                          behind it — the negative delays are one full period
                          minus the lag, which puts them behind rather than
                          ahead. */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 opacity-0 supports-[offset-path:inset(0_round_1rem)]:opacity-100"
                      >
                        <span data-tile-comet className="absolute inset-0 opacity-0">
                          <span
                            style={{ animationDelay: '-2.96s', animationPlayState: COMET_STATE }}
                            className="absolute left-0 top-0 size-1.5 rounded-full bg-primary/45 blur-[2px] [offset-path:inset(0_round_1rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_3.2s_linear_infinite]"
                          />
                          <span
                            style={{ animationDelay: '-3.08s', animationPlayState: COMET_STATE }}
                            className="absolute left-0 top-0 size-1 rounded-full bg-primary/70 blur-[1px] [offset-path:inset(0_round_1rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_3.2s_linear_infinite]"
                          />
                          <span
                            style={{ animationPlayState: COMET_STATE }}
                            className="absolute left-0 top-0 size-2.5 rounded-full bg-primary shadow-[0_0_14px_5px_rgba(21,128,61,0.55)] [offset-path:inset(0_round_1rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_3.2s_linear_infinite]"
                          />
                        </span>
                      </span>

                      {/* Opens the Courses page on this category. */}
                      <Link
                        href={`/courses?category=${world.slug}`}
                        onPointerMove={handleSpotlight}
                        className={`${CARD_CHROME} block w-full px-5 py-7 text-center outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 max-sm:px-3 max-sm:py-4 sm:px-6 sm:py-8`}
                      >
                        <CardDecor />

                        <span
                          className={`mx-auto flex size-14 items-center justify-center rounded-2xl transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-105 max-sm:size-10 max-sm:rounded-xl ${world.tint}`}
                        >
                          <WorldIcon aria-hidden="true" className="size-7 max-sm:size-5" strokeWidth={1.8} />
                        </span>

                        <span className="mt-4 block text-lg font-bold leading-snug tracking-[-0.02em] text-accent max-sm:mt-2 max-sm:text-[15px] sm:text-xl lg:text-[1.4rem]">
                          {world.title}
                        </span>

                        <span className="mt-1.5 block text-sm text-muted max-sm:mt-1 max-sm:text-xs max-sm:leading-[1.35] sm:text-base">
                          {world.blurb}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div data-grid-cta className="mt-6 text-center max-sm:mt-2">
                <button
                  type="button"
                  onClick={() => onSelectBrand(brand.id)}
                  className="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-primary outline-primary transition-colors duration-300 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  View all categories
                  <ArrowRight
                    aria-hidden="true"
                    size={15}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ---------- the brand mark ----------
              Outside every act, so it survives their crossfades. At -z-10 it
              sits behind the collage and the subject grid while still covering
              act one's watermark. Cinematic only — GSAP reveals it — because in
              the flow fallback the acts are stacked screens apart and one
              centred overlay cannot serve all three. Laid out from `lg` up,
              where act one leaves it a column; on a phone's stage GSAP lays
              it out too, as a watermark behind the copy (PHONE_MARK). */}
          <div
            data-mark-layer
            aria-hidden="true"
            style={{ opacity: 0 }}
            className={`pointer-events-none absolute inset-0 -z-10 hidden items-center lg:flex ${ACT_PADDING}`}
          >
            <div className={HERO_GRID}>
              <div />
              <AyadiMark3D />
            </div>
          </div>

          {/* ---------- progress ----------
              Hidden until GSAP decides it is driving the section, so the flow
              fallback never shows a bar that cannot fill. */}
          <div
            data-rail
            aria-hidden="true"
            style={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex -translate-y-20 items-center gap-4 px-5 pb-4 sm:translate-y-0 sm:px-8 lg:px-12"
          >
            <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted/70">
              <ChevronDown size={14} className="text-primary motion-safe:animate-bounce" />
              Keep scrolling
            </span>

            <span className="h-[3px] flex-1 overflow-hidden rounded-full bg-border/70">
              <span data-bar className="block h-full w-full rounded-full bg-brand-gradient" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
