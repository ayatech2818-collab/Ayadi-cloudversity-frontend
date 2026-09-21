import { hasPublicAsset } from "@/lib/public-asset";

import { AyadiUniverse } from "@/components/website/sections/ayadi-universe/AyadiUniverse";
import { PHOTOS, type PhotoAvailability, type PhotoId } from "@/components/website/sections/hero-ecosystem/photos";

/*
 * The Home hero is the Ayadi Universe story: the logo, the globe, the two
 * worlds and their chapters. It carries the page's h1. See
 * ayadi-universe/AyadiUniverse.tsx.
 *
 * This server half only checks which of the Cloudversity photographs exist in
 * /public yet, so the scene shows a placeholder instead of requesting a file
 * that is not there.
 */
export function Hero() {
  const photos = Object.fromEntries(
    (Object.keys(PHOTOS) as PhotoId[]).map((id) => [id, hasPublicAsset(PHOTOS[id].src)]),
  ) as PhotoAvailability;

  return (
    <main className="relative isolate bg-page">
      <AyadiUniverse photos={photos} />
    </main>
  );
}
