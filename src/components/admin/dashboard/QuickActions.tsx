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
        className={`px-1 text-sm font-bold tracking-[-0.01em] min-[360px]:text-base ${INK}`}
      >
        Quick Actions
      </h2>

      <ul className="mt-2 grid grid-cols-2 gap-2 min-[360px]:mt-3 min-[360px]:gap-2.5 sm:gap-3">
        {ACTIONS.map(({ label, hint, href, icon: Icon }) => (
          <li key={label}>
            <Link
              href={href}
              className={`group flex h-full flex-col gap-2 p-2.5 min-[360px]:gap-2.5 min-[360px]:p-3 sm:gap-3 sm:p-3.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${CARD} ${CARD_LIFT}`}
            >
              <span className="flex items-start justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary min-[360px]:h-9 min-[360px]:w-9 min-[360px]:rounded-xl sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 min-[360px]:h-[18px] min-[360px]:w-[18px] sm:h-[19px] sm:w-[19px]" />
                </span>

                <ArrowUpRight className="h-3.5 w-3.5 text-muted/60 transition-[translate,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary min-[360px]:h-[15px] min-[360px]:w-[15px]" />
              </span>

              <span>
                <span className="block truncate text-xs font-semibold text-text min-[360px]:text-sm">
                  {label}
                </span>

                <span className="mt-0.5 block truncate text-[10px] text-muted min-[360px]:text-[11px]">
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
