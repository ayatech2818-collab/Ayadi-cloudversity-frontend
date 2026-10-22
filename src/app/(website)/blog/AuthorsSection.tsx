'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';

import {
  CARD_CHROME,
  CardDecor,
  handleSpotlight,
} from '@/components/website/ui/card-chrome';
import type { Author } from '@/lib/api/authors';

import AuthorAvatar from './AuthorAvatar';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

export default function AuthorsSection({ authors }: { authors: Author[] }) {
  const reduceMotion = useReducedMotion();
  const start = reduceMotion ? 'visible' : 'hidden';

  if (authors.length === 0) return null;

  return (
    <section
      aria-labelledby="authors-heading"
      className="relative isolate overflow-hidden bg-surface px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:px-16 lg:pb-24 lg:pt-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-0 -z-10 size-[420px] rounded-full bg-primary/[0.06] blur-[120px]"
      />

      <div className="mx-auto max-w-[1180px]">
        <motion.div
          initial={start}
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
            <span aria-hidden="true" className="h-px w-6 bg-primary/50" />
            The people behind the ideas
          </span>

          <h2
            id="authors-heading"
            className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-accent sm:text-4xl"
          >
            Meet Our Authors
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            Meet the educators and industry voices sharing practical ideas for
            learning, careers, and growth.
          </p>
        </motion.div>

        <motion.ul
          variants={stagger}
          initial={start}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="mt-9 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
        >
          {authors.map((author) => (
            <motion.li key={author.id} variants={fadeUp} className="min-w-0">
              <article
                onPointerMove={handleSpotlight}
                className={`${CARD_CHROME} flex items-start gap-4 p-5 sm:p-6`}
              >
                <CardDecor />

                <AuthorAvatar
                  src={author.profile_image}
                  name={author.name}
                  sizes="72px"
                  className="size-16 sm:size-[72px]"
                />

                <div className="min-w-0">
                  <h3 className="text-base font-bold tracking-[-0.02em] text-accent sm:text-lg">
                    {author.name}
                  </h3>

                  {author.designation ? (
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-primary">
                      {author.designation}
                    </p>
                  ) : null}

                  {author.bio ? (
                    <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted">
                      {author.bio}
                    </p>
                  ) : null}
                </div>
              </article>
            </motion.li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
