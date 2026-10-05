/**
 * Shared class strings for the admin dashboard.
 *
 * Fills come from the brand gradients in globals.css (`bg-brand-gradient`,
 * `bg-accent-gradient`) rather than a flat hex. Outlines are rings: the global
 * `* { border-color }` rule in globals.css overrides border-colour utilities.
 */

const BUTTON_BASE =
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition-[translate,box-shadow,background-color,filter] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const BUTTON_TONES = {
  /** Brand gradient — the one main action on a surface. */
  primary:
    "bg-brand-gradient text-white shadow-lg shadow-brand-start/30 focus-visible:outline-primary enabled:hover:-translate-y-0.5 enabled:hover:shadow-xl enabled:hover:shadow-brand-start/40 enabled:hover:brightness-105 enabled:active:translate-y-0",
  secondary:
    "bg-surface text-text ring-1 ring-inset ring-border focus-visible:outline-primary enabled:hover:bg-page enabled:hover:ring-primary/40",
  danger:
    "bg-rose-600 text-white shadow-lg shadow-rose-600/25 focus-visible:outline-rose-600 enabled:hover:bg-rose-700",
  /** For buttons that sit on the navy accent gradient. */
  glass:
    "bg-white/10 text-white ring-1 ring-inset ring-white/20 focus-visible:outline-white enabled:hover:bg-white/20",
} as const;

const BUTTON_SIZES = {
  sm: "h-9 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  /** Lines up with an `h-11` input beside it. */
  lg: "h-11 px-4 text-sm",
} as const;

export const buttonClass = (
  tone: keyof typeof BUTTON_TONES = "primary",
  size: keyof typeof BUTTON_SIZES = "md"
): string =>
  `${BUTTON_BASE} ${BUTTON_TONES[tone]} ${BUTTON_SIZES[size]}`;

/**
 * Square icon-only button. `danger` turns rose on hover, for deletes;
 * `small` is for tight spots such as a media tile.
 */
export const iconButtonClass = (
  danger = false,
  small = false
): string =>
  `flex shrink-0 cursor-pointer items-center justify-center text-muted ring-1 ring-inset ring-border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${
    small ? "h-7 w-7 rounded-lg" : "h-9 w-9 rounded-xl"
  } ${
    danger
      ? "enabled:hover:bg-rose-50 enabled:hover:text-rose-600 enabled:hover:ring-rose-200 focus-visible:outline-rose-600"
      : "enabled:hover:bg-page enabled:hover:text-primary enabled:hover:ring-primary/40 focus-visible:outline-primary"
  }`;

const INPUT_BASE =
  "w-full rounded-xl bg-surface px-3.5 text-sm text-text outline-none ring-1 ring-inset transition-shadow placeholder:text-muted/60 focus:ring-2 focus:shadow-[0_0_0_4px] disabled:cursor-not-allowed disabled:bg-page disabled:text-muted";

/** Height is the caller's: `h-11` for inputs, `py-3` for textareas. */
export const inputClass = (invalid = false): string =>
  `${INPUT_BASE} ${
    invalid
      ? "ring-rose-400 focus:ring-rose-500 focus:shadow-rose-500/15"
      : "ring-border focus:ring-primary focus:shadow-primary/15"
  }`;

/**
 * The same outline for a wrapper that holds an input plus something else
 * (a prefix, chips). Not inset — a child's background would paint over it.
 */
export const inputGroupClass = (invalid = false): string =>
  `rounded-xl bg-surface ring-1 transition-shadow focus-within:ring-2 focus-within:shadow-[0_0_0_4px] ${
    invalid
      ? "ring-rose-400 focus-within:ring-rose-500 focus-within:shadow-rose-500/15"
      : "ring-border focus-within:ring-primary focus-within:shadow-primary/15"
  }`;
