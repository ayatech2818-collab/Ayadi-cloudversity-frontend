"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookPlus,
  ImagePlus,
  Inbox,
  PenLine,
  type LucideIcon,
} from "lucide-react";

import { CARD, CARD_LIFT, INK } from "./styles";

/**
 * Each opens the page where its job is done. Opening that page's form
 * directly is for later; `href` is the one thing to change.
 */
const ACTIONS: {
  label: string;
  hint: string;
  href: string;
  icon: LucideIcon;
}[] = [
  {
    label: "Add Course",
    hint: "New programme",
    href: "/admin/courses",
    icon: BookPlus,
  },
  {
    label: "Create Blog",
    hint: "New article",
    href: "/admin/blogs",
    icon: PenLine,
  },
  {
    label: "Upload Media",
    hint: "Images and videos",
    href: "/admin/galleries",
    icon: ImagePlus,
  },
  {
    label: "View Enquiries",
    hint: "Open the inbox",
    href: "/admin/enquiries",
    icon: Inbox,
  },
];

/** Shortcuts to the four everyday jobs. Tiles on the page, not a card of them. */
export default function QuickActions() {
  return (
    <section aria-labelledby="quick-actions-title">
      <h2
        id="quick-actions-title"
        className={`px-1 text-base font-bold tracking-[-0.01em] ${INK}`}
      >
        Quick Actions
      </h2>

      <ul className="mt-3 grid grid-cols-2 gap-3">
        {ACTIONS.map(({ label, hint, href, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className={`group flex h-full flex-col gap-3 p-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${CARD} ${CARD_LIFT}`}
            >
              <span className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={19} />
                </span>

                <ArrowUpRight
                  size={15}
                  className="text-muted/60 transition-[translate,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </span>

              <span>
                <span className="block text-sm font-semibold text-text">
                  {label}
                </span>

                <span className="mt-0.5 block text-[11px] text-muted">
                  {hint}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
