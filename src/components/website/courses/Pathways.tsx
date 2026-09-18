'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';

import { handleSpotlight } from '@/components/website/ui/card-chrome';

import { brands, type Brand } from './brands';
import type { BrandId } from './types';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* Matches the framer EASE above so the entrance and the panels feel related. */
const PANEL_EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/*
 * The pathways, as expanding panels.
 *
 * Deliberately NOT another pinned scroll stage — HowItWorks and the media reel
 * already use that, and a third would read as a tic rather than a decision.
 * Here the visitor drives: hovering, tabbing or tapping a panel opens it while
 * the other two fold down to their spines.
 *
 * Only `flex-grow` and opacity animate. Layout on three siblings is cheap, and
 * it buys a genuinely tactile interaction that no transform could fake.
 */
export function Pathways({ onSelectBrand }: { onSelectBrand: (id: BrandId) => void }) {
  const reduceMotion = useReducedMotion();
  const [active, setActive] = useState<BrandId>(brands[0].id);

  return (
    <section aria-labelledby="pathways-heading" className="px-5 pb-24 pt-8 sm:px-8 lg:px-16 lg:pb-32">
      <div className="mx-auto max-w-[1180px]">
        <motion.div
          variants={stagger}
          initial={reduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-2xl"
        >
          <motion.span
            variants={fadeUp}
            className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary"
          >
            <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
            The pathways
          </motion.span>

          <motion.h2
            id="pathways-heading"
            variants={fadeUp}
            className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-accent sm:text-4xl lg:text-5xl"
          >
            One parent. Two specialists.
          </motion.h2>

          <motion.p variants={fadeUp} className="mt-5 text-base leading-8 text-muted">
            Ayadi Cloudversity runs the core programmes. AyaTech and Netscape are its sub-brands — one built for
            technology, one built entirely for teachers.
          </motion.p>
        </motion.div>

        <motion.ul
          variants={fadeUp}
          initial={reduceMotion ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          /* Same mechanic on both axes: the container has a definite size, so
             flex-grow divides it whichever way the panels are stacked. */
          className="mt-12 flex h-[600px] flex-col gap-3 sm:h-[640px] lg:h-[620px] lg:flex-row"
        >
          {brands.map((brand) => (
            <PathwayPanel
              key={brand.id}
              brand={brand}
              isActive={brand.id === active}
              onActivate={() => setActive(brand.id)}
              onSelectBrand={onSelectBrand}
            />
          ))}
        </motion.ul>

        <p className="mt-6 text-center text-xs font-bold uppercase tracking-[0.18em] text-muted/60 lg:text-left">
          Hover or tap a pathway to open it
        </p>
      </div>
    </section>
  );
}

function PathwayPanel({
  brand,
  isActive,
  onActivate,
  onSelectBrand,
}: {
  brand: Brand;
  isActive: boolean;
  onActivate: () => void;
  onSelectBrand: (id: BrandId) => void;
}) {
  const Icon = brand.icon;

  return (
    <li
      style={{ flexGrow: isActive ? 2.9 : 1 }}
      className={`relative min-h-0 min-w-0 transition-[flex-grow] duration-700 ${PANEL_EASE}`}
    >
      <button
        type="button"
        onPointerEnter={onActivate}
        onFocus={onActivate}
        onPointerMove={handleSpotlight}
        onClick={() => (isActive ? onSelectBrand(brand.id) : onActivate())}
        aria-expanded={isActive}
        className={`group relative isolate size-full overflow-hidden rounded-[1.75rem] text-left shadow-[0_30px_70px_-40px_rgba(20,29,63,0.6)] focus-visible:outline-2 focus-visible:outline-offset-4 ${brand.theme.gradient} ${brand.theme.outline}`}
      >
        {/* ---------- DECOR ---------- */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(rgba(255,255,255,0.18)_1px,transparent_1px)] bg-size-[26px_26px] [mask-image:radial-gradient(ellipse_at_35%_25%,black_10%,transparent_75%)]"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent"
        />

        {/* Cursor light, same device as the cards elsewhere */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(255,255,255,0.22), transparent 70%)',
          }}
        />

        {/* ---------- SPINE (collapsed) ---------- */}
        <span
          aria-hidden={isActive}
          className={`absolute inset-0 flex items-end p-6 transition-opacity duration-500 lg:p-7 ${
            isActive ? 'pointer-events-none opacity-0' : 'opacity-100 delay-200'
          }`}
        >
          <span className="flex items-center gap-4 lg:flex-col-reverse lg:items-start lg:gap-5">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-white/55">{brand.index}</span>

            <span className="text-lg font-bold tracking-[-0.02em] text-white lg:rotate-180 lg:[writing-mode:vertical-rl]">
              {brand.shortName}
            </span>

            <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-inset ring-white/25 lg:order-first">
              <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
            </span>
          </span>
        </span>

        {/* ---------- DETAIL (expanded) ---------- */}
        <span
          className={`absolute inset-0 flex flex-col justify-end p-7 transition-all duration-500 sm:p-9 lg:p-10 ${
            isActive ? 'opacity-100 delay-150' : 'pointer-events-none translate-y-3 opacity-0'
          }`}
        >
          <span className="flex items-center justify-between gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-inset ring-white/25">
              <Icon aria-hidden="true" size={22} strokeWidth={1.9} />
            </span>

            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/85 ring-1 ring-inset ring-white/25">
              {brand.kind}
            </span>
          </span>

          <span className="mt-auto block pt-8">
            <span className="font-mono text-[11px] font-bold tracking-[0.22em] text-white/55">{brand.index}</span>

            <span className="mt-3 block text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              {brand.name}
            </span>

            <span className="mt-2 block text-sm font-bold uppercase tracking-[0.16em] text-white/75">{brand.role}</span>

            <span className="mt-5 block max-w-md text-sm leading-7 text-white/80 sm:text-base sm:leading-8">
              {brand.description}
            </span>

            <span className="mt-6 flex flex-wrap gap-2">
              {brand.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-bold text-white ring-1 ring-inset ring-white/25"
                >
                  {highlight}
                </span>
              ))}
            </span>

            <span className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-bold text-accent shadow-lg transition-transform duration-300 group-hover:-translate-y-0.5">
              See {brand.shortName} programmes
              <ArrowRight
                aria-hidden="true"
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
