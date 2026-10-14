
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
import {
  useCallback,
  useEffect,
  useState,
  type SVGProps,
} from 'react';
import {
  ArrowUpRight,
  House,
  Images,
  Phone,
  BookOpen,
  Newspaper,
  UserRound,
} from 'lucide-react';
import {
  LazyEnrollmentModal,
  preloadEnrollment,
} from '@/components/website/enrollment/LazyEnrollmentModal';

import { MoreHorizontal } from 'lucide-react';

/* ==================================================
   ICONS
================================================== */

function AboutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c.8-3.4 3-5.2 6.5-5.2s5.7 1.8 6.5 5.2" />
    </svg>
  );
}

function CoursesIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 5.5v15M8 7h8M8 11h7" />
    </svg>
  );
}

function BlogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      {...props}
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

function ArrowUpRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

/* ==================================================
   NAVIGATION
================================================== */

const navigation = [
  { href: '/', label: 'Home', Icon: House },
  { href: '/about', label: 'About', Icon: AboutIcon },
  { href: '/courses', label: 'Courses', Icon: CoursesIcon },
  { href: '/blog', label: 'Blog', Icon: BlogIcon },
  { href: '/media', label: 'Media', Icon: Images },
  { href: '/contact', label: 'Contact', Icon: Phone },
];

const COMPACT_ENTER = 96;
const COMPACT_EXIT = 40;

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';



const mobileMenuVariants: Variants = {
  closed: { opacity: 0, height: 0 },
  open: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.04,
    },
  },
};

const mobileItemVariants: Variants = {
  closed: { opacity: 0, y: -6 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
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

  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsCompact((wasCompact) =>
      wasCompact
        ? latest > COMPACT_EXIT
        : latest > COMPACT_ENTER,
    );
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

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const collapsible = isCompact
    ? 'max-w-0 opacity-0 group-hover:max-w-[180px] group-hover:opacity-100'
    : 'max-w-[180px] opacity-100';

  return (
    <>
      {/* TOP NAVBAR */}
      <motion.header
        initial={reduceMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 md:px-5 md:pt-4"
      >
        <nav
          aria-label="Primary navigation"
          className={`
            group relative mx-auto overflow-hidden rounded-2xl
            bg-white/75 ring-1 ring-inset ring-white/70
            backdrop-blur-xl supports-[backdrop-filter]:bg-white/65
            transition-[max-width,border-radius,box-shadow,background-color]
            duration-500 will-change-transform ${EASE}
            ${
              isCompact
                ? 'max-w-[1180px] shadow-[0_16px_50px_rgba(4,76,59,0.16)] md:max-w-[620px] md:rounded-full md:hover:max-w-[1180px]'
                : 'max-w-[1180px] shadow-[0_10px_40px_rgba(4,76,59,0.10)]'
            }
          `}
        >
          {/* Glass highlights */}
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
              relative flex items-center justify-between gap-2 px-3
              transition-[height] duration-500 ${EASE}
              sm:gap-4 sm:px-4 md:px-6
              ${
                isCompact
                  ? 'h-14 md:h-[58px] md:group-hover:h-[68px]'
                  : 'h-14 md:h-[72px]'
              }
            `}
          >
            {/* LOGO */}
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
                className={`
                  w-auto object-contain transition-[height] duration-500 ${EASE}
                  ${
                    isCompact
                      ? 'h-[30px] md:h-8 md:group-hover:h-11'
                      : 'h-8 sm:h-9 md:h-11'
                  }
                `}
              />
            </Link>

            {/* DESKTOP LINKS — unchanged layout */}
            <div className="hidden items-center gap-1 md:flex">
              {navigation
                .filter(({ href }) => href !== '/')
                .map(({ href, label, Icon }) => {
                  const isActive = pathname === href;

                  return (
                    <Link
                      key={href}
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      title={isCompact ? label : undefined}
                      className={`
                        group/nav relative flex items-center gap-2 rounded-full
                        px-3 py-2 text-sm font-semibold
                        transition-colors duration-300
                        focus-visible:outline-2 focus-visible:outline-offset-2
                        focus-visible:outline-primary
                        ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted hover:bg-primary/[0.07] hover:text-primary'
                        }
                      `}
                    >
                      <Icon
                        className={`
                          size-[18px] shrink-0 transition-colors
                          ${
                            isActive
                              ? 'text-primary'
                              : 'text-black group-hover/nav:text-primary'
                          }
                        `}
                      />
                      <span
                        className={`
                          overflow-hidden whitespace-nowrap
                          transition-[max-width,opacity] duration-500 ${EASE}
                          ${collapsible}
                        `}
                      >
                        {label}
                      </span>
                    </Link>
                  );
                })}
            </div>

            {/* ENROLL ACTION
                Desktop: same button.
                Mobile: replaces the hamburger. */}
            <button
              type="button"
              onPointerEnter={preloadEnrollment}
              onPointerDown={preloadEnrollment}
              onFocus={preloadEnrollment}
              onClick={() => {
                setIsEnrollOpen(true);
                closeMenu();
              }}
              className={`
                inline-flex shrink-0 cursor-pointer items-center justify-center
                gap-1.5 rounded-full bg-brand-gradient
                px-3 py-2 text-xs font-bold text-white
                shadow-md shadow-accent/30 transition-all duration-500 ${EASE}
                hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent/40
                focus-visible:outline-2 focus-visible:outline-offset-4
                focus-visible:outline-accent
                sm:gap-2 sm:px-4 sm:text-sm
                md:px-5 md:py-2.5
                ${isCompact ? 'md:px-4 md:py-2 md:text-[13px]' : ''}
              `}
            >
              <span className="whitespace-nowrap">Enroll Now</span>
              <ArrowUpRightIcon className="size-4 shrink-0" />
            </button>
          </div>

          {/* DESKTOP READING PROGRESS */}
          <motion.span
            aria-hidden="true"
            style={{ scaleX: progressScaleX }}
            className={`
              absolute inset-x-0 bottom-0 hidden h-0.5 origin-left
              bg-brand-gradient transition-opacity duration-500 md:block
              ${isCompact ? 'opacity-100' : 'opacity-0'}
            `}
          />
        </nav>
      </motion.header>

      

{/* MOBILE BOTTOM NAVIGATION */}
<nav
  aria-label="Mobile navigation"
  className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(8px,env(safe-area-inset-bottom))] md:hidden"
>

  {/* Simple More popup — test without animations */}

  {/* 1. Backdrop */}
  {/* More popup — animated, no backdrop */}
<AnimatePresence>
  {isMoreOpen && (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="
        absolute bottom-[calc(100%+14px)] right-4 z-[60]
        w-48 overflow-hidden rounded-[24px]
        border border-white/60
        bg-white/95 p-2
        shadow-[0_12px_40px_rgba(4,76,59,0.20)]
      "
    >
      {/* Reflective top edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-emerald-100 to-transparent"
      />

      {[
        { href: "/blog", label: "Blog", Icon: BlogIcon },
        { href: "/media", label: "Media", Icon: Images },
      ].map(({ href, label, Icon }) => {
        const active =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={() => setIsMoreOpen(false)}
            aria-current={active ? "page" : undefined}
            className={`
              flex items-center gap-3 rounded-2xl px-3 py-3
              text-sm font-semibold transition-colors
              ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-slate-700 hover:bg-primary/[0.07] hover:text-primary"
              }
            `}
          >
            <Icon className="size-[18px] shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </motion.div>
  )}
</AnimatePresence>
  {/* Mobile navigation — no More popup or Framer Motion */}
  <div
   className="
    relative mx-auto w-full max-w-[440px] overflow-hidden
    rounded-full border border-white/70
    bg-white/75 p-1.5
    backdrop-blur-xl supports-[backdrop-filter]:bg-white/65
    shadow-[0_10px_40px_rgba(4,76,59,0.16)]
  "
  >
    {/* Reflective top edge */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-5 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/95 to-transparent"
    />

    <div
      className="
        relative z-0 flex items-stretch gap-1
        overflow-x-auto overscroll-x-contain
        snap-x snap-mandatory
        touch-pan-x
        [scrollbar-width:none]
        [&::-webkit-scrollbar]:hidden
      "
    >
      {[
        { href: "/", label: "Home", Icon: House },
        { href: "/about", label: "About", Icon: AboutIcon },
        { href: "/courses", label: "Courses", Icon: CoursesIcon },
        { href: "/contact", label: "Contact", Icon: Phone },
      ].map(({ href, label, Icon }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={`
              relative flex min-w-[66px] shrink-0 snap-start
              flex-col items-center justify-center gap-1
              rounded-full px-2 py-2.5
              ${
                active
                  ? "bg-white/80 text-primary shadow-[0_2px_12px_rgba(4,76,59,0.10)] ring-1 ring-inset ring-emerald-100"
                  : "text-slate-600"
              }
            `}
          >
            {/* Static active indicator */}
            {active && (
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-0 rounded-full bg-gradient-to-b from-white/55 to-emerald-50/30"
              />
            )}

            <span className="relative z-10 flex flex-col items-center gap-1">
              <Icon
                className="size-[18px] shrink-0"
                aria-hidden="true"
              />
              <span className="max-w-full truncate text-[10px] font-semibold leading-tight">
                {label}
              </span>
            </span>
          </Link>
          
        );
      })}

  
      {/* More button */}
        <button
          type="button"
          aria-label="More navigation options"
          aria-expanded={isMoreOpen}
          onClick={() => setIsMoreOpen((open) => !open)}
          className={`
            relative flex min-w-[66px] shrink-0 snap-start
            flex-col items-center justify-center gap-1
            rounded-full px-2 py-2.5
            ${
              isMoreOpen ||
              pathname.startsWith("/blog") ||
              pathname.startsWith("/media")
                ? "bg-white/80 text-primary shadow-[0_2px_12px_rgba(4,76,59,0.10)] ring-1 ring-inset ring-emerald-100"
                : "text-slate-600"
            }
          `}
        >
          <motion.span
            animate={{ rotate: isMoreOpen ? 90 : 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 22,
            }}
            className="flex flex-col items-center gap-1"
          >
            <MoreHorizontal
              className="size-[18px]"
              aria-hidden="true"
            />
            <span className="text-[10px] font-semibold leading-tight">
              More
            </span>
          </motion.span>
        </button>
    </div>

    {/* Static edge shading */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-inset ring-white/20"
    />
  </div>
</nav>



      <LazyEnrollmentModal
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
      />
    </>
  );
}
