import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * Root 404. With a single root layout, this file answers every URL that no
 * route matches (and any `notFound()` call without a closer not-found file).
 * It renders inside the root layout only, so it carries its own logo and
 * links instead of the website navbar.
 */
export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-page px-4 py-16 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[640px] -translate-x-1/2 -translate-y-1/2 bg-hero-ambient"
      />

      <Link href="/" aria-label="Ayadi Cloudversity home">
        <Image
          src="/images/ayadi-logo.png"
          alt="Ayadi Cloudversity"
          width={160}
          height={87}
          priority
        />
      </Link>

      <p className="mt-10 bg-brand-gradient bg-clip-text text-8xl font-extrabold leading-none tracking-tight text-transparent sm:text-9xl">
        404
      </p>

      <h1 className="mt-6 text-2xl font-bold text-text sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110"
        >
          Back to home
        </Link>
        <Link
          href="/courses"
          className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-semibold text-text transition hover:border-primary hover:text-primary"
        >
          Browse courses
        </Link>
      </div>
    </main>
  );
}
