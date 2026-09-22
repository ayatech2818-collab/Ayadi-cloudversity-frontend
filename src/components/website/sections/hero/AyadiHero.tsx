'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ChooseWorld, type WorldId } from './ChooseWorld';
import styles from './hero.module.css';
import { createRig, pickQuality, RIG_START, type Quality, type Rig, type StoryKey } from './rig';
import { WhyStage } from './WhyStage';

/* three.js and the scene arrive in their own chunk, after the page is up. */
const HeroScene = dynamic(() => import('./scene/HeroScene'), { ssr: false });

/* The switch into the pinned layout has to land before paint, or the layers
   flash stacked. useLayoutEffect warns during SSR — swap the hook, not the timing. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* The journey needs motion and WebGL. Without either — reduced motion, or a
   browser that cannot run the scene — the same content reads as an ordinary
   page: the opening, then the two worlds. */
const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

function supportsWebGL2() {
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return Boolean(context);
  } catch {
    return false;
  }
}

/* ---------- the score ----------
   One timeline, TOTAL units long, scrubbed across the pinned scroll. Every
   line moves one rig value: [what, to, when, how long, ease]. Each starts
   from where that value's previous line left it (or RIG_START), and no two
   lines for the same value overlap — so the story is the same frame at the
   same scroll position whichever way, and however fast, you get there. */
const TOTAL = 10;

type Line = [key: StoryKey, to: number, at: number, duration: number, ease?: string];

const SCORE: Line[] = [
  /* The mark comes free of the headline and turns to show its depth; the
     camera pulls back and the page darkens into space. */
  ['dock', 0, 0.15, 1.3, 'power2.inOut'],
  ['logoSpin', 0.9, 0.1, 1.6, 'sine.inOut'],
  ['logoTilt', 0.2, 0.2, 1.2, 'sine.inOut'],
  ['camZ', 10.5, 0.3, 1.8, 'power1.inOut'],
  ['dark', 1, 0.35, 1.45, 'power1.inOut'],
  ['camX', -0.6, 1, 1.6, 'sine.inOut'],
  ['camY', 1.1, 1.3, 1.3, 'sine.inOut'],

  /* The globe draws itself round the mark, which settles as its core. */
  ['spin', 2.4, 1.2, 3.2],
  ['globe', 1, 1.3, 1.6, 'power2.out'],
  ['logoScale', 0.36, 1.5, 1.3, 'power2.inOut'],
  ['body', 1, 1.7, 1.1, 'power1.out'],
  ['logoSpin', 0, 1.9, 1.4, 'sine.inOut'],
  ['logoTilt', 0, 1.9, 1.1, 'sine.inOut'],
  ['logoGlow', 1, 1.9, 0.9, 'power1.out'],
  ['camZ', 7.6, 2.1, 1.6, 'power2.inOut'],
  ['nodes', 1, 2.3, 0.8, 'power1.out'],

  /* The globe tips to face the camera and squares off into the portal; the
     core drifts through ahead of us. */
  ['camX', 0, 3, 1.6, 'sine.inOut'],
  ['camY', 0, 3.1, 1.5, 'sine.inOut'],
  ['nodes', 0, 3.6, 0.6, 'power1.in'],
  ['body', 0, 3.7, 0.8, 'power1.in'],
  ['morph', 1, 3.7, 1.6, 'power2.inOut'],
  ['camZ', 6.4, 3.9, 1.3, 'sine.inOut'],
  ['logoZ', -1.3, 4, 0.9, 'power1.in'],
  ['logoFade', 0, 4.4, 0.6, 'power1.in'],
  ['surface', 1, 4.7, 0.8, 'power1.out'],

  /* The approach: the glass brightens and starts to ripple. */
  ['shine', 1, 5, 1.5, 'power1.in'],
  ['camZ', 0.7, 5.2, 1.3, 'power2.in'],
  ['ripple', 1, 5.3, 1.3, 'power1.in'],

  /* The crossing. Distortion peaks as the surface passes the lens; the far
     side swaps in underneath it. */
  ['fov', 50, 6.1, 0.5, 'sine.in'],
  ['distortion', 1, 6.15, 0.45, 'power2.in'],
  ['crossing', 1, 6.3, 1.3],
  ['camZ', -6.2, 6.5, 1.2, 'power2.out'],
  ['world', 1, 6.5, 0.3],
  ['distortion', 0, 6.6, 1, 'power2.out'],
  ['fov', 42, 6.6, 1.1, 'sine.out'],

  /* The far side settles. */
  ['arrive', 1, 7, 1.4, 'power2.out'],
  ['camY', 0.35, 7.4, 1.6, 'sine.inOut'],
  ['lookY', 0.1, 7.4, 1.6, 'sine.inOut'],
  ['camZ', -7.6, 7.7, 1.6, 'sine.out'],
];

/* When the HTML layers come and go, in the same units. The opening fades
   where it stands — the page no longer carries it away — clearing the middle
   of the screen as the mark comes free and heads for it. */
const CUES = {
  openingOut: [0.1, 0.8],
  globeCaptionIn: [2.5, 0.4],
  globeCaptionOut: [3.4, 0.35],
  skipIn: [0.9, 0.4],
  skipOut: [7.3, 0.3],
  chooseIn: [7.6, 0.5],
  cardsIn: [7.85, 0.6],
} as const;

/* ---------- the Why Choose Ayadi stage ----------
   Shown on the portal's glass while the camera travels toward it. The part of
   the story where that happens — the glass fading in, the frames squaring
   off, the camera on its way (STAGE_FROM → STAGE_TO) — is stretched across
   STAGE_LENGTH units of scroll. The camera never stops; it only moves more
   slowly while the heading and then the three cards appear on the glass one
   by one, hold, and sink into it. Before the stretch everything plays as it
   did; after it (the approach, the crossing, Choose your world) the same,
   just later.

   Stage cues are [start, length] in master units after STAGE_FROM. */
const STAGE_FROM = 4.9;
const STAGE_TO = 5.55;
const STAGE_LENGTH = 2.7;

const STAGE = {
  scrimIn: [0, 0.45],
  headIn: [0.05, 0.45],
  cards: [
    [0.3, 0.45],
    [0.85, 0.45],
    [1.4, 0.45],
  ],
  cardsOut: [2.15, 0.4],
  headOut: [2.25, 0.35],
  scrimOut: [2.3, 0.4],
} as const;

/* The story's approach eases to a near stop in the middle of the stretch
   (one camera line ends and the next begins there). So the stage adds its
   own steady travel toward the portal — PUSH world units across the stage —
   and hands it back inside the fast approach that follows, finished by story
   PUSH_RETURN_BY, well before the camera reaches the glass. The camera never
   stands still; where and when it crosses the portal is unchanged. */
const PUSH = 0.6;
const PUSH_RETURN_BY = 6.3;

/** Master time the stretch adds. */
const STRETCH = STAGE_LENGTH - (STAGE_TO - STAGE_FROM);

/** The whole scrubbed timeline. */
const MASTER_TOTAL = TOTAL + STRETCH;

/** Story time → master time. */
function toMaster(story: number) {
  if (story <= STAGE_FROM) return story;
  if (story <= STAGE_TO) return STAGE_FROM + ((story - STAGE_FROM) / (STAGE_TO - STAGE_FROM)) * STAGE_LENGTH;
  return story + STRETCH;
}

/* The portal's caption used to arrive at story 4.95 — inside the stretch —
   so it now follows the stage: once the cards have gone, just before the
   crossing (the liquid starts at story 6.15). Master units. */
const PORTAL_CAPTION = {
  in: [toMaster(STAGE_TO) - 0.15, 0.3],
  out: [toMaster(5.9), 0.25],
} as const;

/* The journey's length in scroll — 8.45 screens, 7.25 on phones — is the
   section's height in hero.module.css: the stage is sticky inside it. It
   grew with the Why stage by MASTER_TOTAL / TOTAL, so everything outside the
   stretch scrolls at the same speed as before. */

/*
 * The Home hero: "scroll into the Ayadi digital universe".
 *
 *   the opening (the heading, and the Ayadi mark beside it)
 *   → the mark comes free and turns, and the page darkens into space
 *   → a globe forms round it
 *   → the globe tips toward the camera and becomes a portal; on its glass,
 *     "Why choose Ayadi?" and three cards, one by one, as the camera nears
 *   → the camera flies through the portal's liquid glass
 *   → the far side: Choose your world — Ayadi Cloudversity or AyaTech.
 *
 * Scroll is the only clock. One ScrollTrigger scrubs one master timeline. It
 * plays the story (SCORE + CUES: every `rig` value and the HTML over it),
 * slowing it through the Why stage (STAGE); the WebGL scene reads `rig` each
 * frame.
 *
 * The page itself stands still for the whole journey. Everything — the
 * opening included — lives on one stage that is `position: sticky` inside a
 * section 7 screens taller than it: the browser holds it in place (no
 * one-frame slip, as a JavaScript pin has at the very top of a page), the
 * scroll only moves the timeline, and the page moves on once the choice is
 * on screen. Scrolling back up re-enters it the same way.
 */
export function AyadiHero() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const openingRef = useRef<HTMLDivElement>(null);
  const openingInnerRef = useRef<HTMLDivElement>(null);
  const whyRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const rig = useRef<Rig>(createRig());

  const [mode, setMode] = useState<'still' | 'cinematic'>('still');
  const [quality, setQuality] = useState<Quality | null>(null);
  const [ready, setReady] = useState(false);
  const [world, setWorld] = useState<WorldId | null>(null);

  const handleReady = useCallback(() => setReady(true), []);

  /* ---------- which layout ---------- */
  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add(MOTION_QUERY, () => {
      if (!supportsWebGL2()) return;
      setQuality(pickQuality());
      setMode('cinematic');
      return () => {
        setMode('still');
        setReady(false);
      };
    });

    return () => media.revert();
  }, []);

  /* ---------- the journey ---------- */
  useIsomorphicLayoutEffect(() => {
    if (mode !== 'cinematic') return;

    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const state = rig.current;
    Object.assign(state, RIG_START);

    /*
     * The opening has to fit on the stage now that nothing scrolls it: on a
     * short screen it scales down as a whole (--fit). Then, relative to the
     * stage — which is exactly the canvas — where the mark's slot and the
     * watermark sit, for the scene to dock the mark into and draw the
     * watermark behind it.
     */
    const measure = () => {
      /* The Why panel's own size, before the Director scales it onto the glass. */
      const why = whyRef.current;
      if (why) {
        state.infoWidth = why.offsetWidth;
        state.infoHeight = why.offsetHeight;
      }

      const opening = openingRef.current;
      const inner = openingInnerRef.current;
      const slot = slotRef.current;
      if (!opening || !inner || !slot) return;

      const padding = getComputedStyle(opening);
      const room = opening.clientHeight - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
      const needed = inner.offsetHeight;
      const fit = needed > room && needed > 0 ? Math.max(0.5, room / needed) : 1;
      inner.style.setProperty('--fit', fit.toFixed(3));

      const origin = stage.getBoundingClientRect();
      const rect = slot.getBoundingClientRect();
      state.slotLeft = rect.left - origin.left;
      state.slotTop = rect.top - origin.top;
      state.slotWidth = rect.width;
      state.slotHeight = rect.height;

      const watermark = watermarkRef.current;
      if (!watermark) return;
      const box = watermark.getBoundingClientRect();
      const style = getComputedStyle(watermark);
      /* Its box is one line-height: 1 tall, so its height is the font size as
         drawn — after --fit — and spacing scales with it. */
      const drawn = box.height / (parseFloat(style.fontSize) || box.height || 1);
      const spec = state.watermark;
      spec.left = box.left - origin.left;
      spec.top = box.top - origin.top;
      spec.width = box.width;
      spec.height = box.height;
      spec.fontSize = box.height;
      spec.letterSpacing = (parseFloat(style.letterSpacing) || 0) * drawn;
      spec.paddingLeft = (parseFloat(style.paddingLeft) || 0) * drawn;
      spec.fontFamily = style.fontFamily;
      spec.fontWeight = style.fontWeight;
      spec.version += 1;
    };
    measure();

    ScrollTrigger.config({ ignoreMobileResize: true });

    const context = gsap.context((self) => {
      const q = self.selector!;
      const layer = (name: string) => q(`[data-h="${name}"]`) as HTMLElement[];

      const captions = [...layer('globe-caption'), ...layer('portal-caption')];
      gsap.set(captions, { autoAlpha: 0, y: 20 });
      gsap.set(layer('choose-head'), { autoAlpha: 0, y: 24 });
      gsap.set(layer('card'), { autoAlpha: 0, y: 48, rotateX: 16, transformPerspective: 900, transformOrigin: '50% 100%' });
      gsap.set(layer('progress'), { scaleY: 0, transformOrigin: '50% 0%' });
      gsap.set([...layer('shade'), ...layer('fade')], { autoAlpha: 0 });
      gsap.set(layer('skip'), { opacity: 0 });
      gsap.set(layer('why-scrim'), { autoAlpha: 0 });
      gsap.set(layer('why-head'), { autoAlpha: 0, y: 14 });
      gsap.set(layer('why-card'), { autoAlpha: 0 });
      gsap.set(layer('why-tag'), { autoAlpha: 0, y: 6, scale: 0.8 });
      gsap.set(layer('why-accent'), { scaleX: 0, transformOrigin: '0% 50%' });

      /* The story: everything from the opening to Choose your world, in story
         units. Paused — the master timeline below plays it. */
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'none', immediateRender: false } });

      /* The 3D story. */
      const from: Record<StoryKey, number> = { ...RIG_START };
      for (const [key, to, at, duration, ease = 'none'] of SCORE) {
        timeline.fromTo(state, { [key]: from[key] }, { [key]: to, duration, ease }, at);
        from[key] = to;
      }

      /* The HTML over it. */
      /* autoAlpha: once faded, the opening must stop covering the stage. */
      const [openingAt, openingFor] = CUES.openingOut;
      timeline.fromTo(
        layer('opening'),
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: openingFor, ease: 'power1.inOut' },
        openingAt,
      );

      /* Stand-ins for the canvas's own sky, for the moment before it loads. */
      timeline.fromTo(layer('shade'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.45 }, 0.35);
      timeline.to(layer('shade'), { autoAlpha: 0, duration: 0.3 }, 6.5);
      timeline.fromTo(layer('fade'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 7.4);

      const show = (name: string, [at, duration]: readonly [number, number]) =>
        timeline.fromTo(layer(name), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration, ease: 'power2.out' }, at);
      const hide = (name: string, [at, duration]: readonly [number, number]) =>
        timeline.fromTo(layer(name), { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -16, duration, ease: 'power1.in' }, at);

      show('globe-caption', CUES.globeCaptionIn);
      hide('globe-caption', CUES.globeCaptionOut);

      timeline.fromTo(
        layer('choose-head'),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: CUES.chooseIn[1], ease: 'power2.out' },
        CUES.chooseIn[0],
      );
      timeline.fromTo(
        layer('card'),
        { autoAlpha: 0, y: 48, rotateX: 16 },
        { autoAlpha: 1, y: 0, rotateX: 0, duration: CUES.cardsIn[1], ease: 'power2.out', stagger: 0.15 },
        CUES.cardsIn[0],
      );
      /* Opacity only, never visibility: the skip button stays in the tab order
         from the very start, and shows itself when focused (see .skip). */
      timeline.fromTo(layer('skip'), { opacity: 0 }, { opacity: 1, duration: CUES.skipIn[1] }, CUES.skipIn[0]);
      timeline.to(layer('skip'), { opacity: 0, duration: CUES.skipOut[1] }, CUES.skipOut[0]);

      /* Pad the end, so Choose your world holds for a while before the page moves on. */
      timeline.set({}, {}, TOTAL);

      /* ---------- the master: the story, stretched for the Why stage ---------- */
      const master = gsap.timeline({ defaults: { ease: 'none', immediateRender: false } });

      /* The story's clock: 1:1, slower through the stage, 1:1 again — it
         never stops. Children render in order going forward and in reverse
         going back, so these three always settle the story first and the
         stage's own tweens (added after) on top of it. */
      master.fromTo(timeline, { time: 0 }, { time: STAGE_FROM, duration: STAGE_FROM }, 0);
      master.fromTo(timeline, { time: STAGE_FROM }, { time: STAGE_TO, duration: STAGE_LENGTH }, STAGE_FROM);
      master.fromTo(timeline, { time: STAGE_TO }, { time: TOTAL, duration: TOTAL - STAGE_TO }, STAGE_FROM + STAGE_LENGTH);

      const at = (start: number) => STAGE_FROM + start;

      /* How far through the stage we are; the Director places the panel on
         the glass only while it is between 0 and 1. */
      master.fromTo(state, { info: 0 }, { info: 1, duration: STAGE_LENGTH }, STAGE_FROM);

      /* Steady extra travel through the stage, handed back in the approach. */
      master.fromTo(state, { push: 0 }, { push: PUSH, duration: STAGE_LENGTH }, STAGE_FROM);
      master.fromTo(
        state,
        { push: PUSH },
        { push: 0, duration: toMaster(PUSH_RETURN_BY) - (STAGE_FROM + STAGE_LENGTH), ease: 'sine.inOut' },
        STAGE_FROM + STAGE_LENGTH,
      );

      /* The glass darkens a touch behind the text, and the heading surfaces
         from inside it as it appears. */
      master.fromTo(
        layer('why-scrim'),
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: STAGE.scrimIn[1], ease: 'power1.out' },
        at(STAGE.scrimIn[0]),
      );
      master.fromTo(
        layer('why-head'),
        { autoAlpha: 0, y: 14, z: -40 },
        { autoAlpha: 1, y: 0, z: 0, duration: STAGE.headIn[1], ease: 'power2.out' },
        at(STAGE.headIn[0]),
      );

      /* One card per stretch of scroll, each rising out of the glass; its
         tag springs on and its accent line draws. */
      layer('why-card').forEach((card, index) => {
        const [start, length] = STAGE.cards[Math.min(index, STAGE.cards.length - 1)];
        master.fromTo(
          card,
          { autoAlpha: 0, y: 18, z: -70, rotationX: 12, scale: 0.96 },
          { autoAlpha: 1, y: 0, z: 0, rotationX: 0, scale: 1, duration: length, ease: 'power2.out' },
          at(start),
        );

        const tag = card.querySelector('[data-h="why-tag"]');
        if (tag) {
          master.fromTo(
            tag,
            { autoAlpha: 0, y: 6, scale: 0.8 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2.2)' },
            at(start) + 0.2,
          );
        }

        const accent = card.querySelector('[data-h="why-accent"]');
        if (accent) master.fromTo(accent, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, at(start) + 0.25);
      });

      /* Absorbed: the cards sink back into the glass, shrink and fade, the
         heading and the glass's shade after them — and the portal takes over
         as the camera carries on. */
      master.fromTo(
        layer('why-card'),
        { autoAlpha: 1, z: 0, scale: 1 },
        { autoAlpha: 0, z: -110, scale: 0.92, duration: STAGE.cardsOut[1], ease: 'power1.in', stagger: 0.05 },
        at(STAGE.cardsOut[0]),
      );
      master.fromTo(
        layer('why-head'),
        { autoAlpha: 1, z: 0 },
        { autoAlpha: 0, z: -80, duration: STAGE.headOut[1], ease: 'power1.in' },
        at(STAGE.headOut[0]),
      );
      master.fromTo(
        layer('why-scrim'),
        { autoAlpha: 1 },
        { autoAlpha: 0, duration: STAGE.scrimOut[1], ease: 'power1.in' },
        at(STAGE.scrimOut[0]),
      );

      master.fromTo(
        layer('portal-caption'),
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: PORTAL_CAPTION.in[1], ease: 'power2.out' },
        PORTAL_CAPTION.in[0],
      );
      master.fromTo(
        layer('portal-caption'),
        { autoAlpha: 1, y: 0 },
        { autoAlpha: 0, y: -16, duration: PORTAL_CAPTION.out[1], ease: 'power1.in' },
        PORTAL_CAPTION.out[0],
      );

      master.fromTo(layer('progress'), { scaleY: 0 }, { scaleY: 1, duration: MASTER_TOTAL }, 0);
      master.set({}, {}, MASTER_TOTAL);

      /* The one ScrollTrigger. No pin — the stage is sticky (see above); the
         trigger only maps the section's scroll onto the timeline, from the
         top of the section to the moment the stage lets go. */
      triggerRef.current = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.9,
        animation: master,
        invalidateOnRefresh: true,
        onUpdate: () => {
          state.activeAt = performance.now();
        },
      });
    }, root);

    ScrollTrigger.addEventListener('refresh', measure);

    /* Web fonts landing, or anything else that reflows the opening. */
    const reflow = new ResizeObserver(measure);
    if (openingInnerRef.current) reflow.observe(openingInnerRef.current);
    if (whyRef.current) reflow.observe(whyRef.current);

    /* The scene only renders while the hero is on screen. */
    const onScreen = new IntersectionObserver(([entry]) => {
      state.live = entry.isIntersecting;
    });
    onScreen.observe(root);

    return () => {
      onScreen.disconnect();
      reflow.disconnect();
      ScrollTrigger.removeEventListener('refresh', measure);
      triggerRef.current = null;
      context.revert();
    };
  }, [mode]);

  /* ---------- live input ---------- */
  useEffect(() => {
    if (mode !== 'cinematic') return;
    const state = rig.current;

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      state.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
      state.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      state.activeAt = performance.now();
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      state.pointerX = 0;
      state.pointerY = 0;
    };
    const onResize = () => {
      state.activeAt = performance.now();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerOut, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('resize', onResize);
    };
  }, [mode]);

  /* Straight to the choice. Instant: the scrub carries the scene through the
     rest of the journey quickly on its way. */
  const skip = () => {
    const trigger = triggerRef.current;
    if (trigger) window.scrollTo({ top: trigger.end, behavior: 'instant' });
  };

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      data-mode={mode}
      data-ready={ready || undefined}
      className={styles.root}
    >
      {/* ================= the stage =================
          Sticky for the whole journey: the opening, the canvas, the captions
          and the choice all live on it, so the page never moves under them. */}
      <div ref={stageRef} className={styles.stage}>
        <div data-h="shade" aria-hidden="true" className={styles.shade} />

        {mode === 'cinematic' && quality && (
          <div aria-hidden="true" className={styles.canvas}>
            <HeroScene rig={rig} quality={quality} onReady={handleReady} overlay={whyRef} />
          </div>
        )}

        <div data-h="fade" aria-hidden="true" className={styles.fade} />

        <div className={styles.ui}>
          {/* ================= the opening =================
              One centred column: the AYADI watermark and the 3D mark, then the
              copy. The mark is the scene's own — it docks into the slot below. */}
          <div ref={openingRef} data-h="opening" className={styles.opening}>
            <div ref={openingInnerRef} className={styles.openingInner}>
              <div className={styles.brand}>
                {/* The watermark. With the scene running it is drawn behind the
                    3D mark by the backdrop shader, measured from this element; this
                    one only shows until then, and without motion or WebGL. */}
                <span ref={watermarkRef} aria-hidden="true" className={styles.watermark}>
                  AYADI
                </span>

                {/* The 3D mark docks here. Until the scene has drawn its first
                    frame — and always, without motion or WebGL — this image stands in. */}
                <div ref={slotRef} aria-hidden="true" className={styles.slot}>
                  <span className={styles.slotGlow} />
                  <Image src="/images/ayadi-mark.png" alt="" fill sizes="220px" className={styles.fallbackMark} />
                </div>

                {/* A soft contact shadow, so the mark reads as lifted off the page. */}
                <span aria-hidden="true" className={styles.lift} />
              </div>

              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Learning for every next step</p>

              <h1
                id="hero-title"
                className="mt-4 max-w-[50rem] text-[2.15rem] font-extrabold leading-[1.08] tracking-[-0.055em] text-accent sm:text-5xl sm:leading-[1.06] xl:text-[3.3rem]"
              >
                Start Your Future Education With{' '}
                <span className="bg-brand-gradient bg-clip-text text-transparent">Ayadi Cloudversity</span>
              </h1>

              <p className="mt-5 max-w-[44rem] text-[0.95rem] leading-7 text-muted sm:text-[1.0625rem] sm:leading-8">
                At Ayadi Cloudversity, education goes beyond facts. It sparks curiosity, builds character, and shapes
                futures. From playschool to post-graduation to workspace readiness, we are with you, providing learning
                pathways, academic excellence, career preparedness and personal growth.
              </p>

              <Link
                href="/courses"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-5 py-3 text-sm font-bold text-white shadow-md transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                Explore Learning Paths
                <ArrowRight aria-hidden="true" size={16} />
              </Link>

              <span
                aria-hidden="true"
                className={`${styles.cue} flex-col items-center gap-1 text-[11px] font-bold uppercase tracking-[0.2em] text-muted`}
              >
                Scroll to explore
                <ChevronDown size={15} className="text-primary motion-safe:animate-bounce" />
              </span>
            </div>
          </div>

          <p data-h="globe-caption" className={styles.caption}>
            <span className="block text-2xl font-bold tracking-[-0.03em] text-white sm:text-[2rem]">
              Welcome to the <span className="text-emerald-300">Ayadi universe</span>
            </span>
            <span className="mt-2 block text-sm font-semibold text-emerald-100/80 sm:text-base">
              Learning, from anywhere in the world.
            </span>
          </p>

          <WhyStage stageRef={whyRef} />

          <p data-h="portal-caption" className={styles.caption}>
            <span className="text-xs font-bold uppercase tracking-[0.26em] text-emerald-200/90">
              Step into the Ayadi ecosystem
            </span>
          </p>

          <div className={styles.choose}>
            <ChooseWorld selected={world} onSelect={setWorld} />
          </div>
        </div>

        <span aria-hidden="true" className={styles.progressTrack}>
          <span data-h="progress" className={styles.progressFill} />
        </span>

        <button
          type="button"
          data-h="skip"
          onClick={skip}
          className={`${styles.skip} items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-bold text-white/80 ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300`}
        >
          Skip to the choice
          <ChevronDown aria-hidden="true" size={14} />
        </button>
      </div>
    </section>
  );
}
