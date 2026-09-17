import { Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode, SVGProps } from 'react';

/* ==================================================
   SOCIAL ICONS
================================================== */

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/ayadicloudversity', icon: InstagramIcon },
  { name: 'YouTube', href: 'https://youtube.com/@ayadicloudversity', icon: YouTubeIcon },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/ayadicloudversity', icon: LinkedInIcon },
];

const exploreLinks = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Courses', href: '/courses' },
  { label: 'Events', href: '/events' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact Us', href: '/contact' },
];

const categoryLinks = [
  { label: 'Academic & Learning Pathways', href: '/courses?category=academic' },
  { label: 'Life & Creative Skills', href: '/courses?category=creative' },
  { label: 'Workspace Readiness & PD', href: '/courses?category=readiness' },
];

/* ==================================================
   FOOTER

   A server component — no hooks, no client JS. The animated call to action
   that used to live here is now `GetStartedCta`, rendered by the page above
   this footer. `pt` below reserves room for that card's overlap.
================================================== */

export default function Footer() {
  return (
    <footer
      aria-labelledby="footer-heading"
      className="
        relative
        overflow-hidden
        bg-linear-to-b
        from-[#052a22]
        via-[#04231c]
        to-[#031813]
        pt-40
        sm:pt-44
        lg:pt-56
      "
    >
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>

      {/* ---------- DECOR ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] bg-size-[28px_28px] [mask-image:radial-gradient(ellipse_at_50%_20%,black_5%,transparent_60%)]" />
        <div className="absolute -right-40 top-10 size-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-40 bottom-0 size-[420px] rounded-full bg-lime-300/[0.07] blur-3xl" />
      </div>

      <div className="relative px-6 pb-10 md:px-12 lg:px-16 mt-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_1fr_1.1fr] lg:gap-16">
            {/* ---------- BRAND ---------- */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link
                href="/"
                aria-label="Ayadi Cloudversity — home"
                className="inline-block rounded-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime-300"
              >
                <Image
                  src="/images/ayadi-logo-white.png"
                  alt="Ayadi Cloudversity"
                  width={200}
                  height={109}
                  className="h-12 w-auto object-contain sm:h-14"
                />
              </Link>

              <p className="mt-6 max-w-[330px] text-sm leading-relaxed text-emerald-50/65">
                We are passionate educators committed to delivering high-quality learning, workspace readiness, and
                lifelong growth for all.
              </p>

              <div className="mt-8 flex items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ayadi Cloudversity on ${social.name}`}
                      className="
                        flex
                        size-10
                        items-center
                        justify-center
                        rounded-full
                        bg-white/[0.07]
                        text-emerald-50
                        ring-1
                        ring-inset
                        ring-white/15
                        transition-all
                        duration-300
                        hover:-translate-y-0.5
                        hover:bg-lime-300
                        hover:text-emerald-950
                        hover:ring-lime-300
                        focus-visible:outline-2
                        focus-visible:outline-offset-4
                        focus-visible:outline-lime-300
                      "
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* ---------- EXPLORE ---------- */}
            <nav aria-labelledby="footer-explore">
              <FooterHeading id="footer-explore">Explore</FooterHeading>

              <ul className="mt-6 space-y-3.5">
                {exploreLinks.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </nav>

            {/* ---------- CATEGORIES ---------- */}
            <nav aria-labelledby="footer-categories">
              <FooterHeading id="footer-categories">Course Categories</FooterHeading>

              <ul className="mt-6 space-y-3.5">
                {categoryLinks.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </ul>
            </nav>

            {/* ---------- CONTACT ---------- */}
            <div>
              <FooterHeading id="footer-contact">Contact</FooterHeading>

              <address className="mt-6 space-y-4 not-italic">
                <ContactItem icon={MapPin}>Orbits Complex, Jafarkhan Colony Road, Calicut, Kerala, India</ContactItem>
                <ContactItem icon={MapPin}>Ayadi, Shams Free Zone, Sharjah Media City, Sharjah, UAE</ContactItem>
                <ContactItem icon={Phone} href="tel:+919400000000">
                  +91 94000 00000
                </ContactItem>
                <ContactItem icon={Mail} href="mailto:hello@ayadi.cloud">
                  hello@ayadi.cloud
                </ContactItem>
              </address>
            </div>
          </div>

          {/* ---------- BOTTOM BAR ---------- */}
          <div aria-hidden="true" className="mt-14 h-px bg-linear-to-r from-transparent via-white/15 to-transparent" />

          <div className="mt-6 flex flex-col gap-4 text-xs text-emerald-50/55 md:flex-row md:items-center md:justify-between">
            <p>© {new Date().getFullYear()} Ayadi Cloudversity. All rights reserved.</p>

            <div className="flex flex-wrap gap-6">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ==================================================
   PIECES
================================================== */

function FooterHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="text-[11px] font-bold uppercase tracking-[0.2em] text-lime-300">
      {children}
    </h3>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="
          inline-block
          text-sm
          text-emerald-50/70
          transition-all
          duration-200
          hover:translate-x-1
          hover:text-white
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-lime-300
        "
      >
        {children}
      </Link>
    </li>
  );
}

function ContactItem({ icon: Icon, href, children }: { icon: LucideIcon; href?: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon aria-hidden="true" size={17} strokeWidth={1.75} className="mt-0.5 shrink-0 text-lime-300" />

      {href ? (
        <a
          href={href}
          className="
            max-w-[300px]
            text-sm
            leading-5
            text-emerald-50/70
            transition-colors
            hover:text-white
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-lime-300
          "
        >
          {children}
        </a>
      ) : (
        <p className="max-w-[300px] text-sm leading-5 text-emerald-50/70">{children}</p>
      )}
    </div>
  );
}
