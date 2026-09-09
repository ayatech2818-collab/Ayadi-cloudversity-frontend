"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const navigation = [
  { href: "/about", label: "About" },
  { href: "/courses", label: "Courses" },
  { href: "/blog", label: "Blog" },
];

const mobileMenuVariants: Variants = {
  closed: { opacity: 0, y: -8 },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: "easeOut", staggerChildren: 0.05 },
  },
};

const mobileItemVariants: Variants = {
  closed: { opacity: 0, y: -6 },
  open: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
};

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const closeMenu = () => setIsMenuOpen(false);
  return (
    <motion.header
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="border-b border-border/90 bg-surface/95 shadow-sm backdrop-blur"
    >
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10"
      >
        <Link
          href="/"
          onClick={closeMenu}
          className="shrink-0 rounded-sm text-xl font-bold tracking-[-0.035em] text-text transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:text-[1.35rem]"
        >
          Ayadi{" "}
          <span className="bg-brand-gradient bg-clip-text text-transparent">
            Cloudversity
          </span>
        </Link>

        <div className="hidden items-center gap-10 md:flex">
          {navigation.map((item) => (
            <motion.div key={item.href} initial="rest" whileHover="hover" animate="rest">
              <Link
                href={item.href}
                className="relative block rounded-sm px-0.5 py-2 text-[0.9375rem] font-semibold text-muted transition-colors duration-200 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                {item.label}
                <motion.span
                  aria-hidden="true"
                  variants={{ rest: { scaleX: 0 }, hover: { scaleX: 1 } }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left rounded-full bg-primary"
                />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          whileHover={reduceMotion ? undefined : { y: -2, scale: 1.015 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="hidden md:block"
        >
         <Link
            href="/enroll"
            className="
              inline-flex items-center justify-center
              rounded-lg
              bg-brand-gradient
              px-5 py-2.5
              text-sm font-bold text-white
              shadow-md shadow-primary/20
              transition-all duration-300 ease-out
              hover:-translate-y-0.5
              hover:shadow-lg hover:shadow-primary/30
              active:translate-y-0
              focus-visible:outline-2
              focus-visible:outline-offset-4
              focus-visible:outline-primary
            "
          >
            Enroll Now
          </Link>
        </motion.div>

        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          className="inline-flex size-11 items-center justify-center rounded-lg text-text transition-colors hover:bg-page focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:hidden"
        >
          <span className="sr-only">Menu</span>
          <span aria-hidden="true" className="relative block size-5">
            <motion.span
              animate={{ rotate: isMenuOpen ? 45 : 0, y: isMenuOpen ? 7 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute left-0 top-0 block h-0.5 w-5 rounded-full bg-current"
            />
            <motion.span
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 top-[7px] block h-0.5 w-5 rounded-full bg-current"
            />
            <motion.span
              animate={{ rotate: isMenuOpen ? -45 : 0, y: isMenuOpen ? -7 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="absolute bottom-0 left-0 block h-0.5 w-5 rounded-full bg-current"
            />
          </span>
        </button>
      </nav>

      <AnimatePresence initial={false}>
        {isMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={reduceMotion ? false : "closed"}
            animate="open"
            exit={reduceMotion ? { opacity: 0 } : "closed"}
            variants={mobileMenuVariants}
            className="overflow-hidden border-t border-border bg-surface md:hidden"
          >
            <motion.div
              variants={{ open: { transition: { staggerChildren: 0.05 } } }}
              className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4 sm:px-8"
            >
              {navigation.map((item) => (
                <motion.div key={item.href} variants={mobileItemVariants}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="block rounded-lg px-3 py-3 text-[0.9375rem] font-semibold text-muted transition-colors hover:bg-page hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={mobileItemVariants}>
                <Link
                  href="/enroll"
                  onClick={closeMenu}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-brand-gradient px-5 py-3 text-sm font-bold text-white shadow-md transition-shadow hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Enroll Now
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
