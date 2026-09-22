import { AyadiHero } from "@/components/website/sections/hero/AyadiHero";

/*
 * The Home hero: a scroll-driven WebGL journey from the Ayadi mark, through a
 * globe and a liquid-glass portal, to "Choose your world". It carries the
 * page's h1. See hero/AyadiHero.tsx.
 */
export function Hero() {
  return (
    <main className="relative isolate bg-page">
      <AyadiHero />
    </main>
  );
}
