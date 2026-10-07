import { ChevronsDown } from 'lucide-react';

import styles from '../ayatech.module.css';
import { CHAPTERS } from './content';

/*
 * Where you are in the story, and the two ways to move through it without
 * scrolling: any chapter by name, or straight to the end.
 *
 * AyatechWorld marks the chapter being played by writing `aria-current`
 * straight onto its button as the timeline crosses into it — nothing here
 * re-renders for the scroll.
 */
export function AyatechHud({ onJump, onSkip }: { onJump: (chapter: number) => void; onSkip: () => void }) {
  return (
    <div data-intro="hud" className={styles.hud}>
      <div data-hud="rail" className={styles.rail}>
        <span aria-hidden="true" className={styles.railTrack}>
          <span data-hud="fill" className={styles.railFill} />
        </span>

        <ol className={styles.chapters}>
          {CHAPTERS.map(({ id, label }, index) => (
            <li key={id}>
              <button type="button" data-hud="chapter" onClick={() => onJump(index)} className={styles.chapter}>
                <span aria-hidden="true" className={styles.chapterIndex}>
                  {String(index + 1).padStart(2, '0')}
                  <span className={styles.chapterOf}> / {String(CHAPTERS.length).padStart(2, '0')}</span>
                </span>
                {label}
              </button>
            </li>
          ))}
        </ol>

        <button type="button" onClick={onSkip} className={styles.skip}>
          Skip
          <ChevronsDown aria-hidden="true" size={13} />
        </button>
      </div>
    </div>
  );
}
