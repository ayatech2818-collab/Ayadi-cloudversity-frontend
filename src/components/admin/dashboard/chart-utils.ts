import { ENQUIRY_TYPE_LABELS } from "@/components/admin/enquiries/enquiry-utils";

/**
 * Geometry for the enquiry chart. Positions are percentages of the plot, so
 * the same numbers place the SVG lines and the HTML laid over them (labels,
 * markers, tooltip) at any width.
 */

/** One line per website form, in a fixed order so each keeps its colour. */
export const SERIES = [
  {
    key: "enrollment",
    label: ENQUIRY_TYPE_LABELS.enrollment,
    color: "var(--series-1)",
  },
  {
    key: "contact",
    label: ENQUIRY_TYPE_LABELS.contact,
    color: "var(--series-2)",
  },
] as const;

/** The y-axis: round steps, at most four of them, topping out above `max`. */
export function axisScale(max: number): { top: number; ticks: number[] } {
  const rough = Math.max(max, 1) / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rough));

  // Counts are whole numbers, so the step never drops below one.
  const step = Math.max(
    1,
    [1, 2, 5, 10]
      .map((factor) => factor * magnitude)
      .find((candidate) => candidate >= rough) ?? rough
  );

  const top = Math.ceil(Math.max(max, 1) / step) * step;

  return {
    top,
    ticks: Array.from(
      { length: Math.round(top / step) + 1 },
      (_, index) => index * step
    ),
  };
}

/** Left edge to right edge, as a percentage. */
export const pointX = (index: number, count: number): number =>
  count > 1 ? (index / (count - 1)) * 100 : 50;

/** Measured from the top, as CSS and SVG both do. */
export const pointY = (value: number, top: number): number =>
  100 - (value / top) * 100;

/**
 * Heights for labels that sit beside points at `positions` (percentages from
 * the top). Each stays level with its point unless two would overlap; those
 * are eased apart to `gap`, keeping their order, and kept inside the plot.
 */
export function spreadLabels(positions: number[], gap: number): number[] {
  const order = positions
    .map((position, index) => ({ position, index }))
    .sort((a, b) => a.position - b.position);

  for (let i = 1; i < order.length; i++) {
    order[i].position = Math.max(
      order[i].position,
      order[i - 1].position + gap
    );
  }

  // Pushing down may have run off the bottom: slide the whole set back up.
  const overflow = Math.max(0, order[order.length - 1].position - 100);
  const spread = [...positions];

  for (const { position, index } of order) {
    spread[index] = position - overflow;
  }

  return spread;
}

const coordinate = (value: number): string =>
  String(Math.round(value * 100) / 100);

/** A straight-segment line through every value, in a 100 by 100 box. */
export const linePath = (values: number[], top: number): string =>
  values
    .map(
      (value, index) =>
        `${index === 0 ? "M" : "L"}${coordinate(pointX(index, values.length))} ${coordinate(pointY(value, top))}`
    )
    .join(" ");

/** The same line, closed down to the baseline. */
export const areaPath = (values: number[], top: number): string =>
  `${linePath(values, top)} L100 100 L0 100 Z`;

/** "8 Oct", or "Thu, 8 Oct 2026" in full. */
export const formatDay = (date: string, full = false): string =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString(
    "en-IN",
    full
      ? {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        }
      : { day: "numeric", month: "short", timeZone: "UTC" }
  );
