import { AyadiHero } from "@/components/website/sections/hero/AyadiHero";

/*
 * The Home hero: a scroll-driven WebGL journey from the Ayadi mark, through a
 * globe and a liquid-glass portal, to "Choose your world" — and, for whoever
 * chooses Ayadi Cloudversity, on into that world's own three-act journey,
 * which continues here rather than on another page. It carries the page's h1.
 * See hero/AyadiHero.tsx.
 */
export function Hero() {
  return (
    <main className="relative isolate bg-page">
      <AyadiHero />
    </main>
  );
}
