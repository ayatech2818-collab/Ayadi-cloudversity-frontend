'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown, Plus } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef } from 'react';

import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import { AyadiMark3D } from './AyadiMark3D';
import { JourneyImage } from './JourneyImage';
import { brandById } from './brands';
import { collageItems, learningWorlds } from './journey';
import type { BrandId } from './types';

/* useLayoutEffect warns during SSR, but the layout swap below has to land
   before paint or the acts flash stacked. Swap the hook, not the timing. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* The parent platform. AyaTech and Netscape get their own journeys further down
   the page — one brand per pinned sequence, so no act has to introduce two
   things at once. */
const brand = brandById.ayadi;

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

/* Act three shows the six subjects one at a time, each blown up in the middle
   of the row, before they all fan out into the grid they belong in.
   GRID_SPOT_STEP is how much scroll one subject owns: it arrives, holds, and
   leaves inside that. */
const GRID_SPOT_IN = GRID_IN + 0.6;
const GRID_SPOT_STEP = 0.5;
const GRID_SPOT_OUT = GRID_SPOT_IN + learningWorlds.length * GRID_SPOT_STEP;
const TOTAL = GRID_SPOT_OUT + 1.9;

/* How far a tile blows up while it holds the centre. 1.85 is the most the
   widest layout takes without the card running past the row it sits in —
   re-check it if the grid ever loses a column. */
const TILE_SHOWCASE = 1.85;

/* Where every tile ends up: its own slot in the grid, untransformed. autoAlpha
   rather than opacity so this one tween also brings it out of hidden. */
const TILE_EVEN = { filter: 'blur(0px)', autoAlpha: 1, x: 0, y: 0, scale: 1, zIndex: 1 };

/* Act one's padding and column grid, shared with the brand-mark layer that
   overlays it. The mark has to land in the column the copy leaves empty, so the
   two measure from one source. */
const ACT_PADDING = 'px-5 py-8 pb-14 sm:px-8 sm:py-10 sm:pb-16 lg:px-12';
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
   off the cluster. */
const COLLAGE_BOX = 'sm:aspect-[16/10] sm:w-[min(100%,86svh)]';

/* Small marks scattered around the cluster, as in the reference. Positions are
   percentages of the collage box, not the section. */
const SPARKS = [
  { position: 'sm:left-[19%] sm:top-[26%]', size: 14, delay: '0s' },
  { position: 'sm:left-[64%] sm:top-[60%]', size: 11, delay: '0.9s' },
  { position: 'sm:left-[95%] sm:top-[18%]', size: 13, delay: '1.6s' },
  { position: 'sm:left-[31%] sm:top-[92%]', size: 10, delay: '2.3s' },
];

/*
 * Ayadi Cloudversity, as a pinned three-act sequence.
 *
 * Act one is the platform itself. Act two drops the copy for a floating photo
 * collage. Act three spreads that collage outward and lands on the subject
 * grid. One ScrollTrigger drives all of it with `scrub`, so the scene is
 * wherever the reader's scroll position says it is — nothing autoplays.
 *
 * The markup ships in normal document flow: three acts stacked down the page,
 * everything visible, no transforms. GSAP stacks them only after checking that
 * the viewport is wide enough and that motion is welcome, which means the
 * section is complete without JS and degrades to plain sections otherwise.
 *
 * A pinned act cannot scroll, so everything in one has to fit inside 100svh on
 * a laptop. That constraint — not taste — sets the type scale and the collage
 * sizing below; check it again before adding a line to any act.
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
          gsap.set(q('[data-intro="rule"]'), { autoAlpha: 1, y: 0, scaleX: 1, transformOrigin: 'left center' });
          gsap.set(q('[data-card]'), { autoAlpha: 1, y: 0, scale: 1 });
          gsap.set(q('[data-mark]'), { autoAlpha: 1, rotationY: -20, rotationX: 7, z: 0 });
          gsap.set(q('[data-intro="eyebrow"], [data-intro="line"], [data-intro="stat"], [data-intro="ghost"]'), {
            autoAlpha: 1,
            y: 0,
          });
          return;
        }

        gsap.set(q('[data-intro]'), { autoAlpha: 0, y: 18 });
        gsap.set(words, { yPercent: 115 });
        /* Rides in with the eyebrow around it, so it only needs its width. */
        gsap.set(q('[data-intro="rule"]'), { autoAlpha: 1, y: 0, scaleX: 0, transformOrigin: 'left center' });
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
          .to(q('[data-intro="eyebrow"]'), { autoAlpha: 1, y: 0, duration: 0.6 }, '-=0.45')
          .to(q('[data-intro="rule"]'), { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, '-=0.35')
          .to(words, { yPercent: 0, duration: 1.1, stagger: 0.09 }, '-=0.5')
          .to(q('[data-intro="line"]'), { autoAlpha: 1, y: 0, duration: 0.75, stagger: 0.09 }, '-=0.75')
          .to(q('[data-intro="stat"]'), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=0.45')
          .to(q('[data-intro="ghost"]'), { autoAlpha: 1, y: 0, duration: 1.5 }, '-=1.6')
          .to(
            q('[data-mark]'),
            { autoAlpha: 1, rotationY: -20, rotationX: 7, z: 0, duration: 1.4, ease: 'power3.out' },
            '-=1.35',
          );
      });

      media.add(
        { motion: '(prefers-reduced-motion: no-preference)', wide: '(min-width: 768px)' },
        (mediaContext) => {
          const { motion: allowMotion, wide } = mediaContext.conditions as { motion: boolean; wide: boolean };
          if (!allowMotion) return;

          const hero = q('[data-hero]');
          const cards = q('[data-collage-card]') as Element[];
          const script = q('[data-script]');
          const heads = q('[data-grid-head]');
          const tiles = q('[data-grid-card]') as Element[];
          /* Same DOM order as the tiles, so one index addresses both. */
          const comets = q('[data-tile-comet]') as Element[];

          /* ---------- phones: no pin ----------
             Scroll-jacking a touch screen is unpleasant, and a pinned act would
             have to clip the taller stacked layouts. Reveal each block as it
             arrives instead and leave the page scrolling normally.

             The hero is left out: it has its own entrance above, at every
             width. */
          if (!wide) {
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

          /* ---------- cinematic layout ----------
             Collapse the three acts onto one screen. matchMedia reverts these on
             cleanup, so narrowing the window or turning motion off restores the
             flow layout. */
          /* 84px is the clearance the sticky brand tabs below already use for
             the fixed navbar, so the card's top edge lands clear of it. */
          gsap.set(stageEl, { height: 'calc(100svh - 84px)', overflow: 'hidden' });
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

          const timeline = gsap.timeline({
            defaults: { ease: 'power2.inOut' },
            scrollTrigger: {
              trigger: sectionEl,
              start: 'top 84px',
              end: '+=440%',
              pin: true,
              scrub: 1.2,
              anticipatePin: 1,
              invalidateOnRefresh: true,
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
            .to(q('[data-intro="stat"]'), { yPercent: -30, duration: HOLD, ease: 'none' }, 0)
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
            /* Slower than the mark in front of it, which is what makes the
               two read as separate depths rather than one flat picture. */
            .to(q('[data-intro="ghost"]'), { x: -110, duration: HOLD, ease: 'none' }, 0)
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
                stagger: 0.12,
                ease: 'power3.out',
              },
              COLLAGE_IN,
            )
            .to(script, { autoAlpha: 1, yPercent: 0, duration: 0.8, ease: 'power3.out' }, COLLAGE_IN + 0.6);

          /* ---------- the mark crosses into act two ----------
             It does not leave with the hero — it drops back, swells and dims
             into a watermark behind the photographs. Everything it does between
             acts rides on [data-mark-travel]; [data-mark-spin] keeps the
             rotation, so neither tween has to know about the other. */
          timeline
            .to(
              q('[data-mark-travel]'),
              { xPercent: -34, yPercent: 8, scale: 2.2, opacity: 0.18, duration: 0.9, ease: 'power2.inOut' },
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
             the entrance above instead of fighting it for the same property. */
          cards.forEach((card, index) => {
            timeline.to(
              card,
              { y: collageItems[index]?.drift ?? -50, duration: COLLAGE_OUT - COLLAGE_IN, ease: 'none' },
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
              className={`pointer-events-none absolute -right-40 -top-40 -z-10 size-[620px] rounded-full blur-[140px] ${brand.theme.glow}`}
            />

            {/* The watermark, back where it was but now a layer rather than
                an overlay: -z-10 drops it behind the content, so the 3D mark
                stands in front of it instead of being washed over by it. */}
            <span
              data-intro="ghost"
              aria-hidden="true"
              className="pointer-events-none absolute right-[-2%] top-1/2 -z-10 hidden -translate-y-1/2 whitespace-nowrap text-[12vw] font-bold leading-none tracking-[-0.06em] text-accent/[0.045] lg:block"
            >
              {brand.shortName}
            </span>

            <div data-hero-body className={HERO_GRID}>
              <div>
                {/* "01 ———— Parent platform" */}
                <span data-intro="eyebrow" className="inline-flex items-center gap-3.5">
                  <span className="font-mono text-[11px] font-bold tracking-[0.24em] text-muted">{brand.index}</span>
                  <span data-intro="rule" aria-hidden="true" className={`h-px w-14 ${brand.theme.gradient}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${brand.theme.text}`}>
                    {brand.kind}
                  </span>
                </span>

                <h2 className="mt-5 text-[2.2rem] font-semibold leading-[0.98] tracking-[-0.05em] text-accent sm:text-5xl lg:text-[3.4rem]">
                  {brand.name.split(' ').map((word) => (
                    /* The mask the word slides out of. The padding keeps the
                       descender in "Ayadi" clear of the clip; the matching negative
                       margin gives the space straight back to the layout. */
                    <span key={word} className="block overflow-hidden pb-[0.1em] [margin-bottom:-0.1em]">
                      <span data-intro-word className="block">
                        {word}
                      </span>
                    </span>
                  ))}
                </h2>

                <p
                  data-intro="line"
                  className={`mt-4 text-lg font-semibold tracking-[-0.02em] sm:text-xl lg:text-[1.35rem] ${brand.theme.text}`}
                >
                  {brand.tagline}
                </p>

                <p
                  data-intro="line"
                  className="mt-4 max-w-xl text-[0.95rem] leading-7 text-muted sm:text-base sm:leading-8"
                >
                  {brand.lede}
                </p>

                <button
                  type="button"
                  data-intro="line"
                  onClick={() => onSelectBrand(brand.id)}
                  className={`group mt-7 inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 sm:px-7 ${brand.theme.gradient} ${brand.theme.outline}`}
                >
                  <Icon aria-hidden="true" size={16} strokeWidth={2} />
                  Explore {brand.shortName} Programmes
                  <ArrowRight
                    aria-hidden="true"
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>

                <ul className="mt-8 grid grid-cols-2 gap-y-5 sm:mt-10 sm:grid-cols-4">
                  {brand.stats.map((stat, statIndex) => (
                    <li key={stat.label} data-intro="stat" className={`relative ${statIndex > 0 ? 'sm:pl-7' : ''}`}>
                      {statIndex > 0 ? (
                        <span aria-hidden="true" className="absolute left-0 top-1 hidden h-11 w-px bg-border sm:block" />
                      ) : null}

                      <p className="text-2xl font-semibold tracking-[-0.03em] text-accent sm:text-[1.7rem]">{stat.value}</p>

                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">{stat.label}</p>
                    </li>
                  ))}
                </ul>
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
            <div className="mx-auto w-full max-w-[1180px]">
              {/* The camera. One shared vanishing point for the whole cluster, so
                  the cards read as one object seen in perspective rather than
                  five separately skewed rectangles. */}
              <div data-collage-area className="relative isolate [perspective:1400px]">
                {/* Light behind the glass */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
                  <div className="absolute left-1/2 top-1/2 size-[72%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl" />
                  <div className="absolute left-[10%] top-[14%] size-[44%] rounded-full bg-primary/25 blur-[90px]" />
                  <div className="absolute bottom-[8%] right-[6%] size-[46%] rounded-full bg-brand-end/25 blur-[100px]" />
                  <div className="absolute left-[38%] top-[52%] size-[34%] rounded-full bg-accent/12 blur-[90px]" />
                </div>

                {/* Outer plane takes the pointer tilt, inner takes the scroll
                    drift — two layers so the two never write the same property. */}
                <div data-plane className="[transform-style:preserve-3d]">
                  {/* A grid on a phone; a free-floating cluster from `sm` up.
                      The width is capped against the viewport height (99svh wide
                      at 16:10 is 62svh tall) so it always fits a pinned act. */}
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
                    instead of tilting with the gallery. Stacks under the cluster
                    on a phone, overlays it from `sm` up. */}
                <div className="pointer-events-none mt-5 sm:absolute sm:inset-0 sm:mt-0 sm:flex sm:items-start sm:justify-center">
                  <div className={`relative w-full ${COLLAGE_BOX}`}>
                    <p
                      data-script
                      className="text-center sm:absolute sm:left-[66%] sm:top-[8%] sm:w-[30%] sm:text-left"
                    >
                      <span className="font-serif text-[1.6rem] italic leading-[1.15] tracking-[-0.01em] text-accent sm:text-[1.9rem] lg:text-[2.4rem]">
                        Skills
                        <span className="block text-primary">for a better</span>
                        tomorrow
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
            <div className="mx-auto w-full max-w-[1180px]">
              <span
                data-grid-head
                className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary"
              >
                <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
                Explore our learning worlds
              </span>

              <h2
                data-grid-head
                className="mt-3 text-[1.8rem] font-semibold tracking-[-0.04em] text-accent sm:text-[2.1rem] lg:text-[2.6rem]"
              >
                A brighter tomorrow, by subject.
              </h2>

              <ul className="relative mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
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
                            style={{ animationDelay: '-2.96s' }}
                            className="absolute left-0 top-0 size-1.5 rounded-full bg-primary/45 blur-[2px] [offset-path:inset(0_round_1rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_3.2s_linear_infinite]"
                          />
                          <span
                            style={{ animationDelay: '-3.08s' }}
                            className="absolute left-0 top-0 size-1 rounded-full bg-primary/70 blur-[1px] [offset-path:inset(0_round_1rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_3.2s_linear_infinite]"
                          />
                          <span className="absolute left-0 top-0 size-2.5 rounded-full bg-primary shadow-[0_0_14px_5px_rgba(21,128,61,0.55)] [offset-path:inset(0_round_1rem)] [offset-rotate:0deg] motion-safe:animate-[spark-travel_3.2s_linear_infinite]" />
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() => onSelectBrand(brand.id)}
                        onPointerMove={handleSpotlight}
                        className={`${CARD_CHROME} w-full px-4 py-5 text-center outline-primary focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-5`}
                      >
                        <CardDecor />

                        <span
                          className={`mx-auto flex size-10 items-center justify-center rounded-xl transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-105 ${world.tint}`}
                        >
                          <WorldIcon aria-hidden="true" size={20} strokeWidth={1.9} />
                        </span>

                        <span className="mt-3 block text-base font-bold tracking-[-0.02em] text-accent sm:text-lg">
                          {world.title}
                        </span>

                        <span className="mt-1 block text-xs text-muted sm:text-sm">{world.blurb}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div data-grid-cta className="mt-6 text-center">
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
              centred overlay cannot serve all three. */}
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
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center gap-4 px-5 pb-4 sm:px-8 lg:px-12"
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
