"use client";

import { Menu, ChevronDown } from "lucide-react";

import ThemeToggle from "./theme/ThemeToggle";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-[82px] items-center justify-between border-b border-black/[0.06] bg-white/85 px-3 min-[360px]:px-4 sm:px-6 lg:px-8 backdrop-blur-xl dark:bg-surface/85">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg sm:rounded-xl border border-black/[0.06] bg-white p-1.5 sm:p-2.5 text-gray-600 shadow-sm lg:hidden dark:bg-page dark:text-muted"
        >
          <Menu className="size-4 sm:size-[21px]" />
        </button>

        {/* Mobile title */}
        <div>
          <p className="text-xs min-[360px]:text-sm sm:text-sm font-semibold leading-tight text-[#10251d] dark:text-text">
            Ayadi Cloudversity
          </p>

          <p className="text-[10px] sm:text-[11px] leading-tight text-gray-400 dark:text-muted">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 sm:gap-4">
        <ThemeToggle />

        <div className="h-5 sm:h-7 w-px bg-gray-200 dark:bg-border" />

        <button
          type="button"
          className="flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl p-1 sm:p-1.5 sm:pr-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/5"
        >
          <div className="flex h-7 w-7 min-[360px]:h-8 min-[360px]:w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-[#dcefe6] text-xs sm:text-sm font-semibold text-[#0b4635] dark:bg-primary/15 dark:text-primary">
            A
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-[#10251d] dark:text-text">
              Ayadi Admin
            </p>

            <p className="text-[10px] text-gray-400 dark:text-muted">
              Administrator
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-gray-400 sm:block dark:text-muted"
          />
        </button>
      </div>
    </header>
  );
}
