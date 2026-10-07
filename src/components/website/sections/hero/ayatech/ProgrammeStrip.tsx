'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import styles from '../ayatech.module.css';
import { PATHS } from './content';
import { useAyatechProgrammes } from './programmes';

/** Past this many the strip stops listing and points at the courses page. */
const MOST = 12;

/*
 * What AyaTech is teaching right now, as a strip in the Learn beat.
 *
 * This is the catalogue's one appearance in the world, and it is content,
 * not choreography: the journey is not timed to it and does not count it.
 * None, and the strip is simply not there. A few, and they sit in a row.
 * More than fit, and the row drifts. It says "now" and "more on the way" on
 * purpose — the list is this term's, not the whole of what AyaTech teaches.
 */
export function ProgrammeStrip() {
  const programmes = useAyatechProgrammes();
  const windowRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLUListElement>(null);
  const [drifts, setDrifts] = useState(false);

  /* Only drift when the row is wider than its window. */
  useEffect(() => {
    const frame = windowRef.current;
    const row = rowRef.current;
    if (!frame || !row) return;

    const watch = new ResizeObserver(() => setDrifts(row.scrollWidth > frame.clientWidth + 1));
    watch.observe(frame);
    watch.observe(row);
    return () => watch.disconnect();
  }, [programmes.length]);

  if (programmes.length === 0) return null;

  const shown = programmes.slice(0, MOST);
  const more = programmes.length - shown.length;
  const row = shown.map(({ id, title }) => (
    <li key={id} title={title} className={styles.chip}>
      {title}
    </li>
  ));

  return (
    <div className={styles.strip}>
      <p className={styles.stripLabel}>
        <span aria-hidden="true" className={styles.stripDot} />
        Now teaching
      </p>

      <div ref={windowRef} data-drifts={drifts || undefined} className={styles.stripWindow}>
        <div className={styles.stripTrack} style={drifts ? { animationDuration: `${Math.max(18, shown.length * 6)}s` } : undefined}>
          <ul ref={rowRef} className={styles.stripRow}>
            {row}
          </ul>
          {/* The same row again, so the drift has no seam. */}
          {drifts && (
            <ul aria-hidden="true" className={styles.stripRow}>
              {row}
            </ul>
          )}
        </div>
      </div>

      <p className={styles.stripFoot}>
        <span>{more > 0 ? `+${more} more, and more on the way` : 'More on the way'}</span>
        <Link href={PATHS.courses} className={styles.stripLink}>
          View all programmes
          <ArrowRight aria-hidden="true" size={13} />
        </Link>
      </p>
    </div>
  );
}
