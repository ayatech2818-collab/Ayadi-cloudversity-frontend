/*
 * The Ayadi mark, extruded.
 *
 * There is no vector of the logo in the repo — `ayadi-logo-white.svg` is a
 * hand-written approximation, not the real thing — so `ayadi-mark.png` was cut
 * out of `ayadi-logo.png` by colour: every pixel of brand green kept, the
 * wordmark dropped. Replace it with a proper export the moment the designer
 * sends one.
 *
 * The depth is the same artwork stacked backwards on the z axis and darkened a
 * step at a time. Under the perspective on the wrapper the stack converges, so
 * the rim that shows on the rotated side reads as a genuine extruded face
 * rather than a drop shadow. No WebGL, no new dependency, and it composites as
 * a handful of static layers — the only thing that moves is the transform on
 * their shared parent.
 *
 * Three nested transform owners, so no two timelines ever write one property:
 * [data-mark-travel] carries it between acts, [data-mark] the entrance, and
 * [data-mark-spin] every rotation once it has arrived.
 */
const LAYERS = 9;

/** px of translateZ per layer. LAYERS * STEP is the mark's total thickness. */
const STEP = 3;

const ART = 'bg-[url(/images/ayadi-mark.png)] bg-contain bg-center bg-no-repeat';

export function AyadiMark3D() {
  return (
    /* Decorative: the headline beside it already says the name. */
    <div
      data-mark-travel
      aria-hidden="true"
      className="relative mx-auto w-full max-w-[290px] [perspective:1100px]"
    >
      <div data-mark className="[transform-style:preserve-3d]">
        {/* Separate from [data-mark] so the entrance and the scroll rotation
            never write the same property on one element. */}
        <div data-mark-spin className="relative aspect-[599/712] [transform-style:preserve-3d]">
          {Array.from({ length: LAYERS }, (_, index) => (
            <span
              key={index}
              className={`absolute inset-0 ${ART}`}
              style={{
                transform: `translateZ(-${(index + 1) * STEP}px)`,
                filter: `brightness(${(0.74 - index * 0.035).toFixed(3)})`,
              }}
            />
          ))}

          {/* The lit face */}
          <span className={`absolute inset-0 ${ART}`} />

          {/* Specular sweep. The mask holds still on the artwork while the
              gradient inside it travels, so the highlight reads as light
              moving across a surface rather than the surface moving.
              Tailwind emits the -webkit- mask properties itself. */}
          <span className="absolute inset-0 overflow-hidden [mask-image:url(/images/ayadi-mark.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]">
            <span
              data-mark-sheen
              className="absolute inset-y-0 -left-full w-full bg-linear-to-r from-transparent via-white/70 to-transparent"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
