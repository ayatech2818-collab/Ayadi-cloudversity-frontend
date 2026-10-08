/**
 * Class strings shared by the dashboard's sections. Everything is built on the
 * admin colour tokens, so both themes come from globals.css.
 */

/** The dashboard's surface: white on the light page, a step above the navy one. */
export const CARD =
  "rounded-2xl bg-surface shadow-[0_2px_8px_rgba(15,23,42,0.04)] ring-1 ring-border";

/** For a card that is itself a target: a small lift and the brand's green glow. */
export const CARD_LIFT =
  "transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_48px_-24px_rgba(5,150,105,0.45)]";

/** Headings and figures: navy on light, white on dark. */
export const INK = "text-accent dark:text-white";

/** Stands in for a figure or a line of text that has not arrived yet. */
export const PULSE = "animate-pulse rounded-md bg-border/60";

/**
 * The two chart colours, set once on the page and read as `var(--series-1)`
 * and `var(--series-2)`. Each theme has its own pair: both were checked
 * against that theme's card colour for contrast and for telling the two apart
 * with a colour-vision deficiency, which the brand tokens were not chosen for.
 */
export const CHART_COLORS =
  "[--series-1:#059669] [--series-2:#4762c9] dark:[--series-1:#12ad7c] dark:[--series-2:#7088f0]";
