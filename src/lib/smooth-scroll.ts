import type Lenis from 'lenis';

/*
 * The page's one scroll driver, where there is one (components/website/
 * layout/SmoothScroll.tsx), for the few places that move the page themselves.
 *
 * While the driver is carrying the page on after a flick, it is the driver
 * that knows where the page is going: a bare window.scrollTo() in the middle
 * of that is overwritten on the next frame. So a jump goes through here.
 */
let driver: Lenis | null = null;

/** SmoothScroll's, as its instance comes and goes. */
export function bindScroll(instance: Lenis | null) {
  driver = instance;
}

/** Puts the page at `top`, at once. */
export function jumpTo(top: number) {
  if (driver) driver.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo({ top, behavior: 'instant' });
}

/** Lets go of whatever the driver was still carrying the page toward — for
    just before the browser is asked to scroll it somewhere itself
    (scrollIntoView and the like), which the driver then simply follows. */
export function releaseScroll() {
  /* A jump to where the page already is: the driver's own way of standing still. */
  driver?.scrollTo(driver.actualScroll, { immediate: true, force: true });
}
