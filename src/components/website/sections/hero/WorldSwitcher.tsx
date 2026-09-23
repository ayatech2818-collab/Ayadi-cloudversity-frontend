'use client';

import { Cpu, GraduationCap, type LucideIcon } from 'lucide-react';
import type { PointerEvent, RefObject } from 'react';

import type { WorldId } from './ChooseWorld';
import styles from './hero.module.css';

const WORLDS: { id: WorldId; label: string; icon: LucideIcon }[] = [
  { id: 'cloudversity', label: 'Cloudversity', icon: GraduationCap },
  { id: 'ayatech', label: 'AyaTech', icon: Cpu },
];

/*
 * Which world you are in, and the way to the other one.
 *
 * A small piece of glass rather than a control panel: a lit edge, a pane
 * that slides under the world you are in, and light that pools under the
 * cursor as though it were passing through water. Everything it does is
 * inside its own box — nothing here can move the page.
 *
 * AyadiHero shows it by writing `data-on` straight onto the element while a
 * world holds the screen, so nothing re-renders for it. Hidden is
 * `visibility: hidden`, which takes it out of the tab order too.
 */
export function WorldSwitcher({
  active,
  onSelect,
  elementRef,
}: {
  active: WorldId;
  onSelect: (world: WorldId) => void;
  elementRef: RefObject<HTMLDivElement | null>;
}) {
  /* The cursor's place in the glass, as two CSS variables. Mouse only: a
     finger has no hover to leave, and would leave the light stranded. */
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--x', `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty('--y', `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={elementRef}
      role="group"
      aria-label="Active world"
      data-world={active}
      onPointerMove={onPointerMove}
      className={styles.switcher}
    >
      {/* Under the world you are in, and slides to the other one. */}
      <span aria-hidden="true" className={styles.switcherPane} />
      {/* What the cursor does to the glass: refraction, then the light. */}
      <span aria-hidden="true" className={styles.switcherLens} />
      <span aria-hidden="true" className={styles.switcherGlow} />

      {WORLDS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={active === id}
          onClick={() => onSelect(id)}
          className={styles.switch}
        >
          <Icon aria-hidden="true" size={13} strokeWidth={2} />
          {label}
        </button>
      ))}
    </div>
  );
}
