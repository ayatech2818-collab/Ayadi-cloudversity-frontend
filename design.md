# Ayadi Cloudversity — Design Reference

A briefing for anyone (human or agent) about to change the look of this site.
It records the design system as it exists in the code today, the reasoning
behind it, and the open questions. When this file and the code disagree, the
code wins — update this file.

Last updated: 2026-09-22.

---

## 1. Read this first

- **Stack.** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript ·
  Tailwind CSS v4 · framer-motion · GSAP (+ ScrollTrigger) · lucide-react.
  three.js + React Three Fiber are used **only** by the Home hero (one
  lazy-loaded WebGL canvas, §9); every other 3D effect is CSS 3D transforms.
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
| **AyaTech** | Sub-brand: technology, software, AI | **Inconsistent — see §13.** Navy on `/courses` and the Home "Learning Pathways" panels; green + white in the Home hero's Choose your world card |
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
| /courses (CoursesIntro, AyadiJourney) | GSAP + ScrollTrigger | Entrance timeline; pinned three-act scroll story — the same journey that *is* Cloudversity's world on Home (§9.5) |
| Home hero | CSS `position: sticky` stage + one GSAP ScrollTrigger (`scrub: 0.9`, no snap, no JS pin) driving a WebGL scene (three.js / React Three Fiber, custom GLSL) | ~8.45-screen journey on a stationary page: logo → globe → portal, with *Why choose Ayadi* on its glass on the way in → liquid crossing → Choose your world → dissolve into the active world's own journey |

**Global keyframes** (`globals.css`): `spark-travel` (offset-path comets),
`icon-float` (idle bob), `idle-tilt`.

**Budget:** the Home page has **three pinned scroll stories** — the hero
journey (~8.45 screens, 7.25 on phones), the active world's journey right
after it, and HowItWorks (460vh). The first two never render at the same
time (§9.5). New sections should be calm: entrance, hover, maybe one small
loop. No more pinned or scroll-jacked sections on Home.

---

## 8. Pages

### 8.1 Home — `src/app/(website)/page.tsx`

Order and intent:

1. **Hero = the scroll journey** (`sections/Hero.tsx` → `hero/AyadiHero.tsx`,
   §9). A centred opening: a faint AYADI watermark behind the 3D mark, then eyebrow *"Learning for every next step"*, `h1` *"Start Your Future
   Education With **Ayadi Cloudversity**"*, paragraph and CTA *"Explore
   Learning Paths"* (→ `/courses`) → scroll: the mark
   becomes the core of a globe → the globe becomes a portal, and on its glass,
   as the camera nears, *"Why choose Ayadi?"* and three cards one by one → the camera flies
   through its liquid glass → *"Choose your world"* (Ayadi Cloudversity or
   AyaTech). **Ayadi Cloudversity is the world you are already in** — it is
   selected when the choice appears, and the hero dissolves straight into
   its three-act journey on this same page (§9.5); the choice switches
   worlds rather than unlocking one, and a small floating switcher carries
   on doing that once a world has the screen. AyaTech's world is still to be
   built. The old *"The Ayadi approach"* tabs were removed (they switched
   nothing).
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
     The same component *is* Cloudversity's world on Home (§9.5), where it
     is passed `bare` — the card around it (`CARD`) is this page's framing,
     not the journey's. The plan is to drop it from this page once Home has
     been signed off, so keep it one component rather than forking it.
  3. `CourseBrandTabs` — sticky brand switcher below the navbar.
  4. `BrandCourses` — programme cards for the active brand (dummy data in
     `dummyData.ts`).
  5. `GetStartedCta`.

---

## 9. Home hero — `src/components/website/sections/hero/`

A scroll-driven WebGL journey — *"scroll into the Ayadi digital universe"* —
that ends at **Choose your world** and dissolves into the world it lands in:
Ayadi Cloudversity by default, whose experience is the existing three-act
journey (§9.5). AyaTech's world is not built yet (§9.6).

### 9.1 The journey

One stage, one ScrollTrigger, one master timeline scrubbed across **8.45
screens** of scroll (7.25 on phones). The master plays the **story** (`SCORE`
+ `CUES`, `TOTAL = 10` story units) 1:1, except that story 4.9 → 5.55 — the
portal's glass fading in, the camera on its way to it — is **stretched** over
2.7 master units for the **Why Choose Ayadi stage** (`STAGE`). The camera
never stops: it moves more slowly there, plus a steady extra dolly (`push`)
that is handed back in the fast approach after. Story times in the table
below are story units; after story 5.55, add 2.05 for master units. No
snapping: stopping leaves the scene exactly where the scroll is, and
scrolling back plays it backwards.

**The page stands still for the whole journey.** Everything — the opening
included — lives on one stage that is `position: sticky; top: 0` inside a
section `100lvh + 795vh` tall (`675vh` on phones). The browser holds the stage
in place (a JavaScript pin at the very top of a page slips by a frame first);
scrolling only moves the timeline. The timeline then runs half a screen past
the section (`TAIL`), which is where the light clears and the world takes
over (§9.5) — by then the stage has let go, behind that light, and the page
is already in the world. Scrolling back up re-enters it the same way.
Nothing between the stage and the page's scroller may clip
(`overflow: hidden/auto`) or sticky stops working.

| Units | What you see |
|---|---|
| 0 | **Opening** — one centred column at every width, never a grid. A huge, faint **AYADI** watermark; the 3D Ayadi mark in front of it (docked in the logo slot, a soft contact shadow under it); then eyebrow *"Learning for every next step"*, `h1` *"Start Your Future Education With **Ayadi Cloudversity**"*, paragraph, CTA *"Explore Learning Paths"* (→ `/courses`), and *"Scroll to explore"* under the button. Light page |
| 0.1–2.1 | The copy fades where it stands (0.1–0.9, no scrolling). The mark comes free of its slot, turns to show its extruded depth, the camera pulls back, and the page darkens into deep green space |
| 1.3–3.1 | A globe draws itself round the mark — latitude rings and meridians, dark glass body, atmosphere, a quiet network of points and arcs. The mark shrinks into its glowing core. Caption *"Welcome to the **Ayadi universe**" / "Learning, from anywhere in the world."* |
| 3.7–5.5 | **Globe → portal.** The globe tips to face the camera (which has been drifting right and down to face it head-on since 3.0); its rings square off into the portal's frames and its meridians straighten into rails. The core drifts back through the portal and fades. A liquid-glass surface fills the front frame |
| 4.9–5.55 *(stretched)* | **Why Choose Ayadi, on the glass.** As the glass appears the camera keeps travelling toward it, slowly. On the glass: its shade darkens softly; pill *"Our Edge"* and *"Why Choose **Ayadi**?"* surface; then one card per stretch of scroll — **Expert Instructors**, **Best-in-Class Program**, **Flexible Learning** — each rising out of the glass, tag springing on, accent line drawing; a short hold with all three; then they sink back into the glass, shrink and fade, the heading and shade after them |
| 5.55–6.5 | **Approach.** The glass brightens and ripples as the camera speeds toward it. Caption *"Step into the Ayadi ecosystem"* (now just after the stage) |
| 6.15–7.6 | **Crossing.** The camera flies through the surface (z = 0 at ≈ 6.55). A full-screen liquid pass peaks there (flowing refraction, ripples, the membrane's edge sweeping past, slight chromatic split); FOV kicks 40° → 50° → 42°; the far side swaps in under the distortion |
| 7.0–8.45 | **The far side.** Bright sky, a pale floor with a fine green grid, a soft pool of light behind each card. Eyebrow *"Two worlds, one ecosystem"*, `h2` *"Choose your world"*, then the two cards |
| 8.45–10 | Hold, then the page scrolls on to WhyChooseAyadi |

**Why Choose Ayadi panel** (`WhyStage.tsx`) — the heading and three compact
card rows, laid out flat (`min(34rem, 92vw)` wide) and kept **on the portal's
glass** by the scene: every frame `placeInfo()` (scene/HeroScene.tsx)
projects the glass's centre and size and moves/scales the panel onto it —
84% of the glass, never below 0.85× — so it grows as the camera nears and
sways with the pointer's orbit exactly as the glass does. On a phone, where
the glass is too small to read from, the panel is sized to the screen
instead. A soft shade behind it (`.whyScrim`) keeps the words readable on the
brightening glass. The card is the WhyChooseAyadi section's feature card as a
row: glass surface (no backdrop blur — it would re-blur the live canvas every
frame) with a faint reflection, white ring, top sheen, cursor spotlight
(`useCardTilt`'s `--spot-x/--spot-y`), hover lift with lime glow and ring,
48px icon tile (−6° and 1.05× on hover, conic lime border that shows and
turns on hover only), icon floating gently, lime tag hanging from the icon,
accent line that grows on hover, shimmering *"Ayadi"*. Pointer: tilt
(`useCardTilt(4)`) and spotlight. The copy is the section's, word for word
(kept in step by hand — the section is untouched). The panel is
`aria-hidden`: the WhyChooseAyadi section below is its accessible version.
Still layout: the same panel, dark, between the opening and the choice.

**Choose your world** — two cards (`ChooseWorld.tsx`): **Ayadi Cloudversity**
(graduation cap, `bg-brand-gradient`, *Education · Learning*, tagline from
`brands.ts`) and **AyaTech** (CPU, `from-brand-start to-primary-hover` —
green and white, never navy, *Technology · Development*). Real buttons with
`aria-pressed`; pointer tilt via `useCardTilt(6)` with the icon and text at
different depths; cursor light; selected state is a primary ring + check —
**Cloudversity wears it from the moment the cards arrive**, because that is
the world the page is already in. Choosing switches worlds; nothing has to
be clicked to go on (§9.5).

### 9.2 Architecture

| File | Job |
|---|---|
| `AyadiHero.tsx` | Mode detection, the **story** (`SCORE` — every rig move; `CUES` — the HTML layers), the **Why stage** (`STAGE`, `PUSH`) and the master timeline that stretches the story for it, the **dissolve out** (`CHOOSE_OUT`, `CURTAIN`), the one ScrollTrigger (section top → bottom, `scrub: 0.9`), `measure()` (fits the opening, measures slot, watermark and the Why panel), the pointer/resize listeners, "Skip to the choice", and which world is mounted below (§9.5) |
| `WhyStage.tsx` | The Why Choose Ayadi heading and three cards |
| `rig.ts` | The rig: a plain object of numbers GSAP writes and the scene reads. `RIG_START`, and the quality tiers (`pickQuality`) |
| `ChooseWorld.tsx` | The two cards, at the end of the hero. Which one is selected is the active world |
| `WorldSwitcher.tsx` | The floating glass pill — the active world, and the way to the other one — for as long as a world has the screen. Writes the cursor into `--x`/`--y` and nothing else |
| `AyatechWorld.tsx` | AyaTech's holding card, until its own journey exists |
| `courses/AyadiJourney.tsx` | **Reused, not rebuilt**: Cloudversity's world, three acts. Owns its own pin, its own ScrollTriggers and its own cleanup |
| `hero.module.css` | Both layouts (below) |
| `scene/HeroScene.tsx` | The single `<Canvas>`; **Director** (the clock, the camera, docking the mark into its slot); **LiquidPass** (renders the frame) |
| `scene/Mark.tsx` | The extruded mark (geometry traced from `ayadi-mark.png`) |
| `scene/GlobePortal.tsx` | Globe body, atmosphere, network, core glow, the lattice (two passes: core + soft halo), the liquid surface |
| `scene/Environment.tsx` | Backdrop (three skies in one full-screen shader), motes (`Points`), the far side (floor + two glows) |
| `scene/geometry.ts` · `shaders.ts` · `frame.ts` | Procedural geometry · all GLSL · per-frame shared values |

**Data flow:** scroll → ScrollTrigger (scrub) → master timeline → story
timeline (+ stage tweens) → `rig` →
`gsap.ticker` calls R3F's `advance()` → `useFrame` → uniforms and camera.
React state changes only for the layout mode, "scene ready" and the chosen
card — never during animation.

**Rules to keep:**
- **One score.** Every story value moves only through a `SCORE` line. Lines
  for the same key must not overlap; each starts where the previous one for
  that key ended. That is what makes it reversible and safe to fling. Add a
  moment by adding lines, never by animating a story value in `useFrame`.
  The exceptions are `info` (0 → 1 through the Why stage) and `push`
  (its extra dolly, 0 → 0.6 → 0), moved only by the master. To give another
  moment more room, stretch the story the same way rather than retiming
  `SCORE` — and never across a spot where the camera would stand still.
- **Idle motion is additive and time-based** (globe's idle turn — which winds
  down as it becomes the portal — ripples, arcs, motes, the mark's sway). It
  never writes the rig.
- **Pointer is secondary:** the camera orbits a few degrees round its target,
  easing off to a quarter while the mark is docked and letting go entirely
  during the liquid pass; the mark and globe get a small extra turn. Mouse
  only — touch gets none.
- **The look target never falls behind the camera** (`z ≤ camZ − 4`), so the
  camera flies through the portal without flipping round.
- **Docking:** the mark lives at the world origin; the Director shifts the
  projection matrix (elements 8/9) so it lands on `.slot`. The slot is
  measured relative to the stage — which is exactly the canvas — on every
  ScrollTrigger refresh and opening reflow, so no scroll offset is involved.
- **Fit:** the opening no longer scrolls, so it must fit on the stage. On a
  short screen `measure()` sets `--fit` and the whole column scales down
  (floor 0.5).
- **The watermark** has to sit *behind* the 3D mark, and the canvas is opaque
  under the page's HTML, so it is drawn by the backdrop shader: `.watermark`
  (hero.module.css) lays it out, `measure()` records its box and font into
  `rig.watermark`, and `Backdrop` rasterises it once into a small canvas
  texture and places it on that box every frame (fading with `dock`). The HTML element itself only shows until the scene's
  first frame, and in the still layout. Change its size, spacing, tint or
  fade in both places (`BACKDROP_FRAGMENT` mirrors the CSS).
- **Colour:** every material is a `ShaderMaterial` writing display-space
  (sRGB) values straight out (Canvas `flat`, no colour-space chunks, RGBA8
  render target). Don't add three's lit materials — they would render darker
  through the liquid pass. Palette is in the header of `shaders.ts`.
- **Render loop:** `frameloop="never"`. The ticker renders only while the
  hero is on screen, at up to 60 fps while scrolling or pointing (700 ms),
  30 fps at rest; if frames stay slow while busy it steps DPR down by 0.25.
  The liquid pass (an extra render-target pass) exists only while
  `distortion > 0` — about 1.5 of the 10 units.
- **Quality tiers:** high (≥ 1280 px, > 4 cores): DPR ≤ 1.5, MSAA, 190 motes,
  160-segment lattice + halo, liquid target ×0.75 · medium (768–1279 px):
  DPR ≤ 1.25, 130, 128 + halo, ×0.6 · low (< 768 px or ≤ 4 cores): DPR ≤ 1.25,
  70, 96, no halo, ×0.5. Portrait screens dolly back before the portal by
  `fit = (1.3 / aspect)^0.85`.
- **Cleanup:** geometries and the render target are disposed in effect
  cleanups; R3F disposes the renderer and declarative materials on unmount.
- **Bundle:** three + React Three Fiber (~245 KB gzipped) live in their own
  chunk, loaded by `next/dynamic({ ssr: false })` after hydration. Until the
  first frame is drawn, the static `ayadi-mark.png` stands in the slot.

### 9.3 Two layouts

- `data-mode="still"` — SSR default; stays for **reduced motion** or **no
  WebGL2**. The opening, then Choose your world as an ordinary section, static
  mark image, no canvas, no pin.
- `data-mode="cinematic"` — the sticky `100lvh` stage (UI inside keeps to
  `100svh`) holds the opening, the canvas, captions, cards, the progress line
  and the skip button; a CSS "shade" stands in for deep space until the
  canvas has drawn. The opening fades out with `autoAlpha`, so once gone it
  no longer covers the stage.

**Accessibility:** the `h1` is in the opening; captions are real text; the
canvas is `aria-hidden`; cards are buttons; "Skip to the choice" stays in the
tab order from the start (opacity only, shows itself on focus).

### 9.4 Tuning knobs

- Pacing: `SCORE`, `CUES`, `STAGE` (+ `STAGE_FROM`, `STAGE_TO`, `STAGE_LENGTH`, `PUSH`) in
  `AyadiHero.tsx`; if the stage's length changes, change the section height
  by the same ratio (`MASTER_TOTAL / TOTAL`) to keep scroll speed; scroll length = the
  `.root[data-mode='cinematic']` height in `hero.module.css`.
- Globe/portal shape: `GLOBE_R`, `PORTAL_HALF`, `PORTAL_EXP`, `PORTAL_DEPTH`
  in `scene/geometry.ts`; the morph itself in `LATTICE_VERTEX`.
- The liquid: `LIQUID_FRAGMENT` (flow, waves, membrane, split) and
  `SURFACE_FRAGMENT`.
- Pointer strength: `direct()` in `HeroScene.tsx`.
- The dissolve into the world: `CHOOSE_OUT`, `CURTAIN`, `VEIL`,
  `ATMOSPHERE`, `WORLD`, `SHOWN_AT`, `TAIL`, `DARK_AT` in `AyadiHero.tsx`;
  the pull-up on `.world` and the two sheets in `hero.module.css`. Three
  rules hold it together, and all three are geometry, not taste: the world's
  pin must engage **before** the light thins enough to show it
  (`pin ≈ release − (pullUp − 1 + 84px/vh) / unit`, worst case on the
  tallest screens); the light must be opaque **before** the sticky stage
  lets go (`release = MASTER_TOTAL × section / (section + TAIL)`); and the
  reveal must end early enough to leave act one a hold. Change the pull-up,
  `TAIL` or the section height and re-check all three.

### 9.5 The worlds — how the hero becomes one

The hero does not end and hand over to something else: it **dissolves into
the world it is already in**. `world` (`AyadiHero`) starts at
`'cloudversity'`, and that world's experience is
`courses/AyadiJourney.tsx` — the three-act story the courses page runs,
reused exactly, mounted directly under the hero. Nothing is clicked to get
there, no route changes, no page is left.

**The dissolve** is the last screen and a half of the hero's own scrubbed
timeline, in master units:

| | |
|---|---|
| 9.9 → 10.5 | the choice arrives, Cloudversity already selected |
| 10.5 → 10.8 | it holds |
| ~9.9 → ~11.1 | the world composes itself and pins, unseen (its own triggers) |
| 10.8 → 11.15 | `CHOOSE_OUT` — heading and cards dissolve |
| 10.85 → 11.13 | `VEIL.in` — a sheet of light fills the screen |
| 10.85 → 11.25 | `CURTAIN` — the scene dissolves behind it |
| 10.95 → 11.3 | `ATMOSPHERE.in` — green air rises inside the light |
| 11.2 (`DARK_AT`) | the scene is ~3% visible: it stops rendering |
| 11.13 → 11.23 | full white — a beat, ~7vh, no more |
| 11.22 → 11.52 | `WORLD` — the world fades up **in place**, behind the light |
| 11.23 → 11.61 | `VEIL.out` — the light clears off it |
| 11.34 | the sticky stage lets go — behind the world, unseen |
| 11.4 (`SHOWN_AT`) | the world takes the pointer; the switcher comes out |
| 11.58 → 11.98 | `ATMOSPHERE.out` — the green air thins out last |
| ~11.95 | act one's own hold runs out and it moves on, as it always does |

The world is **edge to edge**: the journey is passed `bare`, so it keeps the
clipping it needs and drops the card — no rounded box, no ring, no shadow,
no margins, and its acts take the whole pinned stage rather than sitting
14px inside it — and plays straight on the page colour, which is what the
hero has just dissolved into. Nothing wraps it on this side either:
`.world` is a bare positioning box. `/courses` keeps the card (§8.3): there
it really is a panel on a page.

**The light** (`.veil` + `.atmosphere`, `hero.module.css`) is what makes that
one move rather than two. Both are fixed sheets over the hero *and* the
world, driven by the hero's own timeline: white fills the screen as the
choice and the scene dissolve into it, green air rises inside it, and then it
clears. While it clears it is still blurring what is behind it
(`backdrop-filter`), so the world settles into focus rather than switching
on — and because the sheet covers everything, the two things that would
otherwise give the seam away happen invisibly inside it: the sticky stage
letting go, and the world climbing the last of the way into place. Outside
this moment both sheets are `visibility: hidden`, so the full-screen backdrop
pass costs nothing.

**Nothing travels.** The world does not scroll up into view like a next
section: it is pulled up `-104svh` over the hero's last screen, so it
composes (its own approach timeline) and then **pins** — its own
ScrollTrigger, no new one — around master 11.1, while the white is at full.
By the time a single pixel of it can be seen (11.24) it has been standing
still for a while. All the hero does is stop hiding it: `.world` is
`opacity: 0` in the cinematic layout and the timeline fades it up in place.
Opacity only — a transform or a filter on that wrapper would become the
containing block for the `position: fixed` its pin uses and the pin would
come apart; the focus comes from the light in front of it instead. It takes
no clicks until `SHOWN_AT`, so the choice above it stays reachable while it
waits. Verified still-before-seen from 600px to 2000px of viewport height.

The pull-up spends a little of act one's own hold — the journey's pinned
timeline starts at its pin, and the hero's last three quarters of a unit run
alongside it — which is why the reveal is short: 54vh of act one on screen
against 56vh on `/courses`, with ~25vh of it settled and still before it
moves on. Phones cannot pin (the journey only pins from 768px), so there the
world arrives already filling the screen and then scrolls on, like the rest
of the mobile page.

`.world` is positioned (`z-index: 1`) so it paints over the stage, and the
pull-up only applies once it has something in it (`:not(:empty)`) and only
in the cinematic layout. Scrolling back up plays the whole thing backwards:
the light returns, the scene returns, the choice returns.

**One cinematic at a time** is a consequence of those numbers, not a special
case: the scene stops drawing at 11.66 and the world's first tween starts at
11.82. `rig.live` (`sync()`) holds the rule — the hero has the screen, the
world does not, and the curtain has not fallen — fed by two
IntersectionObservers and the trigger's own progress. Only the active world
is mounted: switching takes the other one's GSAP context, triggers and pin
with it.

**The switcher** (`WorldSwitcher.tsx`) is a piece of glass, not a toolbar: a
pill fixed near the top centre (`6rem`, `4.75rem` on phones — clear of the
navbar), translucent white over `blur(18px) saturate(150%)`, a lit rim and
inner highlight for thickness, one soft shadow. No gradient fills. The world
you are in is a clearer **pane** of the same glass that slides between the
two halves (`translate`, 0.55s); its label turns primary green. Both halves
are `flex: 1 1 0`, so they are exactly half the pill each and the pane lines
up with either.

Under the cursor the glass answers in two layers, both following `--x`/`--y`
(written on pointer move, mouse only — no state, no re-render): a **lens**,
a masked `backdrop-filter` circle that brightens and refracts what is behind
it, and a **glow**, white at the centre fading through brand green, blurred
7px. They fade in and out over half a second, so the light drifts after the
cursor rather than snapping to it. Both are absolutely positioned inside the
pill and the pill never scales, so none of it can move the page; both are
dropped entirely under `prefers-reduced-motion: reduce`. (The pill's own
backdrop-filter makes it a backdrop root, so how much of the page the lens
really refracts is up to the engine — it is a bloom either way.)

Shown while a world holds most of the screen (`data-on`, written straight to
the DOM) and hidden — `visibility`, so it leaves the tab order too — before
and after. Two `aria-pressed` buttons, focus ring drawn inside (the pill
clips). Switching from inside a world lands at the new world's own start
(its pin's `start`, read off its ScrollTrigger); switching from up in the
hero just changes what is waiting below.

**The journey's chunk** is fetched and mounted in the first idle moment after
the page loads — it is the default world, not something a click unlocks —
so it is long ready by the time the dissolve reaches it. Its own calls to
action scroll to the courses further down this page rather than leaving for
`/courses`.

**AyaTech** renders `AyatechWorld.tsx`: the brand's own words, centred on the
same open page, with no panel around them either. It is the seam, not a
design — when that journey is built it replaces that file.

### 9.6 History and what is next

- Replaced (2026-09-22): the **Ayadi Universe** — a CSS-3D globe and two
  chapter-driven CSS-3D worlds (~5.5k lines: `ayadi-universe/AyadiUniverse.tsx`,
  `UniverseGlobe.tsx`, `hero-ecosystem/*`, `lib/public-asset.ts`). It is in
  git history at `4de6d65`.
- Kept, **not rendered**: `ayadi-universe/BrandChapters.tsx` and `content.ts`
  (the chosen brand's three chapters), with a `universe.module.css` trimmed to
  the rules they use — material for **AyaTech's** world, the one choice that
  still opens into nothing.
- Next, once the Home worlds are signed off: drop `AyadiJourney` from
  `/courses` so the three acts live in one place, and build AyaTech's world
  in place of `AyatechWorld.tsx`.
- An earlier revision with photo cards, a "What we provide" row and an
  editorial WhyChooseAyadi was **rolled back at the owner's request**
  (2026-09-21). Don't reintroduce it without asking.

---

## 10. Imagery and assets (`public/images/`)

| File | Use |
|---|---|
| `ayadi-logo.png` (+ `-dark`, `-white`, `-white-trimmed`, `-original`) | Navbar / footer logo |
| `ayadi-logo-white.svg` | Hand-drawn approximation, **not** the real logo |
| `ayadi-mark.png` | Mark cut from the logo by colour; used by `AyadiMark3D`, as the hero's stand-in mark, and traced for the hero's WebGL mark (`hero/scene/geometry.ts`) |
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
   `globals.css` scale; green + white in the Home hero (the owner's latest
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
