# Ayadi Cloudversity — Design Reference

A briefing for anyone (human or agent) about to change the look of this site.
It records the design system as it exists in the code today, the reasoning
behind it, and the open questions. When this file and the code disagree, the
code wins — update this file.

Last updated: 2026-09-21.

---

## 1. Read this first

- **Stack.** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript ·
  Tailwind CSS v4 · framer-motion · GSAP (+ ScrollTrigger) · lucide-react.
  No Three.js / WebGL anywhere — all 3D is CSS 3D transforms.
- **Next 16 has breaking changes.** Read `node_modules/next/dist/docs/` before
  using an API (see `AGENTS.md`). Example: `next/image` deprecated `priority`
  in favour of `preload`, and `images.qualities` defaults to `[75]`.
- **Design tokens live in `src/app/globals.css`.** Use them instead of new
  hex values.
- **Verification.** Run `npx tsc --noEmit`, `npx eslint <files>` and
  `npm run build` after changes. The owner checks the UI in their own browser;
  do not drive a browser or take screenshots unless asked.
- **Scope.** This covers the public website (`src/app/(website)`,
  `src/components/website`). The admin area (`src/app/admin`) is separate,
  early-stage work styled with plain Tailwind grays and is not covered here.

---

## 2. Brand architecture

| Brand | Role | Current colour identity in code |
|---|---|---|
| **Ayadi Cloudversity** | Parent platform — the site itself | Green → teal, with navy as the accent colour |
| **AyaTech** | Sub-brand: technology, software, AI | **Inconsistent — see §13.** Navy on `/courses` and the Home "Learning Pathways" panels; green + white in the Home 3D hero |
| **Netscape** | Sub-brand: training for teachers | Teal (→ navy) |

`globals.css` states the intended scale: *green (Ayadi) → teal (Netscape) →
navy (AyaTech)*. The latest direction from the owner (for the Home hero) is
that **AyaTech's official colours are green and white, not blue**. The hero
follows that; the rest of the site has not been updated. Resolve it with the
owner before extending either treatment.

Spelling in code is **"AyaTech"** (`brands.ts`, hero labels). The owner's
briefs have also used "Ayatech" — confirm before changing copy.

Brand data for the three pathways: `src/components/website/courses/brands.ts`
(name, tagline, lede, stats, icon, Tailwind theme classes per brand).

---

## 3. Colour

### 3.1 Tokens (`src/app/globals.css`, exposed to Tailwind via `@theme inline`)

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| `--color-primary` | `#15803d` | `primary` | Main green: links, eyebrows, active states, small green text |
| `--color-primary-hover` | `#166534` | `primary-hover` | Hover/darker green |
| `--color-brand-start` | `#059669` | `brand-start` | Gradient start (emerald) |
| `--color-brand-middle` | `#16a34a` | `brand-middle` | Gradient middle (green) |
| `--color-brand-end` | `#0d9488` | `brand-end` | Gradient end (teal). **Only 3.7:1 on white — fills only, not small text** |
| `--color-brand-teal` | `#0f766e` | `brand-teal` | Darker teal for small text |
| `--color-accent-soft` | `#2a3a6e` | `accent-soft` | Navy, light end |
| `--color-accent` | `#1e2b57` | `accent` | Navy — **the colour of most headings** |
| `--color-accent-strong` | `#141d3f` | `accent-strong` | Deepest navy, shadows/overlays |
| `--color-page` | `#f8faf9` | `page` | Page background |
| `--color-surface` | `#ffffff` | `surface` | Cards, panels |
| `--color-text` | `#17221a` | `text` | Body text |
| `--color-muted` | `#5e6d62` | `muted` | Secondary text |
| `--color-border` | `#dbe5dd` | `border` | Hairlines, rings |

The navy block is commented as **"on trial"** and was sampled by eye from the
logo — the exact hex is unconfirmed with the client.

### 3.2 Gradients (Tailwind background-image utilities)

| Utility | Definition | Use |
|---|---|---|
| `bg-brand-gradient` | 135° `#059669 → #16a34a → #0d9488` | Gradient words in headings, icon tiles, Enroll button, progress bars |
| `bg-accent-gradient` | 135° `#141d3f → #1e2b57 → #2f4480` | Hero CTA, selected filter pills, AyaTech (courses) |
| `bg-hero-ambient` | radial, primary @16% → transparent | Soft green glow behind hero/sections |

Gradient text pattern: `bg-brand-gradient bg-clip-text text-transparent` on a
`<span>` inside the heading.

### 3.3 Colour hierarchy

Light, mostly white site. Green leads, teal supports, navy is the accent and
the heading ink. Direction used in recent work:
**green → teal → a subtle blue → white.** Blue should never dominate a
section.

### 3.4 Off-token colours already in use (know they exist; prefer tokens)

- Dark green panels: Tailwind `emerald-950 / emerald-900 / emerald-800 / teal-800`
  (WhyChooseAyadi, LearningPathways panel 01, GetStartedCta, HowItWorks stage).
- Lime accents on dark: `lime-200 / lime-300`, `#bef264`, `#b8f94a`, `#d8ff9a`.
- CEOMessage: `#f5f8f3` background, `#182653` navy text, `#62e62b` green, `#101a38`.
- FeaturedCourses: vertical gradient `#e7f8ef → … → #064c3b`, `#087f4f`, `#0b8f5b`, `#063f32`.
- Footer: `#052a22 → #04231c → #031813`.
- HowItWorks grade: `#021712 → #0d5a4e → #f3faf6` (scroll-driven).
- Media/Reel wash: `#f2f6fb`.

---

## 4. Typography

- **Font:** Manrope, loaded with `next/font/google` in `src/app/layout.tsx` as
  `--font-manrope` and applied to `body`.
  - `--font-sans` in `@theme` points at `--font-plus-jakarta`, **which is never
    loaded** — so `font-sans` has no effect. Treat Manrope as the only font.
- **Headings** use tight negative tracking and navy (`text-accent`):

| Role | Typical classes |
|---|---|
| Home hero `h1` | `text-4xl sm:text-5xl lg:text-[3.65rem] font-extrabold tracking-[-0.055em] text-accent` |
| Section `h2` | `text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-[-0.04em]` |
| Inner-page `h1` | `text-[2.5rem] sm:text-6xl lg:text-[4.2–4.6rem] font-semibold leading-[1.0] tracking-[-0.045em]` |
| CEO message `h2` | `lg:text-[72px] font-medium leading-[0.98]` (editorial) |
| Card `h3` | `text-lg/xl font-semibold–bold tracking-[-0.02em] text-accent` |

- **Eyebrows / labels:** `text-xs font-bold uppercase tracking-[0.14em–0.3em]`,
  usually `text-primary` or `text-muted`.
- **Body:** `text-base md:text-lg leading-relaxed text-muted`, `max-w-xl`.
- **Numbers / counters:** `tabular-nums`, zero-padded (`01 / 04`).

---

## 5. Layout

- Tailwind default breakpoints: `sm 640` · `md 768` · `lg 1024` · `xl 1280`.
- **Containers:**
  - Home sections: `mx-auto max-w-[1665px]`.
  - Inner pages (About, Blog, Media) and CTA: `max-w-[1180px]`.
  - Home hero grid: `max-w-[100rem]`, `lg:grid-cols-[1fr_0.95fr]`.
- **Section padding:** `px-4 md:px-8 lg:px-16`, `py-20 lg:py-28` (Home);
  `px-5 sm:px-8 lg:px-16`, `py-24 lg:py-32` (About).
- **Fixed navbar:** content below it needs clearance (hero uses `mt-20`;
  anchor targets use `scroll-mt-28`).
- **CTA ↔ footer overlap:** `GetStartedCta` uses big negative margins to float
  over the footer's top edge; `Footer` reserves matching `pt-40 / pt-44 / pt-56`.
  Change both together.

---

## 6. Surfaces, shape, depth

- **Radii:** cards `rounded-2xl` / `rounded-3xl`; large panels `rounded-[24px]`–`[32px]`;
  pills `rounded-full`; hero CTA `rounded-lg`.
- **Rings, not borders.** `globals.css` sets `* { border-color: var(--color-border) }`,
  which overrides border colours. Use `ring-1 ring-inset ring-border` (or
  `ring-primary/20`, `ring-white/15` on dark) for outlines.
- **Shadows:** soft, large, negative-spread and tinted, e.g.
  `shadow-[0_40px_100px_-40px_rgba(2,44,34,0.75)]` (dark green) or
  `shadow-[0_28px_60px_-28px_rgba(16,185,129,0.45)]` (hover glow).
- **Glass:** the navbar — `bg-white/75 backdrop-blur-xl ring-1 ring-white/70`,
  with a white top hairline and a faint green radial glow.
- **Decorative background devices** (reused across sections, always
  `aria-hidden` + `pointer-events-none`):
  - Dot grid: `bg-[radial-gradient(rgba(...)_1px,transparent_1px)] bg-size-[24px_24px]`
    with a radial `mask-image` fade.
  - Blurred colour glows: large `rounded-full` blobs, `blur-3xl`/`blur-[110–130px]`,
    emerald/lime on dark, primary/accent at ~7–20% on light.
  - Giant watermark text: `text-[12vw–18vw]` at 2–5% opacity (CEO "AYADI").
  - Top hairline: `h-px bg-linear-to-r from-transparent via-… to-transparent`.

### 6.1 Shared card chrome — `src/components/website/ui/card-chrome.tsx`

Use it for any light-surface card:

- `CARD_CHROME` — white card, `rounded-2xl`, ring, hover lift (`-translate-y-1.5`)
  and green glow shadow.
- `CardDecor` — cursor spotlight (radial at `--spot-x/--spot-y`) plus a top
  sheen that appears on hover.
- `handleSpotlight` — `onPointerMove` handler that feeds the spotlight
  (no re-render).
- `useCardTilt(maxTilt = 4)` — framer MotionValue 3D tilt for mouse pointers
  only, respects reduced motion. Spread onto a `motion.*` element.
- `IconTile` — icon in a tinted tile with an idle bob, a conic sweep on hover,
  and a fill that switches to the brand gradient.

Used by About, Blog (PostCard, featured card), Media, and GetStartedCta (tilt).

### 6.2 Recurring components

- **Eyebrow pill:** `inline-flex rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em]`
  plus a small dot (often with `motion-safe:animate-ping` or `animate-pulse`).
  Light version `bg-primary/10 text-primary-hover ring-primary/20`; dark
  version `bg-white/10 text-emerald-50 ring-white/20`.
- **Buttons:**
  - Hero primary: `rounded-lg bg-accent-gradient px-5 py-3 text-sm font-bold text-white`.
  - Enroll (navbar): `rounded-full bg-brand-gradient`, opens `EnrollmentModal`.
  - On dark: white pill (`bg-white text-emerald-900`) plus a ghost pill (`ring-white/25`).
  - Selected filter/tab: `bg-accent-gradient text-white`; unselected: `bg-surface ring-border text-muted`.
  - Focus: `focus-visible:outline-2 outline-offset-4 outline-primary` (lime on dark).

---

## 7. Motion system

**Principles in the code:**
- Animate only `transform` and `opacity`. Don't animate large `blur()` layers
  (re-rastered every frame). Cross-fade opacity instead of re-tinting.
- Drive scroll or pointer motion through MotionValues, GSAP `quickTo`, or CSS
  variables, so scrolling doesn't re-render React.
- Every animated component supports reduced motion (framer
  `useReducedMotion()` → `initial={false}` / no loops; Tailwind `motion-safe:`;
  GSAP `matchMedia('(prefers-reduced-motion: no-preference)')`). HowItWorks
  swaps to a static layout entirely.
- Touch devices don't get cursor lights or tilt (`(pointer: fine)` checks).

**House easing:** `[0.22, 1, 0.36, 1]` (framer) / `cubic-bezier(0.22,1,0.36,1)`.
Entrance: `opacity 0 → 1, y 14–40 → 0`, 0.4–0.7s, children staggered 0.1–0.15s,
`whileInView` with `viewport={{ once: true }}`.

**Which engine does what:**

| Where | Engine | Kind |
|---|---|---|
| Most sections | framer-motion | Entrance variants, hover, loops |
| HowItWorks | framer `useScroll` + springs | Pinned 460vh cinematic story, colour grade dark → daylight |
| Media Reel | framer `useScroll` | Pinned 320vh filmstrip |
| /courses (CoursesIntro, AyadiJourney) | GSAP + ScrollTrigger | Entrance timeline; pinned three-act scroll story |
| Home hero — Ayadi Universe | GSAP + ScrollTrigger (pin, scrub, snap) + CSS keyframes + a small rAF loop | Pinned ~6.4-screen story; the 3D worlds transform per chapter; idle loops and pointer tilt inside the ecosystem |

**Global keyframes** (`globals.css`): `spark-travel` (offset-path comets),
`icon-float` (idle bob), `idle-tilt`.

**Budget:** the Home page already has **two pinned scroll stories** — the
Ayadi Universe hero (~6.4 screens, the owner's choice) and HowItWorks (460vh).
New sections should be calm: entrance, hover, maybe one small loop. No more
pinned or scroll-jacked sections on Home.

---

## 8. Pages

### 8.1 Home — `src/app/(website)/page.tsx`

Order and intent:

1. **Hero = the Ayadi Universe** (`sections/Hero.tsx` →
   `ayadi-universe/AyadiUniverse.tsx`, §9). A pinned scroll story: the Ayadi
   logo with the page's eyebrow *"Learning for every next step"*, `h1` *"Start
   Your Future Education With **Ayadi Cloudversity**"*, paragraph and CTA
   *"Explore Learning Paths"* (→ `/courses`) → the logo becomes the core of a
   globe → the camera dives in → *"Choose your world"* (the two 3D worlds) →
   three chapters of the chosen brand. The old *"The Ayadi approach"* tabs
   were removed (they switched nothing).
2. **WhyChooseAyadi** — dark emerald→teal rounded panel. Left: "Our Edge"
   pill, "Why Choose **Ayadi**", two paragraphs. Right: three glass feature
   cards (Expert Instructors / Best-in-Class Program / Flexible Learning, tags
   Vetted / Personalized / Self-paced) with floating icon tiles, lime tag
   chips and a cursor spotlight.
3. **LearningPathways** — "Find something worth **learning**". Three
   **expanding panels** (one always open; hover/Tab/tap opens another; only
   `flex-grow` + opacity animate). Themes: 01 Explore Courses (dark green),
   02 Learn at Your Pace (navy), 03 Grow your Skills (teal→navy).
4. **CEOMessage** — light editorial: "Education is more **than learning.**",
   quote with a green left rule, and a YouTube video card (thumbnail first;
   the iframe loads only on click).
5. **HowItWorks** — pinned 460vh cinematic: Discover → Enroll → Learn → Grow.
   The stage grades from deep green to daylight white; perspective grid floor,
   timeline, chapter counter. Screen-reader copy is in an `sr-only` list.
   Step images are placeholders (`/images/journey-step.svg`).
6. **FeaturedCourses** — "Discover your next **skill**". Autoplay carousel
   (1 / 2 / 4 per view) over a light-to-dark-green vertical gradient. Course
   cards: Unsplash photo with emerald wash, level/rating chips, "Learn More"
   bar filled with the brand gradient.
7. **GetStartedCta** — dark green tilt card overlapping the footer. Keeps a
   two-column layout at every width.

### 8.2 Global chrome

- **Navbar** (`layout/Navbar.tsx`) — fixed floating glass bar,
  `max-w-[1180px]`. On scroll it compacts into a pill (thresholds: shrink at
  96px, re-expand below 40px) and re-expands on hover. Links (About, Courses,
  Blog, media) with icons; reading-progress bar in the brand gradient; "Enroll
  Now" opens `enrollment/EnrollmentModal.tsx`. Mobile uses a hamburger and a
  drop-down panel.
- **Footer** (`layout/Footer.tsx`) — dark green gradient, dot grid, lime
  section headings (`text-[11px] uppercase tracking-[0.2em] text-lime-300`),
  social icons, link columns.

### 8.3 Inner pages

- **About** (`about/AboutContent.tsx`) — light; `max-w-[1180px]`; headline
  lines revealed from a mask; mission statement lights up word by word;
  `CARD_CHROME` + `IconTile` cards; alternating `bg-page` / `bg-surface`
  sections.
- **Blog** (`blog/`) — featured post as a wide tilt card, category filter
  pills (navy when selected), `PostCard` grid (whole card clickable through
  one stretched link). Post page: `max-w-[68ch]` article, sticky contents
  sidebar, related posts.
- **Media** (`media/`) — hero with a dispersing composition, pinned 3D
  filmstrip (`Reel.tsx`), filterable mosaic grid (tile shapes declared per
  item, no layout shift), lightbox.
- **Courses** (`components/website/courses/`):
  1. `CoursesIntro` — GSAP entrance, cursor light, magnetic CTA, a pathway
     indicator sliding between the three brands.
  2. `AyadiJourney` — pinned three-act GSAP scroll story (platform → floating
     photo collage → subject grid). Uses `AyadiMark3D` (the logo extruded by
     stacking the PNG 9× along z — the reference technique for CSS 3D here).
  3. `CourseBrandTabs` — sticky brand switcher below the navbar.
  4. `BrandCourses` — programme cards for the active brand (dummy data in
     `dummyData.ts`).
  5. `GetStartedCta`.

---

## 9. Home hero

### 9.1 The Ayadi Universe — `src/components/website/sections/ayadi-universe/`

The Home page's opening story. One pinned stage, six resting steps:

| Step | Timeline stop | What happens |
|---|---|---|
| 1 Logo | 0 | Extruded Ayadi mark (`AyadiMark3D`) centred; eyebrow, `h1`, paragraph, CTA below |
| 2 Globe | 1.85 | Copy leaves; the mark turns a full 360° and shrinks into the core of a CSS 3D wireframe globe (`UniverseGlobe.tsx`); caption *"Welcome to the Ayadi universe"* |
| — Dive | 2.15–3.0 | The globe swells past the camera and dissolves; the 3D ecosystem arrives out of depth |
| 3 Choose | 3.35 | *"Choose your world"*: the ecosystem (§9.2) plus two brand buttons. Worlds are clickable too |
| 4–6 Chapters | 4.85 / 5.9 / 6.65 · 7.1 · 7.55 | Ecosystem slides left, the chosen world comes into focus (centred, ×1.42) and **transforms per chapter** (§9.3); chapter panels on the right. Chapter 3 rests three times |

- **Files:** `AyadiUniverse.tsx` (mode detection, GSAP timeline, state,
  rail, skip), `UniverseGlobe.tsx`, `BrandChapters.tsx` (panels +
  `BrandSwitch`), `content.ts` (chapter data), `universe.module.css`
  (layout for both modes).
- **Two layouts, one markup.** Default `data-mode="flow"`: ordinary stacked
  sections (phones, tablets, short screens, reduced motion, no JS).
  `data-mode="cinematic"` only when `(min-width: 1024px) and (min-height:
  700px) and (prefers-reduced-motion: no-preference)` — then the stage is
  pinned and the acts are layered. `gsap.matchMedia` reverts everything when
  the query stops matching.
- **Scroll mechanics.** One ScrollTrigger: `pin`, `scrub: 0.8`, `snap` to the
  resting steps (`SNAPS`), length `PIN_SCREENS` (6.4) screens. Timings live
  in `TOTAL`/`STEPS`/`SNAPS`/`CHAPTER_WINDOWS`/`viewAt()` at the top of
  `AyadiUniverse.tsx`. Continuous
  moves (logo → globe → dive → ecosystem → slide left) are scrubbed; *which
  chapter* shows is React state updated only when the step changes, and the
  panels crossfade with CSS.
- **The choice never blocks scrolling.** Cloudversity is selected by default;
  a switch above the chapters changes brand at any point (crossfade in
  place). Choosing from the buttons or a world scrolls into chapter 1.
- **Wayfinding:** a progress rail (right edge; jumps to each step) and a
  *Skip intro* button (bottom left) — cinematic only.
- **Content** (`content.ts`) reuses existing copy only: `brands.ts`
  (names, taglines, ledes), `journey.ts` (six subjects), `dummyData.ts`
  (placeholder programmes, CTAs), the Footer's three Cloudversity pathways.
  No stats. The one new line is AyaTech chapter 3's text ("By building…").
  Chapters: Cloudversity — Pathways · Subjects · Programmes; AyaTech —
  Focus · Tracks · Build. Both brands must keep **exactly three** chapters.
- **Colours:** light "daylight universe" (mint/teal washes, green star dots),
  not dark space. AyaTech uses green + white (`from-brand-start
  to-primary-hover`), Cloudversity the brand gradient.
- **Rule:** nothing GSAP animates carries a CSS transform of its own (layers
  are positioned with left/top/margins); the globe fades its rings through a
  `--globe-o` variable, never opacity on a `preserve-3d` element.

### 9.2 The 3D ecosystem — `src/components/website/sections/hero-ecosystem/`

(See §9.3 for how the worlds respond to the story's chapters.)

**Concept.** Two floating miniature worlds, **Ayadi Cloudversity** (learning)
and **AyaTech** (technology), with a small **shared core** between them and a
curved 3D connection through all three. The core is *not* a third brand — it
has no label. Used inside the Universe story as the "choose your world"
scene. Props: `focus` (brings one world forward, sends the rest back, hides
the arc) and `onSelectWorld` (makes the worlds clickable).

**Technique.** Pure CSS 3D: `perspective` on a camera, `transform-style:
preserve-3d` down the tree, flat planes placed in space. No WebGL, no new
dependency. It renders completely on the server.

| File | Contents |
|---|---|
| `Hero3DEcosystem.tsx` | Stage, backdrop washes, pointer tilt (rAF that runs only while settling), offscreen pause (IntersectionObserver → `data-paused`), world hover state, ambient motes |
| `geometry.ts` | Units, CSS-matching rotation math, the two compositions (`LAYOUTS`), `arcThrough` (circle through 3 points → plane `matrix3d`), `BASE_TILT_X` |
| `primitives.tsx` | `SceneAnchor` (position → focus → entrance → hover lift → idle float, one transform owner each), `Billboard`, `Orb`, `Prism` (5-face box), `WorldLabel`, `GroundShadow` |
| `CloudversityWorld.tsx` | Floating island; a spiral of 8 steps climbing a column of light (colour climbs green → teal → hint of navy → white); orbit ring with knowledge nodes; fanned open pages; rising motes |
| `AyatechWorld.tsx` | Processor chip turned 45° over a grid; lit die; circuit traces with signal pulses; 3 white towers; floating "stack layer" plate. **Green, white and dark green only** |
| `EcosystemCore.tsx` | Glass sphere (front and back camera-facing discs) around a rotating octahedron crystal; two tilted rings with sweeping arcs |
| `ConnectionStream.tsx` | SVG arc drawn inside the oriented plane; gradient teal → white → green; particles travelling both ways |
| `ecosystem.module.css` | All styling and keyframes; uses the tokens |

**Units.** The stage is always **640 units wide**; `--u: calc(100cqw / 640)`
(container query) converts units to px, so the scene scales with its column in
CSS alone. Axes are CSS's own: x right, y down, z toward the viewer. Computed
numbers are rounded before reaching inline styles, to avoid hydration
mismatches.

**Compositions** (`LAYOUTS`; switched at `40rem` by CSS custom properties):
- `wide` (≥ sm, stage 640×600): Cloudversity upper-left `[-148,-112,0]`,
  core `[48,-34,110]` (forward), AyaTech lower-right `[150,118,24]`, worlds
  ×0.9.
- `compact` (phones, 640×470): worlds side by side, core arched above; worlds
  ×0.84; fewer details (`max-sm:hidden` on pages, extra towers/rings, motes).

**Camera and interaction.** Base look-down `BASE_TILT_X = -18°`. The mouse
tilts up to ±9° (Y) / ±5° (X) toward the cursor. Hovering a world lifts it
toward the viewer, brightens its glow and highlights its label. Idle: gentle
floats, a slow sway of the whole scene, slow spins (helix, crystal),
particles, breathing light.

**Rules that keep the 3D intact:** only leaf elements get `opacity`,
`filter`, `overflow` or `mask` (on a `preserve-3d` element they flatten it).
Glows are radial gradients, not blur filters. One transform owner per
element.

**Performance and accessibility:** idle motion is compositor-only CSS; the
pointer loop stops when settled; everything pauses offscreen. Reduced motion
shows a still scene (no animation, particles or tilt). Touch devices get no
tilt. The stage is `role="img"` with an `aria-label`; its contents are
`aria-hidden`.

**Tuning:** composition in `geometry.ts` (`LAYOUTS`; the arc recomputes
itself); tilt strength in `Hero3DEcosystem.tsx` (`TILT`); particle count in
`ConnectionStream.tsx` (`PARTICLES`).

### 9.3 The worlds tell the chapters

The chosen world is not a static illustration: it transforms with each
chapter, driven entirely by CSS custom properties.

- **Signals.** The Universe timeline scrubs `--cp0`, `--cp1`, `--cp2`
  (0 → 1, `CHAPTER_WINDOWS`) on the ecosystem wrapper. The focus layer
  (`.focusLayer` in `ecosystem.module.css`) gates them with `--on` so only the
  world in focus hears them, as `--k0/--k1/--k2`, plus `--kl/--kb/--kg` for
  the learn/build/grow thirds of chapter 3. Pieces compute scale/translate
  from these with `calc()`/`clamp()`; opacity is only used on leaves.
- **Loops** that cycle through items run only while their chapter is on
  screen (`data-chapter` on the stage + `[data-focus='in']`), so they start
  from the first item each time.
- **Layering rule:** position group → chapter/scroll state group → loop group
  → geometry. Never put two transform writers on one element.
- **Cloudversity** (`CloudversityWorld.tsx`) — platform + learning core
  (orb under a spiral of steps) + six learning structures at the six subject
  angles (book / graduation cap / pages / laptop / creative forms / tree),
  orbit with knowledge nodes, orbiting pages.
  1. Pathways: four pathway lines (Academic ↑, Skills →, Career ↓,
     Creative ←) draw out of the core, end nodes + labels appear, particles
     run them, the core brightens, the platform widens.
  2. Subjects: six subject nodes (the `journey.ts` subjects) rise round the
     ring; a 7.2s loop lights one at a time with a link to the core, and its
     structure lifts and glows.
  3. Programmes: structures and core bow out, a portal opens, the three
     `dummyData` programmes rise one per scroll stop and settle in an arc.
  A photo panel arrives for each chapter (learning / skills / career).
- **AyaTech** (`AyatechWorld.tsx`) — processor core with pulse, three zones
  on the package corners (AI network ↑ back, Cloud cluster ← left, Software
  stack → right), data columns, server rack, circuit pulses.
  1. Focus: AI → Cloud → Software each draw their circuit, light their column
     and grow in.
  2. Tracks: a branch from the core to each zone, zones spread; a 7.2s loop
     brings one track forward (brighter, +Z) with data running its branch.
  3. Build (three stops): Learn — zones draw in, the knowledge node swells;
     Build — nine blocks leave the core and assemble; Grow — the structure
     rises, beacon and ring light, rack fully lit.
- **In step with the text:** in chapter 3 the right-hand card for the current
  stop lights (`litCard`).
- **Photos** (`photos.ts`, `PhotoPanel.tsx`): drop files at
  `public/images/universe/cloudversity-learning.jpg`, `…-skills.jpg`,
  `…-career.jpg`. `Hero.tsx` (server) checks which exist at build time; missing
  ones render a tinted placeholder (with the expected path in development).

**History:** a revision that added three photo cards (Academic Learning /
Skills & Personal Growth / Career Readiness) into this scene, a "What we
provide" row, a GSAP scroll drift, and an editorial rewrite of
WhyChooseAyadi was built and then **rolled back at the owner's request**
(2026-09-21). Don't reintroduce it without asking.

---

## 10. Imagery and assets (`public/images/`)

| File | Use |
|---|---|
| `ayadi-logo.png` (+ `-dark`, `-white`, `-white-trimmed`, `-original`) | Navbar / footer logo |
| `ayadi-logo-white.svg` | Hand-drawn approximation, **not** the real logo |
| `ayadi-mark.png` | Mark cut from the logo by colour; used by `AyadiMark3D` |
| `footer-student.png` | GetStartedCta photo |
| `journey-step.svg` | Placeholder for HowItWorks step images |
| `blog/placeholder.svg` | Blog cover placeholder |
| `hero-learning.png` | Previous hero photo — **currently unused** |

Remote images: `images.unsplash.com` is allowed in `next.config.ts` (course
cards, collage). Photo treatment convention: an emerald or navy gradient wash
from the bottom (`from-[#063f32]/70` or `from-accent-strong/50`) so every
photo sits in the palette. Use real, authentic education imagery — avoid
generic stock.

---

## 11. Accessibility conventions

- Every decorative layer is `aria-hidden="true"` and `pointer-events-none`.
- Sections use `aria-labelledby` pointing at their heading id.
- Cinematic sections keep an `sr-only` plain version of their content.
- One link per card (stretched `after:inset-0` hit area) instead of repeated links.
- Off-screen carousel slides are not focusable.
- Contrast: `brand-end` teal fails for small text on white (3.7:1). Use
  `primary` or `brand-teal`.
- Tailwind can only see literal class strings — never build class names at
  runtime (`hover:${x}`); list them in full (see `brands.ts` themes).

---

## 12. Content rules

- **Don't invent statistics** (percentages, success rates, learner counts,
  ratings). Where no real data exists, make visuals conceptual.
- Existing copy already contains figures that should be verified with the
  client before launch: "200+ Courses" (LearningPathways, FeaturedCourses,
  GetStartedCta), "Join thousands of learners", course ratings/durations, and
  the stats in `brands.ts` (100+, 3K+, …). Much of this is placeholder/dummy
  data.
- Audience: parents and students. The site should read as educational,
  trustworthy, modern and approachable — not gaming, sci-fi or generic SaaS.
  Clarity first, visual experience second.

---

## 13. Known inconsistencies and open decisions

1. **AyaTech colour:** navy in `/courses`, LearningPathways panel 02 and the
   `globals.css` scale; green + white in the Home 3D hero (the owner's latest
   direction). Needs one answer.
2. **AyaTech vs Ayatech** spelling.
3. **Navy is "on trial"** and its hex is unconfirmed.
4. **`font-sans` → `--font-plus-jakarta` is never loaded**; Manrope is the
   real font.
5. **Hard-coded hex values** in CEOMessage, FeaturedCourses and Footer, plus
   raw Tailwind `emerald-*`/`lime-*` on dark panels, instead of tokens.
6. **Hero CTA** now goes to `/courses` (the old `#learning-pathways`
   anchor pointed at the hero's own tabs, which are gone).
7. **Dead links:** `/events` and `/contact` (footer, GetStartedCta "Talk to us")
   have no routes yet.
8. HowItWorks step images and blog covers are placeholders.

---

## 14. Checklist for design changes

- [ ] Use the tokens and gradients from `globals.css`; don't add a new palette.
- [ ] Keep sections light (`bg-page` / `bg-surface`) unless the section is one
      of the established dark panels.
- [ ] Headings navy with a gradient keyword; eyebrow pill above; muted body.
- [ ] Rings, not borders.
- [ ] Reuse `card-chrome.tsx` for light cards.
- [ ] Motion: transform/opacity only; house easing; `once` entrances;
      reduced-motion path; no cursor effects on touch.
- [ ] Don't add another pinned scroll section to Home.
- [ ] No invented stats; conceptual visuals where data is missing.
- [ ] Don't touch other sections when asked to change one.
- [ ] Verify with `tsc`, `eslint`, `npm run build`.
