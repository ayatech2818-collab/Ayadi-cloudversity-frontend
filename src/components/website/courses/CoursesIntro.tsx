'use client';

import gsap from 'gsap';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { brands } from './brands';
import type { BrandId } from './types';

/* useLayoutEffect warns during SSR; the entrance has to run before paint or the
   hidden state flashes, so swap the hook rather than the timing. */
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const HEADLINE = [
  ['One', 'ecosystem,'],
  ['three', 'pathways.'],
];

/*
 * The courses intro.
 *
 * GSAP owns this section — a single entrance timeline, a cursor light driven by
 * quickTo, a magnetic call to action, and an indicator that slides between the
 * three pathways. Nothing here is scroll-linked, so it never competes with the
 * framer-driven pathway stage below it.
 *
 * Everything animated is transform or opacity, and the three coloured washes
 * cross-fade rather than re-tinting a single blurred layer — changing the
 * colour of a 130px blur re-rasters it every frame, changing its opacity does
 * not.
 */
export function CoursesIntro({ onSelectBrand }: { onSelectBrand: (id: BrandId) => void }) {
  const scope = useRef<HTMLElement>(null);
  const cursor = useRef<HTMLDivElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);

  const [active, setActive] = useState<BrandId>(brands[0].id);

  /* ---------- entrance + pointer ---------- */
  useIsomorphicLayoutEffect(() => {
    const context = gsap.context((self) => {
      const q = self.selector!;
      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.set([q('[data-reveal]'), q('[data-word]')], { autoAlpha: 0 });
        gsap.set(q('[data-word]'), { yPercent: 115, autoAlpha: 1 });
        gsap.set(q('[data-rule]'), { scaleX: 0, transformOrigin: 'left center' });

        const timeline = gsap.timeline({ defaults: { ease: 'expo.out' } });

        timeline
          .to(q('[data-reveal="eyebrow"]'), { autoAlpha: 1, y: 0, duration: 0.6 })
          .to(q('[data-word]'), { yPercent: 0, duration: 1.1, stagger: 0.06 }, '-=0.3')
          .to(q('[data-rule]'), { scaleX: 1, duration: 0.9, ease: 'power3.inOut' }, '-=0.55')
          .to(q('[data-reveal="lede"]'), { autoAlpha: 1, y: 0, duration: 0.7 }, '-=0.7')
          .to(q('[data-reveal="row"]'), { autoAlpha: 1, x: 0, duration: 0.7, stagger: 0.08 }, '-=0.55')
          .to(q('[data-reveal="cue"]'), { autoAlpha: 1, duration: 0.6 }, '-=0.4');
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

        /* Magnetic primary action */
        const magnet = q('[data-magnet]')[0] as HTMLElement | undefined;
        let magnetCleanup: (() => void) | undefined;

        if (magnet) {
          const pullX = gsap.quickTo(magnet, 'x', { duration: 0.5, ease: 'power3' });
          const pullY = gsap.quickTo(magnet, 'y', { duration: 0.5, ease: 'power3' });

          const onMagnetMove = (event: PointerEvent) => {
            const rect = magnet.getBoundingClientRect();
            pullX((event.clientX - (rect.left + rect.width / 2)) * 0.35);
            pullY((event.clientY - (rect.top + rect.height / 2)) * 0.45);
          };

          const onMagnetLeave = () => {
            pullX(0);
            pullY(0);
          };

          magnet.addEventListener('pointermove', onMagnetMove);
          magnet.addEventListener('pointerleave', onMagnetLeave);

          magnetCleanup = () => {
            magnet.removeEventListener('pointermove', onMagnetMove);
            magnet.removeEventListener('pointerleave', onMagnetLeave);
          };
        }

        return () => {
          section.removeEventListener('pointermove', onMove);
          section.removeEventListener('pointerenter', onEnter);
          section.removeEventListener('pointerleave', onLeave);
          magnetCleanup?.();
        };
      });

      return () => media.revert();
    }, scope);

    return () => context.revert();
  }, []);

  /* ---------- pathway focus ----------
     Deliberately not inside a gsap.context: reverting on every change would
     snap these back to their starting values. */
  useEffect(() => {
    const q = gsap.utils.selector(scope);

    brands.forEach((brand) => {
      const on = brand.id === active;

      gsap.to(q(`[data-wash="${brand.id}"]`), { autoAlpha: on ? 1 : 0, duration: 0.8, ease: 'power2.out' });
      gsap.to(q(`[data-ghost="${brand.id}"]`), {
        autoAlpha: on ? 1 : 0,
        yPercent: on ? 0 : 6,
        duration: 1,
        ease: 'power3.out',
      });
    });

    const move = () => {
      const row = q(`[data-row="${active}"]`)[0] as HTMLElement | undefined;
      if (!row || !indicator.current) return;

      gsap.to(indicator.current, {
        y: row.offsetTop,
        height: row.offsetHeight,
        duration: 0.5,
        ease: 'power3.out',
      });
    };

    move();

    window.addEventListener('resize', move);
    return () => window.removeEventListener('resize', move);
  }, [active]);

  const activeBrand = brands.find((brand) => brand.id === active) ?? brands[0];

  return (
    <section
      ref={scope}
      className="relative isolate flex min-h-[92svh] items-center overflow-hidden px-5 pb-20 pt-32 sm:px-8 sm:pt-36 lg:px-16 lg:pt-40"
    >
      {/* ---------- AMBIENT ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(30,43,87,0.07)_1px,transparent_1px)] bg-size-[28px_28px] [mask-image:radial-gradient(ellipse_at_50%_40%,black_5%,transparent_72%)]" />

        {/* One wash per pathway; they cross-fade instead of re-tinting */}
        {brands.map((brand) => (
          <div
            key={brand.id}
            data-wash={brand.id}
            style={{ opacity: 0 }}
            className={`absolute -right-32 -top-32 size-[620px] rounded-full blur-[140px] ${brand.theme.glow}`}
          />
        ))}

        <div className="absolute -left-40 bottom-0 size-[460px] rounded-full bg-accent/[0.06] blur-[130px]" />

        {/* Cursor light */}
        <div
          ref={cursor}
          style={{ opacity: 0 }}
          className="absolute -left-[280px] -top-[280px] size-[560px] rounded-full bg-primary/[0.09] blur-[120px]"
        />

        {/* Ghost wordmark of the focused pathway */}
        <div className="absolute inset-y-0 right-0 hidden items-center overflow-hidden lg:flex">
          {brands.map((brand) => (
            <span
              key={brand.id}
              data-ghost={brand.id}
              style={{ opacity: 0 }}
              className="absolute right-[-2%] whitespace-nowrap text-[13vw] font-bold leading-none tracking-[-0.06em] text-accent/[0.05]"
            >
              {brand.shortName}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- CONTENT ---------- */}
      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <span
            data-reveal="eyebrow"
            className="inline-flex translate-y-4 items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary"
          >
            <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
            Courses &amp; Programmes
          </span>

          <h1 className="mt-7 text-[2.6rem] font-semibold leading-[1.0] tracking-[-0.05em] text-accent sm:text-6xl lg:text-[4.6rem]">
            {HEADLINE.map((line, lineIndex) => (
              <span key={lineIndex} className="relative block">
                {line.map((word) => (
                  <span key={word} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <span data-word className="mr-[0.22em] inline-block">
                      {word}
                    </span>
                  </span>
                ))}

                {lineIndex === 1 ? (
                  <span
                    data-rule
                    aria-hidden="true"
                    className="absolute -bottom-0.5 left-0 block h-[5px] w-[6.2em] rounded-full bg-brand-gradient"
                  />
                ) : null}
              </span>
            ))}
          </h1>

          <p data-reveal="lede" className="mt-9 max-w-md translate-y-4 text-lg leading-8 text-muted">
            Ayadi Cloudversity and its two sub-brands — each built for a different kind of learner.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              type="button"
              data-magnet
              data-reveal="lede"
              onClick={() => onSelectBrand(activeBrand.id)}
              className={`group inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-lg transition-shadow duration-300 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 ${activeBrand.theme.gradient} ${activeBrand.theme.outline}`}
            >
              Explore {activeBrand.shortName}
              <ArrowRight
                aria-hidden="true"
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <p
              data-reveal="cue"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-muted/70"
            >
              <ArrowDown aria-hidden="true" size={14} className="text-primary motion-safe:animate-bounce" />
              Scroll to explore
            </p>
          </div>
        </div>

        {/* ---------- PATHWAY SELECTOR ---------- */}
        <div className="relative">
          {/* Slides to whichever row has focus */}
          <span
            ref={indicator}
            aria-hidden="true"
            className={`absolute left-0 top-0 block w-[3px] rounded-full ${activeBrand.theme.gradient}`}
          />

          <ul className="relative">
            {brands.map((brand, index) => {
              const isActive = brand.id === active;

              return (
                <li key={brand.id} data-row={brand.id}>
                  {index > 0 ? <span aria-hidden="true" className="block h-px bg-border" /> : null}

                  <button
                    type="button"
                    data-reveal="row"
                    onPointerEnter={() => setActive(brand.id)}
                    onFocus={() => setActive(brand.id)}
                    onClick={() => onSelectBrand(brand.id)}
                    className={`group flex w-full translate-x-6 items-center gap-5 py-6 pl-6 pr-2 text-left transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 ${brand.theme.outline}`}
                  >
                    <span className={`font-mono text-[11px] font-bold tracking-[0.2em] ${brand.theme.text}`}>
                      {brand.index}
                    </span>

                    <span className="flex-1">
                      <span
                        className={`block text-xl font-semibold tracking-[-0.02em] transition-colors duration-300 ${
                          isActive ? brand.theme.text : 'text-accent'
                        }`}
                      >
                        {brand.name}
                      </span>

                      <span className="mt-1 block text-sm text-muted">{brand.role}</span>
                    </span>

                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        isActive ? `text-white ${brand.theme.gradient}` : `${brand.theme.soft} ${brand.theme.text}`
                      }`}
                    >
                      <ArrowRight
                        aria-hidden="true"
                        size={15}
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
