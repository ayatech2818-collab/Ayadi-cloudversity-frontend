import type { Tint } from './ink';

/*
 * What AyaTech's world says, and where its two ways out lead.
 *
 * The words here are the brand's, not the catalogue's. The seven domains are
 * the ground AyaTech works on — they are not a course list, and nothing in
 * the journey is tied to one. What is being taught this term comes in
 * separately (programmes.ts) and can change without this file knowing.
 */

export const AYATECH_LOGO = '/images/Ayatech.png';
export const AYADI_LOGO = '/images/ayadi-logo-white.png';

/** Both are routes that exist today. */
export const PATHS = { courses: '/courses', build: '/contact' } as const;

/* ---------- the ground it works on ---------- */

export type DomainId = 'ai' | 'code' | 'data' | 'cloud' | 'automation' | 'systems' | 'emerging';

export const DOMAINS: readonly { id: DomainId; label: string; name: string; tint: Tint }[] = [
  { id: 'ai', label: 'AI', name: 'AI', tint: 'emerald' },
  { id: 'code', label: 'Code', name: 'Code', tint: 'cyan' },
  { id: 'data', label: 'Data', name: 'Data', tint: 'mint' },
  { id: 'cloud', label: 'Cloud', name: 'Cloud', tint: 'blue' },
  { id: 'automation', label: 'Automation', name: 'Automation', tint: 'cyan' },
  { id: 'systems', label: 'Systems', name: 'Systems', tint: 'blue' },
  /* Drawn unfinished, and left out of the system on purpose: there is always
     a next one. */
  { id: 'emerging', label: 'Emerging Tech', name: 'Emerging Technology', tint: 'white' },
];

/* ---------- the story ---------- */

export const CHAPTERS = [
  { id: 'idea', label: 'Idea' },
  { id: 'explore', label: 'Explore' },
  { id: 'learn', label: 'Learn' },
  { id: 'experiment', label: 'Experiment' },
  { id: 'build', label: 'Build' },
  { id: 'deliver', label: 'Deliver' },
] as const;

export const IDEA = {
  kicker: '01 / Idea',
  lines: ['Every technology', 'starts with an idea.'],
} as const;

export const COPY = {
  explore: {
    kicker: '02 / Explore',
    title: 'Technology never stops evolving.',
    line: 'Neither do we.',
  },
  learn: {
    kicker: '03 / Learn',
    title: 'Learn',
    line: 'Learn the technologies that power modern software.',
  },
  experiment: {
    kicker: '04 / Experiment',
    title: 'Experiment',
    line: 'Try it. Break it. Try again.',
  },
  build: {
    kicker: '05 / Build',
    title: 'Learning becomes capability.',
    line: 'We build technology.',
  },
  deliver: {
    kicker: '06 / Deliver',
    title: 'Built for Ayadi Cloudversity.',
    line: 'We build technology for our own ecosystem.',
  },
  beyond: {
    kicker: '06 / Deliver',
    title: 'Built for Ayadi. Ready for the world.',
    line: 'The same engineering, ready for organisations beyond our own.',
  },
} as const;

/* ---------- the system ---------- */

/* Top to bottom. Each layer is what one of the domains becomes once it is
   put to work (layout.ts keeps the pairing). */
export const LAYERS = ['Interface', 'API · Services', 'Intelligence', 'Data', 'Cloud'] as const;

export const SYSTEM_WORDS = { user: 'User', pipeline: 'Pipeline', next: 'Next' } as const;

/* What that system is, once it is Ayadi's. Kinds of thing, not product names. */
export const PLATFORM = ['Web app', 'Admin console', 'API', 'Database', 'Cloud'] as const;

/* The plots round Ayadi's. Kinds of work AyaTech can take on — never company
   names: there are no external clients to name yet, and the drawing says so
   by leaving every one of them an unbuilt outline. */
export const PLOTS = ['SaaS product', 'Internal platform', 'AI automation', 'Web & mobile app', 'Cloud infrastructure'] as const;

/* ---------- the identity ---------- */

export const PILLARS = [
  { id: 'learn', word: 'Learn', line: 'Technology education and courses.' },
  { id: 'build', word: 'Build', line: 'Software, AI and digital products.' },
  { id: 'deliver', word: 'Deliver', line: 'Technology solutions for organisations.' },
] as const;

export const IDENTITY = {
  fields: 'Technology · Software · AI',
  motto: 'Learn. Build. Deliver.',
  creed: 'AyaTech is where technology is learned, engineered, and delivered.',
  learn: 'Explore Courses',
  build: 'Build With Us',
} as const;

/* Scraps of thought round the signal, before any of it is a system. */
export const FRAGMENTS = [
  'const idea = signal()',
  'while (curious) learn()',
  '{ "state": "init" }',
  'git commit -m "first"',
  'model.fit(x, y)',
  'SELECT * FROM ideas',
  'deploy --target next',
  '0x1F A9 3C 7E',
  'fn build(idea) -> system',
] as const;
