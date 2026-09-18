'use client';

import { motion } from 'framer-motion';

import { brands } from './brands';
import type { BrandId } from './types';

/*
 * Sticky brand switcher. It sits just below the navbar so the pathway you are
 * reading is always named on screen, and the active pill slides between the
 * three via a shared layoutId.
 */
export function CourseBrandTabs({
  activeBrand,
  onSelectBrand,
}: {
  activeBrand: BrandId;
  onSelectBrand: (id: BrandId) => void;
}) {
  return (
    <div className="sticky top-[84px] z-30 px-5 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1180px]">
        <div
          role="tablist"
          aria-label="Learning pathways"
          className="flex gap-1.5 rounded-2xl bg-surface/90 p-1.5 shadow-[0_18px_40px_-28px_rgba(20,29,63,0.45)] ring-1 ring-inset ring-border backdrop-blur-sm"
        >
          {brands.map((brand) => {
            const isActive = brand.id === activeBrand;
            const Icon = brand.icon;

            return (
              <button
                key={brand.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${brand.id}`}
                id={`tab-${brand.id}`}
                onClick={() => onSelectBrand(brand.id)}
                className={`relative flex flex-1 items-center justify-center gap-2.5 rounded-xl px-3 py-3 text-sm font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-5 ${brand.theme.outline} ${
                  isActive ? 'text-white' : `text-muted ${brand.theme.hoverText}`
                }`}
              >
                {isActive ? (
                  <motion.span
                    layoutId="brand-tab-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className={`absolute inset-0 rounded-xl shadow-lg ${brand.theme.gradient}`}
                  />
                ) : null}

                <span className="relative flex items-center gap-2.5">
                  <Icon aria-hidden="true" size={17} strokeWidth={2} />

                  <span className="hidden sm:inline">{brand.shortName}</span>

                  <span
                    className={`hidden text-[10px] font-bold uppercase tracking-[0.16em] lg:inline ${
                      isActive ? 'text-white/65' : 'text-muted/60'
                    }`}
                  >
                    {brand.index}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
