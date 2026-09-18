'use client';

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState, type SVGProps } from 'react';
import { Images } from 'lucide-react';
import { EnrollmentModal } from '@/components/website/enrollment/EnrollmentModal';

/* ==================================================
   ICONS
================================================== */

function AboutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c.8-3.4 3-5.2 6.5-5.2s5.7 1.8 6.5 5.2" />
    </svg>
  );
}

function CoursesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 5.5v15M8 7h8M8 11h7" />
    </svg>
  );
}

function BlogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" {...props}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function ArrowUpRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

const navigation = [
  { href: '/about', label: 'About', Icon: AboutIcon },
  { href: '/courses', label: 'Courses', Icon: CoursesIcon },
  { href: '/blog', label: 'Blog', Icon: BlogIcon },
  { href: '/media', label: 'media', Icon: Images },
];

/*
 * Two thresholds, not one. With a single value the bar flickers when you hover
 * around it: shrink at 96px, grow back only below 40px.
 */
const COMPACT_ENTER = 96;
const COMPACT_EXIT = 40;

/* The shared feel of every transition here — long and gentle. */
const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

const mobileMenuVariants: Variants = {
  closed: { opacity: 0, height: 0 },
  open: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.04 },
  },
};

const mobileItemVariants: Variants = {
  closed: { opacity: 0, y: -6 },
  open: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
};

/* ==================================================
   NAVBAR
================================================== */

export function Navbar() {
  const reduceMotion = useReducedMotion();
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);

  const { scrollY, scrollYProgress } = useScroll();

  // Reading progress, driven by a MotionValue — it never re-renders React.
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsCompact((wasCompact) => (wasCompact ? latest > COMPACT_EXIT : latest > COMPACT_ENTER));
  });

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  /*
   * Collapsing happens through max-width + opacity transitions rather than
   * animating width to `auto`. Nothing has to be measured per frame, and
   * hovering to re-expand is pure CSS — no state, no re-render.
   */
  const collapsible = isCompact
    ? `max-w-0 opacity-0 group-hover:max-w-[180px] group-hover:opacity-100`
    : 'max-w-[180px] opacity-100';

  return (
    <>
      <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-4 pt-3 md:px-5 md:pt-4"
    >
      <nav
        aria-label="Primary"
        className={`
          group
          relative
          mx-auto
          overflow-hidden
          rounded-2xl
          bg-white/75
          ring-1
          ring-inset
          ring-white/70
          backdrop-blur-xl
          transition-[max-width,border-radius,box-shadow,background-color]
          duration-500
          ${EASE}
          supports-[backdrop-filter]:bg-white/65
          ${
            /*
             * `hover:`, not `group-hover:` — this element *is* the group, and
             * `group-hover` compiles to a descendant selector (`.group:hover *`),
             * which never matches the group itself. Using it here left the pill
             * at its compact width while the labels inside expanded, clipping
             * the Enroll button.
             */
            isCompact
              ? 'max-w-[1180px] shadow-[0_16px_50px_rgba(4,76,59,0.16)] md:max-w-[620px] md:rounded-full md:hover:max-w-[1180px] md:hover:rounded-2xl'
              : 'max-w-[1180px] shadow-[0_10px_40px_rgba(4,76,59,0.10)]'
          }
        `}
      >
        {/* Glass highlights: a lit top edge and a soft brand glow */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_-20%,rgba(22,163,74,0.12),transparent_45%)]"
        />

        <div
          className={`
            relative
            flex
            items-center
            justify-between
            gap-4
            px-4
            transition-[height]
            duration-500
            ${EASE}
            md:px-6
            ${isCompact ? 'h-14 md:h-[58px] md:group-hover:h-[68px]' : 'h-14 md:h-[72px]'}
          `}
        >
          {/* ---------- LOGO ---------- */}
          <Link
            href="/"
            onClick={closeMenu}
            aria-label="Ayadi Cloudversity — home"
            className="flex shrink-0 items-center rounded-lg py-1 transition-opacity duration-300 hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Image
              src="/images/ayadi-logo.png"
              alt="Ayadi Cloudversity"
              width={160}
              height={87}
              priority
              className={`w-auto object-contain transition-[height] duration-500 ${EASE} ${
                isCompact ? 'h-[30px] md:h-8 md:group-hover:h-11' : 'h-9 md:h-11'
              }`}
            />
          </Link>

          {/* ---------- DESKTOP LINKS ---------- */}
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map(({ href, label, Icon }) => {
              const isActive = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCompact ? label : undefined}
                  className={`
                    group/nav
                    relative
                    flex
                    items-center
                    gap-2
                    rounded-full
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    transition-colors
                    duration-300
                    focus-visible:outline-2
                    focus-visible:outline-offset-2
                    focus-visible:outline-primary
                    ${isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-primary/[0.07] hover:text-primary'}
                  `}
                >
                  <Icon
                    className={`size-[18px] shrink-0 transition-colors ${
                      isActive ? 'text-primary' : 'text-black group-hover/nav:text-primary'
                    }`}
                  />

                  <span
                    className={`overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-500 ${EASE} ${collapsible}`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* ---------- ACTIONS ---------- */}
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEnrollOpen(true);
                closeMenu();
              }}
              className={`
                hidden
                items-center
                gap-2
                rounded-full
                bg-brand-gradient
                font-bold
                text-white
                shadow-md
                shadow-accent/30
                transition-all
                duration-500
                ${EASE}
                hover:-translate-y-0.5
                hover:shadow-lg
                hover:shadow-accent/40
                focus-visible:outline-2
                focus-visible:outline-offset-4
                focus-visible:outline-accent
                cursor-pointer
                md:inline-flex
                ${isCompact ? 'px-4 py-2 text-[13px]' : 'px-5 py-2.5 text-sm'}
              `}
            >
              Enroll Now
              <ArrowUpRight className="size-4" />
            </button>

            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setIsMenuOpen((open) => !open)}
              className="
                inline-flex
                size-10
                items-center
                justify-center
                rounded-full
                bg-primary/[0.08]
                text-primary
                transition-colors
                duration-300
                hover:bg-primary/15
                focus-visible:outline-2
                focus-visible:outline-offset-2
                focus-visible:outline-primary
                md:hidden
              "
            >
              <MenuIcon open={isMenuOpen} />
            </button>
          </div>
        </div>

        {/* ---------- READING PROGRESS ---------- */}
        <motion.span
          aria-hidden="true"
          style={{ scaleX: progressScaleX }}
          className={`absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-gradient transition-opacity duration-500 ${
            isCompact ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* ---------- MOBILE MENU ---------- */}
        <AnimatePresence initial={false}>
          {isMenuOpen && (
            <motion.div
              id="mobile-navigation"
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileMenuVariants}
              className="overflow-hidden md:hidden"
            >
              <span aria-hidden="true" className="mx-4 block h-px bg-primary/10" />

              <div className="px-3 pb-3 pt-2">
                {navigation.map(({ href, label, Icon }) => {
                  const isActive = pathname === href;

                  return (
                    <motion.div key={href} variants={mobileItemVariants}>
                      <Link
                        href={href}
                        onClick={closeMenu}
                        aria-current={isActive ? 'page' : undefined}
                        className={`
                          group/mobile-nav
                          flex
                          items-center
                          gap-3
                          rounded-xl
                          px-3
                          py-3
                          text-sm
                          font-semibold
                          transition-colors
                          duration-300
                          ${isActive ? 'bg-primary/10 text-primary' : 'text-muted hover:bg-primary/[0.07] hover:text-primary'}
                        `}
                      >
                        <Icon
                          className={`size-[18px] transition-colors ${
                            isActive ? 'text-primary' : 'text-black group-hover/mobile-nav:text-primary'
                          }`}
                        />
                        {label}
                      </Link>
                    </motion.div>
                  );
                })}

                <motion.div variants={mobileItemVariants}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEnrollOpen(true);
                      closeMenu();
                    }}
                    className="
                      mt-2
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-accent-gradient
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-white
                      shadow-md
                      shadow-accent/30
                      cursor-pointer
                    "
                  >
                    Enroll Now
                    <ArrowUpRight className="size-4" />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      </motion.header>
      <EnrollmentModal isOpen={isEnrollOpen} onClose={() => setIsEnrollOpen(false)} />
    </>
  );
}

/* ==================================================
   MENU ICON
================================================== */

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block size-5">
      <motion.span
        animate={{ rotate: open ? 45 : 0, y: open ? 7 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current"
      />
      <motion.span
        animate={{ opacity: open ? 0 : 1, x: open ? -6 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-current"
      />
      <motion.span
        animate={{ rotate: open ? -45 : 0, y: open ? -7 : 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 block h-0.5 w-5 rounded-full bg-current"
      />
    </span>
  );
}
