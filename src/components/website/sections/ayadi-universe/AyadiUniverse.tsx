'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

import { AyadiMark3D } from '@/components/website/courses/AyadiMark3D';

import { Hero3DEcosystem } from '../hero-ecosystem/Hero3DEcosystem';
import { NO_PHOTOS, type PhotoAvailability } from '../hero-ecosystem/photos';
import { BrandChapters } from './BrandChapters';
import { BRAND_META, BRANDS, CHAPTERS, type Brand } from './content';
import { UniverseGlobe } from './UniverseGlobe';
import styles from './universe.module.css';

/* useLayoutEffect warns during SSR, but the switch into the pinned layout has
   to land before paint or the acts flash stacked. Swap the hook, not the timing. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/* The pinned story needs room and motion. Everywhere else — phones, tablets,
   short laptop screens, reduced motion — the same content reads as a normal
   scrolling page. */
const CINEMATIC_QUERY = '(min-width: 1024px) and (min-height: 700px) and (prefers-reduced-motion: no-preference)';

/* ---------- the score ----------
   Timeline units. Every step has a resting point — scroll snaps there and the
   progress rail jumps there — and the acts change hands between them. Retune
   the pacing here, not in the tweens. */
const TOTAL = 7.9;

/** How many screens of scroll the whole story takes. */
const PIN_SCREENS = 6.4;

/** Resting points for the rail: logo, globe, choose, then the three chapters. */
const STEPS = [0, 1.85, 3.35, 4.85, 5.9, 6.65];
const FIRST_CHAPTER = 3;

/* Where the scroll settles. Chapter three rests three times — learn, build,
   grow for AyaTech; one programme card each for Cloudversity — because its
   3D transformation is the one worth taking a step at a time. */
const SNAPS = [...STEPS, 7.1, 7.55, TOTAL];

/* Each chapter's 3D build is scrubbed across the scroll into it: the worlds
   read these as --cp0/1/2 (0 → 1). Chapter three's window ends on its last
   rest, so its thirds line up with the three stops above. */
const CHAPTER_WINDOWS: [number, number][] = [
  [4.1, 4.85],
  [5.3, 5.9],
  [6.25, 7.55],
];

type Phase = 'intro' | 'globe' | 'choose' | 'chapters';
/** `sub` is the stop within chapter three (0–2); 0 everywhere else. */
type View = { phase: Phase; chapter: number; sub: number };

const START: View = { phase: 'intro', chapter: 0, sub: 0 };

/* Handovers sit between resting points, so a step is always fully composed
   by the time the scroll settles on it. */
function viewAt(time: number): View {
  if (time < 1.2) return { phase: 'intro', chapter: 0, sub: 0 };
  if (time < 2.75) return { phase: 'globe', chapter: 0, sub: 0 };
  if (time < 4.05) return { phase: 'choose', chapter: 0, sub: 0 };
  if (time < 5.3) return { phase: 'chapters', chapter: 0, sub: 0 };
  if (time < 6.25) return { phase: 'chapters', chapter: 1, sub: 0 };
  return { phase: 'chapters', chapter: 2, sub: time < 6.9 ? 0 : time < 7.33 ? 1 : 2 };
}

const stepOf = (view: View) =>
  view.phase === 'intro' ? 0 : view.phase === 'globe' ? 1 : view.phase === 'choose' ? 2 : FIRST_CHAPTER + view.chapter;

/*
 * The Home page's opening: "Enter the Ayadi universe".
 *
 *   1. The Ayadi logo, centred, with the page's heading and call to action.
 *   2. Scroll: the logo shrinks into the core of a globe that forms round it —
 *      then the camera dives through the globe's surface.
 *   3. Inside: the two worlds, Ayadi Cloudversity and AyaTech. Pick one — by
 *      clicking the world itself or the button under it.
 *   4–6. The chosen world steps forward and its three chapters play one per
 *      scroll step. The switch above them changes brand at any point.
 *
 * Nothing waits on the choice: Cloudversity is chosen until the visitor picks,
 * so scrolling on always shows something. A progress rail jumps between steps
 * and "Skip intro" leaves the story entirely.
 *
 * The markup is ordinary flowing sections. Only when CINEMATIC_QUERY matches
 * does GSAP pin the stage and layer the acts; matchMedia reverts all of it
 * when the window narrows or motion is turned off.
 */
export function AyadiUniverse({ photos = NO_PHOTOS }: { photos?: PhotoAvailability }) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const viewRef = useRef<View>(START);

  const [mode, setMode] = useState<'flow' | 'cinematic'>('flow');
  const [view, setView] = useState<View>(START);
  const [brand, setBrand] = useState<Brand>('cloudversity');
  /* Whether the visitor has chosen, as opposed to reading the default. */
  const [picked, setPicked] = useState(false);

  /* ---------- which layout ---------- */
  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add(CINEMATIC_QUERY, () => {
      setMode('cinematic');
      return () => setMode('flow');
    });

    return () => media.revert();
  }, []);

  /* ---------- the pinned story ---------- */
  useIsomorphicLayoutEffect(() => {
    if (mode !== 'cinematic') return;

    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const context = gsap.context((self) => {
      const q = self.selector!;
      const one = (name: string) => q(`[data-u="${name}"]`);

      const chooseLayers = [...one('choose-head'), ...one('choose-buttons')];

      /* ---------- rest states ---------- */
      gsap.set(one('globe-shell'), { scale: 0.55, '--globe-o': 0 });
      gsap.set(one('globe-logo'), { scale: 1 });
      gsap.set(one('globe-caption'), { autoAlpha: 0, y: 24 });
      gsap.set(chooseLayers, { autoAlpha: 0, y: 24 });
      gsap.set(one('eco'), { autoAlpha: 0, scale: 0.55, '--cp0': 0, '--cp1': 0, '--cp2': 0 });
      gsap.set(one('chapters'), { autoAlpha: 0, x: 60 });

      /* React only hears about it when the step actually changes — a handful
         of renders per pass through the story, never one per frame. */
      const sync = (trigger: ScrollTrigger) => {
        const next = viewAt(trigger.progress * TOTAL);
        const previous = viewRef.current;
        if (next.phase === previous.phase && next.chapter === previous.chapter && next.sub === previous.sub) return;
        viewRef.current = next;
        setView(next);
      };

      const timeline = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * PIN_SCREENS}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: SNAPS.map((time) => time / TOTAL),
            duration: { min: 0.25, max: 0.8 },
            delay: 0.12,
            ease: 'power1.inOut',
          },
          onUpdate: sync,
        },
      });

      /* ---------- act one → two: the logo becomes the core of a globe ---------- */
      timeline
        .fromTo(
          q('[data-u="globe-logo"] [data-mark-sheen]'),
          { xPercent: 0 },
          { xPercent: 220, duration: 1.2, ease: 'none' },
          0,
        )
        /* A full turn, so the mark comes to rest face-on as the globe's core. */
        .fromTo(
          q('[data-u="globe-logo"] [data-mark-spin]'),
          { rotationY: 0 },
          { rotationY: 360, duration: 2.1, ease: 'power1.inOut' },
          0.1,
        )
        .to(one('intro-copy'), { autoAlpha: 0, y: -48, duration: 0.6 }, 0.6)
        .to(one('globe-logo'), { scale: 0.46, duration: 1 }, 0.6)
        .to(one('globe-shell'), { scale: 1, '--globe-o': 1, duration: 1 }, 0.6)
        /* Settles 10vh lower, so the caption has room beneath it. */
        .to(one('globe'), { y: () => window.innerHeight * 0.1, duration: 1 }, 0.6)
        .to(one('globe-caption'), { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 1.35);

      /* ---------- the dive ----------
         The globe swells past the camera and dissolves as the worlds inside
         arrive out of depth — a flight through its surface. */
      timeline
        .to(one('globe-caption'), { autoAlpha: 0, y: -20, duration: 0.4 }, 2.15)
        .to(one('globe'), { scale: 5, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, 2.15)
        .to(one('backdrop'), { scale: 1.14, duration: 1.2 }, 2.1)
        .to(one('eco'), { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power2.out' }, 2.55)
        .to(chooseLayers, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08, ease: 'power2.out' }, 2.85);

      /* ---------- into the chapters ----------
         The worlds make room on the left; the chapters take the right. Which
         chapter shows is state, not scrub — see `sync`. */
      timeline
        .to(chooseLayers, { autoAlpha: 0, y: -20, duration: 0.35 }, 3.85)
        .to(one('eco'), { x: () => -window.innerWidth * 0.235, scale: 0.86, duration: 0.7 }, 3.9)
        .to(one('chapters'), { autoAlpha: 1, x: 0, duration: 0.55, ease: 'power2.out' }, 4.1);

      /* ---------- the world tells the chapter ----------
         One signal per chapter, scrubbed linearly so a scroll position always
         means the same stage of the build. The focused world turns them into
         its pathways, subjects, programmes, zones, tracks and structure. */
      CHAPTER_WINDOWS.forEach(([from, to], index) => {
        timeline.fromTo(one('eco'), { [`--cp${index}`]: 0 }, { [`--cp${index}`]: 1, duration: to - from, ease: 'none' }, from);
      });

      /* Sets the length: the last chapter holds until the pin releases. */
      timeline.set({}, {}, TOTAL);

      const trigger = timeline.scrollTrigger ?? null;
      triggerRef.current = trigger;
      /* Arriving mid-story (a refresh halfway down) starts on the right step. */
      if (trigger) sync(trigger);
    }, root);

    return () => {
      triggerRef.current = null;
      context.revert();
      viewRef.current = START;
      setView(START);
    };
  }, [mode]);

  /* ---------- navigation ---------- */
  const scrollToStep = useCallback((time: number) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * (time / TOTAL), behavior: 'smooth' });
  }, []);

  /* Choosing from the worlds or the buttons carries you into the chapters;
     choosing from the switch beside them keeps you where you are. */
  const choose = useCallback(
    (id: Brand) => {
      setBrand(id);
      setPicked(true);

      if (triggerRef.current) {
        if (viewRef.current.phase !== 'chapters') scrollToStep(STEPS[FIRST_CHAPTER]);
        return;
      }

      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('universe-chapters')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    },
    [scrollToStep],
  );

  const switchBrand = useCallback((id: Brand) => {
    setBrand(id);
    setPicked(true);
  }, []);

  const skip = useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger) window.scrollTo({ top: trigger.end + 2, behavior: 'smooth' });
  }, []);

  const isCinematic = mode === 'cinematic';

  /* In the pinned story the chosen world steps forward once the chapters
     start. In the flow layout it does as soon as the visitor picks. */
  const focus = isCinematic ? (view.phase === 'chapters' ? brand : null) : picked ? brand : null;

  /* Acts that are off screen stop animating. */
  const globeDormant = isCinematic && (view.phase === 'choose' || view.phase === 'chapters');
  const ecoDormant = isCinematic && (view.phase === 'intro' || view.phase === 'globe');

  const activeStep = stepOf(view);
  const railLabels = ['Ayadi', 'Universe', 'Choose', ...CHAPTERS[brand].map((chapter) => chapter.label)];

  return (
    <section
      ref={rootRef}
      aria-labelledby="hero-title"
      data-mode={mode}
      data-brand={brand}
      className={styles.root}
    >
      <div ref={stageRef} className={styles.stage}>
        <div data-u="backdrop" aria-hidden="true" className={styles.backdrop}>
          <span className={styles.stars} />
        </div>

        {/* ================= ACT ONE — the logo ================= */}
        <div className={styles.intro}>
          <div aria-hidden="true" className={`${styles.introLogo} ${styles.riseIn}`}>
            <AyadiMark3D />
          </div>

          <div data-u="intro-copy" className={styles.introCopy}>
            <div className={styles.riseIn} style={{ '--rise-delay': '0.15s' } as CSSProperties}>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Learning for every next step</p>

              <h1
                id="hero-title"
                className="mx-auto mt-4 max-w-3xl text-4xl font-extrabold tracking-[-0.055em] text-accent sm:text-5xl sm:leading-[1.06] xl:text-[3.3rem]"
              >
                Start Your Future Education With{' '}
                <span className="bg-brand-gradient bg-clip-text text-transparent">Ayadi Cloudversity</span>
              </h1>

              <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-muted sm:text-[1.0625rem]">
                At Ayadi Cloudversity, education goes beyond facts. It sparks curiosity, builds character, and shapes
                futures. From playschool to post-graduation to workspace readiness, we are with you, providing learning
                pathways, academic excellence, career preparedness and personal growth.
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-5 py-3 text-sm font-bold text-white shadow-md transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Explore Learning Paths
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>

                <span
                  aria-hidden="true"
                  className={`${styles.cue} items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted`}
                >
                  Scroll to explore
                  <ChevronDown size={15} className="text-primary motion-safe:animate-bounce" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= ACT TWO — the globe ================= */}
        <div className={`${styles.globeAct} ${globeDormant ? styles.dormant : ''}`}>
          <UniverseGlobe />

          <p data-u="globe-caption" className={styles.globeCaption}>
            <span className="block text-2xl font-bold tracking-[-0.03em] text-accent sm:text-3xl">
              Welcome to the{' '}
              <span className="bg-brand-gradient bg-clip-text text-transparent">Ayadi universe</span>
            </span>
            <span className="mt-2 block text-sm font-semibold text-muted sm:text-base">
              Where learning and technology meet.
            </span>
          </p>
        </div>

        {/* ================= ACT THREE — choose a world ================= */}
        <div className={styles.chooseAct}>
          <div data-u="choose-head" className={styles.chooseHead}>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Two worlds, one ecosystem</p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-accent sm:text-4xl">Choose your world</h2>
            <p className="mt-2 text-sm text-muted sm:text-base">Pick one to explore — you can switch at any time.</p>
          </div>

          <div data-u="eco" className={`${styles.eco} ${ecoDormant ? styles.dormant : ''}`}>
            <Hero3DEcosystem
              focus={focus}
              onSelectWorld={choose}
              chapter={isCinematic && view.phase === 'chapters' ? view.chapter : null}
              photos={photos}
            />
          </div>

          <div data-u="choose-buttons" className={styles.chooseButtons}>
            {BRANDS.map((id) => {
              const meta = BRAND_META[id];
              const Icon = meta.icon;

              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={picked ? brand === id : undefined}
                  onClick={() => choose(id)}
                  className="group inline-flex items-center gap-3 rounded-full bg-surface py-2 pl-2 pr-5 text-left shadow-[0_14px_34px_-20px_rgba(20,29,63,0.55)] ring-1 ring-inset ring-border transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:ring-primary/35 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <span className={`grid size-10 place-items-center rounded-full text-white ${meta.fill}`}>
                    <Icon aria-hidden="true" size={18} strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-text">{meta.name}</span>
                    <span className="block text-[11px] font-bold uppercase tracking-[0.12em] text-muted">{meta.kind}</span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    size={16}
                    className="text-primary transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= ACTS FOUR TO SIX — the chosen world ================= */}
        <div id="universe-chapters" data-u="chapters" className={styles.chaptersAct}>
          <BrandChapters
            brand={brand}
            chapter={view.chapter}
            litCard={isCinematic && view.phase === 'chapters' && view.chapter === 2 ? view.sub : null}
            onBrandChange={switchBrand}
          />
        </div>

        {/* ================= wayfinding ================= */}
        <nav aria-label="Story steps" className={styles.rail}>
          {railLabels.map((label, index) => {
            const isActive = activeStep === index;

            return (
              <button
                key={label}
                type="button"
                onClick={() => scrollToStep(STEPS[index])}
                aria-current={isActive ? 'step' : undefined}
                className="group flex items-center gap-3 rounded-full py-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <span
                  className={`text-[11px] font-bold uppercase tracking-[0.14em] transition-opacity duration-300 ${
                    isActive
                      ? 'text-primary opacity-100'
                      : 'text-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'
                  }`}
                >
                  {label}
                </span>
                <span
                  aria-hidden="true"
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? 'size-2.5 bg-primary shadow-[0_0_0_4px_rgba(21,128,61,0.15)]'
                      : 'size-2 bg-muted/40 group-hover:bg-primary/60'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={skip}
          className={`${styles.skip} items-center gap-1.5 rounded-full bg-surface/80 px-3.5 py-2 text-xs font-bold text-muted ring-1 ring-inset ring-border backdrop-blur transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
        >
          Skip intro
          <ChevronDown aria-hidden="true" size={14} />
        </button>
      </div>
    </section>
  );
}
