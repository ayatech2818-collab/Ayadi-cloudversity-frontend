import gsap from 'gsap';

import { AT } from './score';

/*
 * The words over the scene, on the scene's clock.
 *
 * The canvas draws what the story has reached; these bring in what it says
 * about it — each beat's lines as it arrives, gone before the next one's —
 * on the same scrubbed timeline, so word and picture cannot drift apart.
 * Every tween states where it starts and where it ends: the timeline is
 * scrubbed both ways, and a line must be exactly as hidden on the way back
 * up as it was on the way down.
 */
type Query = (selector: string) => Element[];

/** Everything the story brings in, hidden — set before the timeline is built
    so nothing shows for a frame first. */
export function restCopy(q: Query) {
  gsap.set(q('[data-el="idea-kicker"]'), { autoAlpha: 0, y: 12 });
  gsap.set(q('[data-word]'), { yPercent: 118 });
  gsap.set(q('[data-beat] > *'), { autoAlpha: 0, y: 24 });
  gsap.set(q('[data-el="ayadi"]'), { autoAlpha: 0, y: 40, scale: 0.92 });
  gsap.set(q('[data-el="mark-light"]'), { autoAlpha: 0, scale: 0.86 });
  gsap.set(q('[data-el="mark-plate"]'), { autoAlpha: 0, scale: 0.8 });
  gsap.set(q('[data-el="mark-true"]'), { autoAlpha: 0 });
  gsap.set(q('[data-el="pillar"]'), { autoAlpha: 0, y: 14 });
  gsap.set(q('[data-el="say"]'), { autoAlpha: 0, y: 16 });
  gsap.set(q('[data-hud="fill"]'), { scaleX: 0, transformOrigin: '0% 50%' });
}

export function cueCopy(timeline: gsap.core.Timeline, q: Query) {
  const rise = (targets: Element[], at: number, vars: gsap.TweenVars = {}) =>
    timeline.fromTo(targets, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.36, ease: 'power2.out', ...vars }, at);
  const leave = (targets: Element[], at: number) =>
    timeline.fromTo(targets, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -20, duration: 0.24, ease: 'power1.in' }, at);

  /* A beat's lines come in one after another and leave together. A line
     marked `data-late` waits for its own cue. */
  const beat = (name: string, inAt: number, outAt: number) => {
    rise(q(`[data-beat="${name}"] > :not([data-late])`), inAt, { stagger: 0.06 });
    leave(q(`[data-beat="${name}"]`), outAt);
  };

  /* ---------- IDEA ----------
     The point is alone when the world is entered. The first scroll is what
     brings the sentence. */
  timeline.fromTo(q('[data-hud="hint"]'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, 0.1);
  timeline.fromTo(
    q('[data-el="idea-kicker"]'),
    { autoAlpha: 0, y: 12 },
    { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' },
    0.15,
  );
  timeline.fromTo(q('[data-word]'), { yPercent: 118 }, { yPercent: 0, duration: 0.5, ease: 'power3.out', stagger: 0.04 }, 0.2);
  timeline.fromTo(
    q('[data-idea]'),
    { autoAlpha: 1, y: 0, scale: 1 },
    { autoAlpha: 0, y: -26, scale: 1.05, duration: 0.3, ease: 'power1.in' },
    AT.explore - 0.3,
  );

  /* ---------- EXPLORE → EXPERIMENT ---------- */
  beat('explore', AT.explore + 0.45, AT.learn - 0.2);
  /* "Neither do we." — once the camera is in among them. */
  rise(q('[data-beat="explore"] > [data-late]'), AT.explore + 0.95);
  beat('learn', AT.learn + 0.1, AT.experiment - 0.22);
  beat('experiment', AT.experiment + 0.12, AT.build - 0.22);

  /* ---------- BUILD ---------- */
  beat('build', AT.build + 0.2, AT.deliver - 0.22);
  /* "We build technology." — said once the thing is running. */
  rise(q('[data-beat="build"] > [data-late]'), AT.build + 1.1);

  /* ---------- DELIVER ----------
     Ayadi's mark rises over the system as it closes up, and goes back down
     into it as the camera pulls away. */
  beat('deliver', AT.deliver + 0.1, AT.beyond - 0.12);
  timeline.fromTo(
    q('[data-el="ayadi"]'),
    { autoAlpha: 0, y: 40, scale: 0.92 },
    { autoAlpha: 1, y: 0, scale: 1, duration: 0.42, ease: 'power2.out' },
    AT.deliver + 0.2,
  );
  timeline.fromTo(
    q('[data-el="ayadi"]'),
    { autoAlpha: 1, y: 0, scale: 1 },
    { autoAlpha: 0, y: 70, scale: 0.4, duration: 0.3, ease: 'power2.in' },
    AT.beyond - 0.02,
  );
  beat('beyond', AT.beyond + 0.18, AT.ayatech - 0.15);

  /* ---------- AYATECH ----------
     The name in light, inside the three arcs, with what each arc is. Then
     the arcs go, and the name takes its own colours on a lit plate — the
     official logo, as drawn. */
  timeline.fromTo(
    q('[data-el="mark-light"]'),
    { autoAlpha: 0, scale: 0.86 },
    { autoAlpha: 1, scale: 1, duration: 0.42, ease: 'power2.out' },
    AT.ayatech + 0.15,
  );
  timeline.fromTo(
    q('[data-el="pillar"]'),
    { autoAlpha: 0, y: 14 },
    { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out', stagger: 0.05 },
    AT.ayatech + 0.2,
  );
  timeline.fromTo(
    q('[data-el="pillar"]'),
    { autoAlpha: 1, y: 0 },
    { autoAlpha: 0, y: -10, duration: 0.18, ease: 'power1.in', stagger: 0.03 },
    AT.reveal - 0.02,
  );
  timeline.fromTo(
    q('[data-el="mark-plate"]'),
    { autoAlpha: 0, scale: 0.8 },
    { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
    AT.reveal + 0.04,
  );
  timeline.fromTo(q('[data-el="mark-true"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24, ease: 'power1.out' }, AT.reveal + 0.1);
  timeline.fromTo(q('[data-el="mark-light"]'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.24, ease: 'power1.in' }, AT.reveal + 0.12);
  timeline.fromTo(
    q('[data-el="say"]'),
    { autoAlpha: 0, y: 16 },
    { autoAlpha: 1, y: 0, duration: 0.2, ease: 'power2.out', stagger: 0.05 },
    AT.reveal + 0.16,
  );

  /* ---------- the rail ----------
     It measures the six chapters, and steps aside for the name. */
  timeline.fromTo(q('[data-hud="fill"]'), { scaleX: 0 }, { scaleX: 1, duration: AT.ayatech, ease: 'none' }, 0);
  timeline.fromTo(q('[data-hud="rail"]'), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, ease: 'power1.in' }, AT.ayatech);
}
