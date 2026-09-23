import { Cpu } from 'lucide-react';

import { brandById } from '@/components/website/courses/brands';

import styles from './hero.module.css';

const brand = brandById.ayatech;

/*
 * AyaTech's world, until it has one.
 *
 * A quiet holding card in the same place the Cloudversity journey plays, so
 * switching worlds always lands somewhere. None of this is the design of
 * that world: when the AyaTech journey is built it replaces this file, and
 * nothing else in the hero has to change.
 */
export function AyatechWorld() {
  return (
    <section aria-label={brand.name} className={styles.soon}>
      <div className={styles.soonCard}>
        <span aria-hidden="true" className={styles.soonIcon}>
          <Cpu size={22} strokeWidth={1.9} />
        </span>

        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
          Technology · Development
        </p>

        <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-accent sm:text-4xl">{brand.name}</h2>

        <p className="mt-3 text-sm font-semibold text-primary sm:text-base">{brand.tagline}</p>

        <p className="mt-4 text-sm leading-7 text-muted">{brand.lede}</p>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-muted">This world is still being built</p>
      </div>
    </section>
  );
}
