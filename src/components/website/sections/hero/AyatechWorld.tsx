'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

import { brandById } from '@/components/website/courses/brands';

import styles from './ayatech.module.css';
import { AyatechHud } from './ayatech/AyatechHud';
import { AYADI_LOGO, AYATECH_LOGO, COPY, DOMAINS, IDEA, IDENTITY, LAYERS, PATHS, PILLARS, PLOTS } from './ayatech/content';
import { cueCopy, restCopy } from './ayatech/cues';
import { COMPACT, WIDE } from './ayatech/layout';
import { ProgrammeStrip } from './ayatech/ProgrammeStrip';
import { createRig, registerRig, releaseRig, type AyatechRig } from './ayatech/rig';
import { createScene } from './ayatech/scene';
import { CHAPTER_VIEW, chapterAt, restOf, scoreStory, SCROLL, TOTAL } from './ayatech/score';
import { stopAyatechIntro } from './ayatechIntro';
import { pickQuality } from './rig';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const brand = brandById.ayatech;

/** The fixed navbar: the stage pins this far down, as Cloudversity's does. */
const NAV_CLEARANCE = 84;

const MOTION = '(prefers-reduced-motion: no-preference)';
/* A frame taller than it is wide gets the world composed for it (layout.ts). */
const TALL = '(max-width: 767px), (orientation: portrait)';

/*
 * AyaTech's world: one signal, and what it becomes.
 *
 *   IDEA        dark, and one point of light
 *   EXPLORE     it opens into seven domains of technology
 *   LEARN       routes light through them
 *   EXPERIMENT  they try each other; one arrangement holds
 *   BUILD       that arrangement becomes a running system
 *   DELIVER     the system is Ayadi's — then one plot among many still to build
 *   the name    learn, build, deliver, round AYATECH
 *
 * The same shape the hero and Cloudversity's journey have: one pinned stage,
 * one scrubbed timeline (ayatech/score.ts), scroll the only clock. The
 * timeline moves a rig of plain numbers; a 2D canvas draws the world from it
 * (ayatech/scene/); the words over it are this file's, cued on the same
 * timeline (ayatech/cues.ts).
 *
 * It is deliberately the other world: Cloudversity is photographs and people
 * on a light page, this is a system being built in the dark.
 *
 * Without motion, or without a canvas, none of that is set up and the markup
 * stands as it ships: the same words down a dark page, complete.
 *
 * What the hero needs of it (AyadiHero.tsx, worldEntrance.ts) is unchanged:
 * a section that pins itself where its top meets the navbar, a rest state
 * that is composed without the intro, and the intro in ayatechIntro.ts.
 */
export function AyatechWorld() {
  const scopeRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const rig = useRef<AyatechRig>(createRig());

  useIsomorphicLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const scope = scopeRef.current;
    const frame = frameRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!scope || !frame || !stage || !canvas) return;

    const state = rig.current;
    const media = gsap.matchMedia();
    /* True for the first stage this mount builds; a later one (the window
       turned, or resized across the breakpoint) is not an arrival. */
    let fresh = true;

    media.add({ motion: MOTION, tall: TALL }, (context) => {
      const { motion, tall } = context.conditions as { motion: boolean; tall: boolean };
      if (!motion) return;

      const layout = tall ? COMPACT : WIDE;
      const scene = createScene({
        canvas,
        rig: state,
        layout,
        quality: pickQuality(),
        createCanvas: () => document.createElement('canvas'),
      });
      if (!scene) return;

      /* ---------- the stage ----------
         From here the section is a pinned stage rather than a page: the CSS
         stacks every beat on it, and the story starts from rest. */
      Object.assign(state, restOf(layout));
      scope.dataset.mode = 'cinematic';
      scope.toggleAttribute('data-compact', tall);
      registerRig(scope, state);

      /* The canvas is fitted to the stage, and the page's own pieces that
         stand in the scene — the marks, the three labels round the name —
         are told where its centre is and how big a unit of it is. */
      const fit = () => {
        const { unit, cy, aside } = scene.resize(stage.clientWidth, stage.clientHeight);
        stage.style.setProperty('--u', `${unit.toFixed(2)}px`);
        stage.style.setProperty('--cy', `${cy.toFixed(1)}px`);
        stage.style.setProperty('--aside', `${aside.toFixed(1)}px`);
        scene.render(performance.now());
      };
      fit();
      const watchSize = new ResizeObserver(fit);
      watchSize.observe(stage);

      /* ---------- the story ---------- */
      const q = gsap.utils.selector(scope);
      restCopy(q);

      const timeline = gsap.timeline({
        defaults: { ease: 'none', immediateRender: false },
        scrollTrigger: {
          trigger: scope,
          pin: frame,
          start: `top ${NAV_CLEARANCE}px`,
          end: `+=${tall ? SCROLL.compact : SCROLL.wide}%`,
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });
      scoreStory(timeline, state, layout);
      cueCopy(timeline, q);
      /* Pad the end, so the name holds before the page moves on. */
      timeline.set({}, {}, TOTAL);
      const trigger = timeline.scrollTrigger ?? null;
      triggerRef.current = trigger;

      /* Mounted with the page already scrolled past its start: a switch
         from inside the other world. The hero is about to bring the page to
         this world's beginning (AyadiHero.tsx) — so begin there now, rather
         than be caught rewinding to it as the light clears. */
      if (fresh && trigger && trigger.progress > 0) {
        trigger.getTween()?.pause();
        timeline.progress(0);
      }
      fresh = false;

      /* Which chapter the rail names. Written to the DOM as the timeline
         crosses into one — the timeline's own time, so it changes with what
         is on screen rather than ahead of it. */
      const chapters = q('[data-hud="chapter"]') as HTMLElement[];
      let marked = -1;
      const mark = () => {
        const chapter = chapterAt(timeline.time());
        if (chapter === marked) return;
        marked = chapter;
        chapters.forEach((button, index) => {
          if (index === chapter) button.setAttribute('aria-current', 'step');
          else button.removeAttribute('aria-current');
        });
      };
      timeline.eventCallback('onUpdate', mark);
      mark();

      /* ---------- one at a time ----------
         The scene draws only while it can be seen: on screen, the tab in
         front, and its world not still hidden — the hero keeps a world at
         opacity 0 under its own scene until the crossing is over, and two
         scenes should not be drawing through that. */
      const host = scope.parentElement;
      let onScreen = false;
      const sync = () => {
        const shown = !host || Number(getComputedStyle(host).opacity) > 0.01;
        if (onScreen && shown && !document.hidden) scene.start();
        else scene.stop();
      };
      const watchScreen = new IntersectionObserver(([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      });
      watchScreen.observe(stage);
      const watchHost = new MutationObserver(sync);
      if (host) watchHost.observe(host, { attributes: true, attributeFilter: ['style', 'data-on'] });
      document.addEventListener('visibilitychange', sync);

      /* The pointer leans the camera a little. Mouse only. */
      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== 'mouse') return;
        state.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
        state.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
      };
      window.addEventListener('pointermove', onPointerMove, { passive: true });

      return () => {
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('visibilitychange', sync);
        watchHost.disconnect();
        watchScreen.disconnect();
        watchSize.disconnect();
        scene.destroy();
        releaseRig(scope);
        triggerRef.current = null;

        chapters.forEach((button) => button.removeAttribute('aria-current'));
        for (const name of ['--u', '--cy', '--aside']) stage.style.removeProperty(name);
        scope.removeAttribute('data-compact');
        delete scope.dataset.mode;
        state.pointerX = 0;
        state.pointerY = 0;
      };
    });

    return () => {
      /* The intro runs on its own clock (ayatechIntro.ts); leaving the world ends it. */
      stopAyatechIntro(scope);
      media.revert();
    };
  }, []);

  /* Straight to a moment of the story. Instant: the scrub carries the scene
     there quickly on its way, as the hero's skip does. */
  const goTo = useCallback((time: number) => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * (time / TOTAL), behavior: 'instant' });
  }, []);

  const jump = useCallback((chapter: number) => goTo(CHAPTER_VIEW[chapter] ?? 0), [goTo]);
  /* To the name and the two ways on — still inside the pin, not past it. */
  const skip = useCallback(() => goTo(TOTAL - 0.04), [goTo]);

  return (
    <section ref={scopeRef} id="ayatech-world" aria-label={brand.name} data-ayatech="" className={styles.section}>
      <h2 className="sr-only">{brand.name}</h2>

      {/* What pins: the stage, and above it the strip of dark that runs up
          behind the navbar while it is pinned. */}
      <div ref={frameRef} className={styles.frame}>
        <div aria-hidden="true" className={styles.bleed} />

        <div ref={stageRef} className={styles.stage}>
          <div aria-hidden="true" className={styles.backdrop}>
            {/* The last of the light the reader came through, for the intro
                to fold into the signal. */}
            <span data-intro="afterglow" className={styles.afterglow} />
          </div>

          <canvas ref={canvasRef} aria-hidden="true" className={styles.canvas} />
          <div aria-hidden="true" className={styles.shade} />

          <div className={styles.copy}>
            {/* IDEA — centred, under the signal. */}
            <div data-idea="" className={styles.idea}>
              <p data-el="idea-kicker" className={styles.kicker}>
                {IDEA.kicker}
              </p>
              <h3 className={styles.ideaTitle}>
                {IDEA.lines.map((line, index) => (
                  <span key={line} data-accent={index === IDEA.lines.length - 1 || undefined} className={styles.ideaLine}>
                    {line.split(' ').map((word, position) => (
                      <span key={`${word}-${position}`}>
                        <span className={styles.wordMask}>
                          <span data-word="" className={styles.word}>
                            {word}
                          </span>
                        </span>{' '}
                      </span>
                    ))}
                  </span>
                ))}
              </h3>
            </div>

            <Beat copy={COPY.explore} id="explore" late>
              <Tags items={DOMAINS.map(({ name }) => name)} />
            </Beat>

            <Beat copy={COPY.learn} id="learn" word>
              <ProgrammeStrip />
            </Beat>

            <Beat copy={COPY.experiment} id="experiment" word />

            <Beat copy={COPY.build} id="build" late>
              <Tags items={LAYERS} />
            </Beat>

            {/* Ayadi's own mark, over the system once it is Ayadi's. */}
            <div data-el="ayadi" className={styles.ayadi}>
              <Image src={AYADI_LOGO} alt="Ayadi Cloudversity" width={3116} height={1701} sizes="(min-width: 768px) 28vw, 56vw" />
            </div>

            <Beat copy={COPY.deliver} id="deliver" />

            <Beat copy={COPY.beyond} id="beyond">
              <Tags items={PLOTS} dashed />
            </Beat>

            {/* The three arcs, named. The canvas draws the arcs; these stand
                at them (--u and --cy, from the scene). */}
            <ul className={styles.pillars}>
              {PILLARS.map(({ id, word, line }) => (
                <li key={id} data-el="pillar" data-pillar={id} className={styles.pillar}>
                  <span className={styles.pillarWord}>{word}</span>
                  <span className={styles.pillarLine}>{line}</span>
                </li>
              ))}
            </ul>

            {/* The name. In light inside the arcs — the logo's own artwork
                used as a mask, since its navy half would vanish on this
                ground — then, as the arcs go, the official logo as drawn, on
                a lit plate. */}
            <div className={styles.identity}>
              <div className={styles.mark}>
                <span data-el="mark-plate" aria-hidden="true" className={styles.markPlate} />
                <span data-el="mark-light" aria-hidden="true" className={styles.markLight}>
                  <span
                    style={{ maskImage: `url(${AYATECH_LOGO})`, WebkitMaskImage: `url(${AYATECH_LOGO})` }}
                    className={styles.markInk}
                  />
                </span>
                <Image
                  data-el="mark-true"
                  src={AYATECH_LOGO}
                  alt="AyaTech"
                  width={1000}
                  height={450}
                  loading="eager"
                  unoptimized
                  className={styles.markTrue}
                />
              </div>

              <p data-el="say" className={styles.fields}>
                {IDENTITY.fields}
              </p>
              <p data-el="say" className={styles.motto}>
                {IDENTITY.motto}
              </p>
              <p data-el="say" className={styles.creed}>
                {IDENTITY.creed}
              </p>
              <div data-el="say" className={styles.ctas}>
                <Link href={PATHS.courses} className={styles.ctaLearn}>
                  {IDENTITY.learn}
                  <ArrowRight aria-hidden="true" size={16} />
                </Link>
                <Link href={PATHS.build} className={styles.ctaBuild}>
                  {IDENTITY.build}
                  <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* The intro brings the outer element in; the scroll takes the
              inner one away. Two elements, so neither undoes the other. */}
          <p data-intro="hint" aria-hidden="true" className={styles.hint}>
            <span data-hud="hint" className={styles.hintInner}>
              Scroll to begin
            </span>
          </p>

          <AyatechHud onJump={jump} onSkip={skip} />
        </div>

        {/* Light from above, where the world switcher sits: that control is
            glass made for a light page, and this is what it is read against. */}
        <div aria-hidden="true" className={styles.skylight} />
      </div>

      {/* The dark letting go, back into the page. */}
      <div aria-hidden="true" className={styles.outro} />
    </section>
  );
}

/* One beat's words: what it is called, what it says, and the line under it.
   `word` is a one-word title, set large; `late` holds the line back for its
   own cue (ayatech/cues.ts). */
function Beat({
  id,
  copy,
  word = false,
  late = false,
  children,
}: {
  id: keyof typeof COPY;
  copy: { kicker: string; title: string; line: string };
  word?: boolean;
  late?: boolean;
  children?: ReactNode;
}) {
  return (
    <div data-beat={id} className={styles.beat}>
      <p className={styles.kicker}>{copy.kicker}</p>
      <h3 data-size={word ? 'word' : undefined} className={styles.title}>
        {copy.title}
      </h3>
      <p data-late={late ? '' : undefined} className={styles.line}>
        {copy.line}
      </p>
      {children}
    </div>
  );
}

/* What the canvas is drawing at this point, in words. On the stage it is for
   screen readers only; without the canvas it is the picture. */
function Tags({ items, dashed = false }: { items: readonly string[]; dashed?: boolean }) {
  return (
    <ul data-dashed={dashed || undefined} className={styles.tags}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
