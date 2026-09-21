import Link from 'next/link';
import type { CSSProperties } from 'react';

import { CARD_CHROME, CardDecor, handleSpotlight } from '@/components/website/ui/card-chrome';

import { BRAND_META, BRANDS, CHAPTERS, type Brand, type Chapter } from './content';
import styles from './universe.module.css';

/* ---------- the switch ----------
   Always on screen while the chapters are, so a visitor is never locked into
   the world they picked first. Switching crossfades the chapter in place. */
export function BrandSwitch({ brand, onChange }: { brand: Brand; onChange: (brand: Brand) => void }) {
  return (
    <div
      role="group"
      aria-label="Choose a world"
      className="inline-flex rounded-full bg-surface/85 p-1 shadow-[0_12px_30px_-20px_rgba(20,29,63,0.5)] ring-1 ring-inset ring-border backdrop-blur"
    >
      {BRANDS.map((id) => {
        const meta = BRAND_META[id];
        const Icon = meta.icon;
        const isOn = id === brand;

        return (
          <button
            key={id}
            type="button"
            aria-pressed={isOn}
            onClick={() => onChange(id)}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-bold transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:px-4 ${
              isOn ? `${meta.fill} text-white shadow-md` : 'text-muted hover:text-primary'
            }`}
          >
            <Icon aria-hidden="true" size={15} strokeWidth={2.2} />
            {meta.name}
          </button>
        );
      })}
    </div>
  );
}

type ChapterPanelProps = {
  brand: Brand;
  index: number;
  chapter: Chapter;
  isCurrent: boolean;
  /** The card lit in step with the 3D world, if any. */
  litCard: number | null;
};

function ChapterPanel({ brand, index, chapter, isCurrent, litCard }: ChapterPanelProps) {
  const headingId = `universe-${brand}-${index}`;
  const fill = BRAND_META[brand].fill;

  return (
    <section
      aria-labelledby={headingId}
      data-brand={brand}
      data-index={index}
      data-current={isCurrent ? '' : undefined}
      className={styles.panel}
    >
      <p className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-hover ring-1 ring-inset ring-primary/20">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-primary" />
        {chapter.eyebrow}
      </p>

      <h3
        id={headingId}
        className="mt-4 max-w-2xl text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-accent md:text-4xl xl:text-[2.6rem]"
      >
        {chapter.title}
      </h3>

      {chapter.text ? (
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted md:text-base">{chapter.text}</p>
      ) : null}

      <ul className={`mt-6 grid gap-3 ${chapter.cards.length > 3 ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-3'}`}>
        {chapter.cards.map((card, cardIndex) => {
          const Icon = card.icon;

          return (
            <li
              key={card.title}
              className={styles.card}
              data-lit={litCard === cardIndex ? '' : undefined}
              style={{ '--i': cardIndex } as CSSProperties}
            >
              <div onPointerMove={handleSpotlight} className={`${CARD_CHROME} p-4`}>
                <CardDecor />
                <span className={`grid size-10 place-items-center rounded-xl ${card.tint}`}>
                  <Icon aria-hidden="true" size={19} strokeWidth={1.9} />
                </span>
                <p className="mt-3 text-[15px] font-bold leading-snug tracking-[-0.01em] text-accent">{card.title}</p>
                {card.meta ? <p className="mt-1 text-xs leading-snug text-muted">{card.meta}</p> : null}
              </div>
            </li>
          );
        })}
      </ul>

      {chapter.cta ? (
        <Link
          href={chapter.cta.href}
          className={`mt-6 inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white shadow-md transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${fill}`}
        >
          {chapter.cta.label}
        </Link>
      ) : null}
    </section>
  );
}

type BrandChaptersProps = {
  brand: Brand;
  /** The chapter on screen in the pinned story. Ignored in the flow layout, which shows all three. */
  chapter: number;
  /** Chapter three rests three times; the card for the current rest lights (learn · build · grow). */
  litCard?: number | null;
  onBrandChange: (brand: Brand) => void;
};

/*
 * Both brands' chapters are always in the DOM; the stylesheet shows the chosen
 * brand's, and — in the pinned story — only its current chapter. Switching
 * brand therefore never rebuilds the scroll timeline.
 */
export function BrandChapters({ brand, chapter, litCard = null, onBrandChange }: BrandChaptersProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
        <span className="text-xs font-bold uppercase tracking-[0.16em] text-muted">Exploring</span>
        <BrandSwitch brand={brand} onChange={onBrandChange} />
      </div>

      <div className={styles.panels}>
        {BRANDS.map((id) =>
          CHAPTERS[id].map((item, index) => (
            <ChapterPanel
              key={`${id}-${item.label}`}
              brand={id}
              index={index}
              chapter={item}
              isCurrent={id === brand && index === chapter}
              litCard={id === brand && index === 2 ? litCard : null}
            />
          )),
        )}
      </div>
    </>
  );
}
