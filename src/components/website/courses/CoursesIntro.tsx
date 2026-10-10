'use client';

import gsap from 'gsap';
import { Compass } from 'lucide-react';
import { Fragment, useEffect, useLayoutEffect, useRef } from 'react';

import { categoryStyle } from './categoryStyles';
import { CourseSearch } from './CourseSearch';
import type { CatalogueCategory } from './types';

/* useLayoutEffect warns during SSR; the entrance has to run before paint or the
   hidden state flashes, so swap the hook rather than the timing. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const HEADLINE = [
  ['Discover', 'your', 'next'],
  ['learning', 'journey.'],
];

/* Where each category's tile rides the outer ring, as its centre point —
   roughly a third of a turn apart. A fourth category would simply not get
   one: the orbit is decoration, the tiles below are the navigation. */
const SATELLITES = ['left-[7%] top-[25%]', 'left-[97%] top-[38%]', 'left-[33%] top-[97%]'];

/*
 * The courses intro.
 *
 * A short hero with as few words as it can get away with: the headline, one
 * line under it, the search, and an orbit of the three categories as its one
 * decorative accent. It is deliberately not a full screen — the catalogue
 * should already be showing underneath it on a laptop.
 *
 * GSAP owns the motion: a single entrance timeline and a cursor light driven
 * by quickTo. Everything animated is transform or opacity, and all of it is
 * skipped under prefers-reduced-motion, where the section simply renders.
 */
export function CoursesIntro({
  categories,
  query,
  onQueryChange,
  onSearchSubmit,
}: {
  categories: CatalogueCategory[];
  query: string;
  onQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
}) {
  const scope = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const context = gsap.context((self) => {
      const q = self.selector!;
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set(q('[data-reveal]'), { autoAlpha: 0, y: 16 });
        gsap.set(q('[data-word]'), { yPercent: 115 });
        gsap.set(q('[data-rule]'), { scaleX: 0, transformOrigin: 'left center' });
        gsap.set(q('[data-orbit]'), { autoAlpha: 0, scale: 0.9 });
        gsap.set(q('[data-satellite]'), { autoAlpha: 0, scale: 0.4 });

        const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } });

        timeline
          .to(q('[data-reveal="eyebrow"]'), { autoAlpha: 1, y: 0, duration: 0.6 })
          .to(q('[data-word]'), { yPercent: 0, duration: 1.1, stagger: 0.06 }, '-=0.3')
          .to(q('[data-rule]'), { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.55')
          .to(q('[data-reveal="lede"]'), { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }, '-=0.7')
          .to(q('[data-orbit]'), { autoAlpha: 1, scale: 1, duration: 1.2 }, 0.2)
          .to(
            q('[data-satellite]'),
            { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.7)', stagger: 0.1 },
            0.6,
          );
      });

      /* A cursor light is noise on touch, and quickTo is the reason GSAP is
         here — it re-uses one tween instead of creating one per move. */
      media.add('(prefers-reduced-motion: no-preference) and (pointer: fine)', () => {
        const light = cursor.current;
        const section = scope.current;
        if (!light || !section) return;

        const moveX = gsap.quickTo(light, 'x', { duration: 0.7, ease: 'power3' });
        const moveY = gsap.quickTo(light, 'y', { duration: 0.7, ease: 'power3' });

        const onMove = (event: PointerEvent) => {
          const rect = section.getBoundingClientRect();
          moveX(event.clientX - rect.left);
          moveY(event.clientY - rect.top);
        };

        const onEnter = () => gsap.to(light, { autoAlpha: 1, duration: 0.5 });
        const onLeave = () => gsap.to(light, { autoAlpha: 0, duration: 0.5 });

        section.addEventListener('pointermove', onMove);
        section.addEventListener('pointerenter', onEnter);
        section.addEventListener('pointerleave', onLeave);

        return () => {
          section.removeEventListener('pointermove', onMove);
          section.removeEventListener('pointerenter', onEnter);
          section.removeEventListener('pointerleave', onLeave);
        };
      });

      return () => media.revert();
    }, scope);

    return () => context.revert();
  }, []);

  return (
    <section
      ref={scope}
      aria-labelledby="courses-heading"
      className="relative isolate overflow-hidden px-5 pb-8 pt-32 sm:px-8 sm:pt-36 lg:px-16 lg:pb-10 lg:pt-40"
    >
      {/* ---------- AMBIENT ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(30,43,87,0.07)_1px,transparent_1px)] bg-size-[28px_28px] [mask-image:radial-gradient(ellipse_at_50%_40%,black_5%,transparent_72%)]" />

        {/* Static washes — an animated blur this size repaints every frame */}
        <div className="absolute -right-32 -top-32 size-[620px] rounded-full bg-primary/[0.16] blur-[140px]" />
        <div className="absolute -left-40 bottom-0 size-[460px] rounded-full bg-accent/[0.06] blur-[130px]" />

        {/* Cursor light */}
        <div
          ref={cursor}
          style={{ opacity: 0 }}
          className="absolute -left-[280px] -top-[280px] size-[560px] rounded-full bg-primary/[0.09] blur-[120px]"
        />
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div>
          <span
            data-reveal="eyebrow"
            className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary"
          >
            <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
            Ayadi Cloudversity
          </span>

          {/* Each word slides up from behind its own clip. The spaces are real
              text nodes, so the heading still reads as a sentence to a screen
              reader or a crawler. */}
          <h1
            id="courses-heading"
            className="mt-6 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-accent sm:text-6xl lg:text-[3.4rem] xl:text-[4rem]"
          >
            {HEADLINE.map((line, lineIndex) => {
              const isLastLine = lineIndex === HEADLINE.length - 1;

              return (
                <span key={lineIndex} className="block">
                  <span className="relative inline-block">
                    {line.map((word, wordIndex) => (
                      <Fragment key={word}>
                        {wordIndex > 0 ? ' ' : null}

                        <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                          <span data-word className="inline-block">
                            {word}
                          </span>
                        </span>
                      </Fragment>
                    ))}

                    {isLastLine ? (
                      <span
                        data-rule
                        aria-hidden="true"
                        className="absolute -bottom-1.5 left-0 block h-[5px] w-full rounded-full bg-brand-gradient"
                      />
                    ) : null}
                  </span>

                  {isLastLine ? null : ' '}
                </span>
              );
            })}
          </h1>

          <p data-reveal="lede" className="mt-6 text-base text-muted sm:text-lg">
            Courses for every stage of learning.
          </p>

          <div data-reveal="lede" className="mt-7 max-w-xl">
            <CourseSearch value={query} onChange={onQueryChange} onSubmit={onSearchSubmit} />
          </div>
        </div>

        {/* ---------- ORBIT ----------
            The hero's one accent: the categories circling a navy core. Purely
            decorative, and dropped below `lg` to keep the hero short. */}
        <div
          data-orbit
          aria-hidden="true"
          className="relative mx-auto hidden aspect-square w-full max-w-[300px] lg:block"
        >
          <span className="absolute inset-[12%] rounded-full bg-hero-ambient" />
          <span className="absolute inset-0 rounded-full border border-accent/10" />
          <span className="absolute inset-[15%] rounded-full border border-dashed border-primary/30" />
          <span className="absolute inset-[30%] rounded-full border border-accent/10" />

          <span className="absolute inset-[36%] flex items-center justify-center rounded-[30%] bg-accent-gradient text-white shadow-[0_28px_56px_-22px_rgba(20,29,63,0.7)] ring-1 ring-inset ring-white/15">
            <Compass size={34} strokeWidth={1.5} />
          </span>

          {/* A marker riding the dashed ring */}
          <span className="absolute left-1/2 top-[15%] size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient ring-4 ring-page" />

          {categories.slice(0, SATELLITES.length).map((category, index) => {
            const style = categoryStyle(category.slug);
            const Icon = style.icon;

            return (
              /* Three layers on purpose: Tailwind places this one (`translate`),
                 GSAP scales it in (`transform`), and the float below is a CSS
                 animation — which would override GSAP if they shared an
                 element. */
              <span
                key={category.id}
                data-satellite
                className={`absolute -translate-x-1/2 -translate-y-1/2 ${SATELLITES[index]}`}
              >
                <span
                  className="flex size-14 items-center justify-center rounded-2xl bg-surface shadow-[0_18px_36px_-18px_rgba(20,29,63,0.45)] ring-1 ring-inset ring-border motion-safe:animate-[icon-float_4.5s_ease-in-out_infinite]"
                  style={{ animationDelay: `${index * 0.8}s` }}
                >
                  <span className={`flex size-10 items-center justify-center rounded-xl ${style.tile}`}>
                    <Icon size={19} strokeWidth={1.9} />
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
