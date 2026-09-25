import gsap from 'gsap';

/*
 * AyaTech's intro — the moment the world is entered.
 *
 * The official logo is assembled by the world's own digital environment: the
 * light space wakes, circuit traces draw in from the edges and run their
 * light to the centre, the logo forms out of that light, the technology
 * ecosystem it stands for signals round it and connects to it, and
 * everything settles into exactly the rest state Scene 1 is authored in
 * (AyatechWorld) — which is where the scroll journey starts.
 *
 * It runs on its own clock, never the scroll's, and never holds up the world
 * switcher. It only ever animates *from* a hidden state *to* what is already
 * there, so wherever it is cut short, and whichever layout it runs in, it
 * lands on that rest state. Scrolling hurries it, and scrolling on finishes
 * it at once, well before the journey's first move; leaving the world stops
 * it (stopAyatechIntro).
 */

export const AYATECH_LOGO = '/images/Ayatech.png';

/* ---------- the field ----------
   The environment round the logo, in a 1200 × 700 box laid out at twice the
   logo's width and centred on it: in these units the logo's box is x 300–900,
   y 215–485, and its lettering y 317–390, with the gear's own circuit
   terminals above and below it round x 710–740 — kept clear. */

export const FIELD = { width: 1200, height: 700 } as const;

export type SignalId = 'innovation' | 'cyber' | 'ai' | 'software' | 'digital';

/* Where each capability signals from, and which side of its point it is named. */
export const SIGNALS: Record<SignalId, { at: readonly [number, number]; label: 'above' | 'below' }> = {
  innovation: { at: [600, 58], label: 'above' },
  cyber: { at: [118, 250], label: 'below' },
  ai: { at: [1082, 250], label: 'below' },
  software: { at: [170, 560], label: 'below' },
  digital: { at: [1030, 560], label: 'below' },
};

/* Circuit traces, each drawn from its outer end to the logo — the way its
   light travels. The first five bring a capability's signal in; the last two
   are the environment's own wiring. */
export const TRACES: readonly { signal?: SignalId; d: string; end: readonly [number, number] }[] = [
  { signal: 'innovation', d: 'M600 70V268', end: [600, 268] },
  { signal: 'cyber', d: 'M130 250H252L328 326H366', end: [366, 326] },
  { signal: 'ai', d: 'M1070 250H948L872 326H834', end: [834, 326] },
  { signal: 'software', d: 'M170 548V470L258 382H366', end: [366, 382] },
  { signal: 'digital', d: 'M1030 548V470L942 382H834', end: [834, 382] },
  { d: 'M60 112H150L190 152', end: [190, 152] },
  { d: 'M1140 112H1050L1010 152', end: [1010, 152] },
];

/* Points of light, in the field's empty places. */
export const POINTS: readonly (readonly [number, number])[] = [
  [60, 40],
  [330, 28],
  [872, 44],
  [1150, 62],
  [28, 340],
  [1172, 352],
  [300, 478],
  [902, 470],
  [86, 676],
  [1112, 670],
];

/* ---------- the choreography ---------- */

/* The beats, in seconds from the moment the world is entered. */
const BEAT = {
  wake: 0, // the light space wakes
  wire: 0.3, // circuits draw in and run their light to the centre
  logo: 1, // the identity forms out of that light
  sheen: 1.8, // one light passes across it
  signals: 2.05, // the ecosystem signals round it
  connect: 2.5, // …and connects to it
  copy: 2.65, // what it is
  ready: 3.35, // the way on
};

/* How far the reader may scroll before the intro gives way at once rather
   than just hurrying — far short of the journey's first move (0.8 of its
   13.95 units, over 520% of the viewport). */
const GIVE_WAY = 120;

const running = new WeakMap<Element, { finish: () => void; stop: () => void }>();

/** Leaving the world: stop its intro where it is, and let go of the page. */
export function stopAyatechIntro(section: Element | null) {
  if (section) running.get(section)?.stop();
}

/** Plays the intro over the AyaTech world inside `root`. */
export function playAyatechIntro(root: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;

  const act = root.querySelector<HTMLElement>('[data-act="intro"]');
  const section = act?.closest('section');
  if (!act || !section) return null;
  /* Never two at once: one already under way lands on its rest state first,
     so this one starts from that. */
  running.get(section)?.finish();

  const intro = (name: string) => gsap.utils.toArray<Element>(section.querySelectorAll(`[data-intro="${name}"]`));
  const element = (name: string) => gsap.utils.toArray<Element>(section.querySelectorAll(`[data-element="${name}"]`));

  const logo = intro('logo');
  const image = logo.flatMap((heading) => Array.from(heading.querySelectorAll('img')));
  const bloom = intro('bloom');
  const bloomRest = bloom.length ? Number(gsap.getProperty(bloom[0], 'opacity')) : 0;
  const sparks = gsap.utils.toArray<Element>(section.querySelectorAll('[data-intro="terminal"][data-signal]'));
  /* The ecosystem round the logo is only laid out on wider screens. */
  const wide = window.matchMedia('(min-width: 768px)').matches;
  const copyAt = wide ? BEAT.copy : BEAT.copy - 0.7;
  const readyAt = wide ? BEAT.ready : BEAT.ready - 0.8;

  const tl = gsap.timeline();
  const from = (targets: Element[], vars: gsap.TweenVars, at: number) => {
    if (targets.length) tl.from(targets, vars, at);
  };
  const fromTo = (targets: Element[], start: gsap.TweenVars, end: gsap.TweenVars, at: number) => {
    if (targets.length) tl.fromTo(targets, start, end, at);
  };
  const to = (targets: Element[], vars: gsap.TweenVars, at: number) => {
    if (targets.length) tl.to(targets, vars, at);
  };

  /* While it plays, the logo can be masked and the sheen shown. */
  act.dataset.playing = '';

  /* 1. The light space wakes: the environment drifts in to rest, its lights
        bloom, and a soft light gathers at the centre. */
  from(intro('atmosphere'), { scale: 1.05, duration: 3.2, ease: 'power2.out', clearProps: 'transform' }, BEAT.wake);
  from(intro('grid'), { opacity: 0, duration: 1.8, ease: 'sine.out', clearProps: 'opacity' }, BEAT.wake + 0.15);
  from(intro('particles'), { opacity: 0, duration: 2, ease: 'sine.out', clearProps: 'opacity' }, BEAT.wake + 0.35);
  from(
    intro('halo'),
    { autoAlpha: 0, scale: 0.55, duration: 1.6, ease: 'power2.out', clearProps: 'opacity,visibility,transform' },
    BEAT.wake + 0.05,
  );
  from(element('spotlight-primary'), { autoAlpha: 0, scale: 0.3, duration: 1.8, ease: 'power2.out' }, BEAT.wake + 0.1);
  from(element('spotlight-secondary'), { autoAlpha: 0, scale: 0.3, duration: 2, ease: 'power2.out' }, BEAT.wake + 0.3);
  from(element('spotlight-accent'), { autoAlpha: 0, scale: 0.3, duration: 1.8, ease: 'power2.out' }, BEAT.wake + 0.5);
  /* The digital core comes up behind the light, to where the journey wakes
     it from. */
  from(element('core'), { autoAlpha: 0, scale: 0.6, rotation: -40, duration: 1.6, ease: 'power3.out' }, BEAT.wake + 0.55);

  /* 2. The system initialises: points of light, circuit traces drawing in
        from the edges, their light running ahead of them to the centre, and
        a spark at the logo's edge as each arrives. */
  from(
    intro('point'),
    { autoAlpha: 0, duration: 0.6, ease: 'sine.out', stagger: { each: 0.05, from: 'random' } },
    BEAT.wire - 0.05,
  );
  from(intro('trace'), { strokeDashoffset: 1, duration: 0.95, ease: 'power2.inOut', stagger: 0.07 }, BEAT.wire);
  fromTo(
    intro('pulse'),
    { strokeDashoffset: 0.1 },
    { strokeDashoffset: -1.08, duration: 0.8, ease: 'power1.in', stagger: 0.07 },
    BEAT.wire + 0.12,
  );
  from(
    intro('terminal'),
    { autoAlpha: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.45, ease: 'back.out(2)', stagger: 0.07 },
    BEAT.wire + 0.82,
  );

  /* 3. The identity forms out of that light: from its centre outward, out
        of focus into focus, rising a touch into place, with green light
        building behind it. Then one light passes across it, and it is still. */
  from(logo, { autoAlpha: 0, duration: 0.7, ease: 'power1.out', clearProps: 'opacity,visibility' }, BEAT.logo);
  from(logo, { scale: 0.92, y: 14, duration: 1.6, ease: 'expo.out', clearProps: 'transform' }, BEAT.logo);
  fromTo(image, { '--reveal': '-26%' }, { '--reveal': '100%', duration: 1.2, ease: 'power2.out' }, BEAT.logo);
  fromTo(
    image,
    { filter: 'blur(12px)' },
    { filter: 'blur(0px)', duration: 1.1, ease: 'power2.out', clearProps: 'filter' },
    BEAT.logo,
  );
  fromTo(bloom, { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, BEAT.logo - 0.1);
  to(bloom, { autoAlpha: bloomRest, duration: 1.1, ease: 'sine.inOut' }, BEAT.logo + 0.9);
  fromTo(
    intro('sheen'),
    { backgroundPosition: '100% 0%' },
    { backgroundPosition: '0% 0%', duration: 1, ease: 'power2.inOut' },
    BEAT.sheen,
  );

  /* 4. The ecosystem it stands for signals round it and sends its light in:
        each signal flares as it goes, each arrival sparks at the logo's
        edge, the centre brightens once — and it all settles. */
  if (wide) {
    from(
      intro('signal'),
      { autoAlpha: 0, y: 8, duration: 0.7, ease: 'power2.out', stagger: 0.09, clearProps: 'opacity,visibility,transform' },
      BEAT.signals,
    );
    to(intro('signal-dot'), { scale: 1.7, duration: 0.2, ease: 'power2.out', stagger: 0.05 }, BEAT.connect);
    to(
      intro('signal-dot'),
      { scale: 1, duration: 0.6, ease: 'power2.inOut', stagger: 0.05, clearProps: 'transform' },
      BEAT.connect + 0.2,
    );
    fromTo(
      intro('pulse'),
      { strokeDashoffset: 0.1 },
      { strokeDashoffset: -1.08, duration: 0.65, ease: 'power1.in', stagger: 0.05 },
      BEAT.connect,
    );
    to(sparks, { scale: 2, duration: 0.18, ease: 'power2.out', stagger: 0.05 }, BEAT.connect + 0.58);
    to(sparks, { scale: 1, duration: 0.6, ease: 'power2.inOut', stagger: 0.05 }, BEAT.connect + 0.76);
    to(bloom, { autoAlpha: 0.9, scale: 1.05, duration: 0.35, ease: 'power2.out' }, BEAT.connect + 0.62);
    to(bloom, { autoAlpha: bloomRest, scale: 1, duration: 1, ease: 'sine.inOut' }, BEAT.connect + 0.97);
  }

  /* 5. What it is, beneath it — and the way on. */
  const settle = { duration: 0.7, ease: 'power2.out', clearProps: 'opacity,visibility,transform' };
  from(intro('badge'), { ...settle, autoAlpha: 0, y: 8, duration: 0.6 }, copyAt);
  from(intro('motto'), { ...settle, autoAlpha: 0, y: 10 }, copyAt + 0.1);
  from(intro('tagline'), { ...settle, autoAlpha: 0, y: 10 }, copyAt + 0.2);
  from(intro('hint'), { ...settle, autoAlpha: 0, y: 8, duration: 0.6 }, readyAt);

  /* ---------- giving way to the reader ---------- */
  const startY = window.scrollY;
  const hurry = () => {
    if (tl.timeScale() === 1) gsap.to(tl, { timeScale: 5, duration: 0.3, ease: 'power1.in' });
  };
  const onScroll = () => {
    const moved = Math.abs(window.scrollY - startY);
    if (moved > GIVE_WAY) tl.progress(1);
    else if (moved > 4) hurry();
  };

  const release = () => {
    window.removeEventListener('wheel', hurry);
    window.removeEventListener('touchmove', hurry);
    window.removeEventListener('scroll', onScroll);
    gsap.killTweensOf(tl);
    delete act.dataset.playing;
    for (const img of image) (img as HTMLElement).style.removeProperty('--reveal');
    running.delete(section);
  };

  window.addEventListener('wheel', hurry, { passive: true });
  window.addEventListener('touchmove', hurry, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });
  tl.eventCallback('onComplete', release);
  running.set(section, {
    finish: () => tl.progress(1),
    stop: () => {
      tl.kill();
      release();
    },
  });

  return tl;
}
