"use client";

import {
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export default function AdminHeader({
  onMenuClick,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[82px] items-center justify-between border-b border-black/[0.06] bg-white/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl border border-black/[0.06] bg-white p-2.5 text-gray-600 shadow-sm lg:hidden"
        >
          <Menu size={21} />
        </button>

        {/* Search */}
        <div className="relative hidden w-[300px] md:block">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            placeholder="Search..."
            className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-400 focus:border-[#368364] focus:bg-white focus:ring-4 focus:ring-[#368364]/10"
          />
        </div>

        {/* Mobile title */}
        <div className="md:hidden">
          <p className="text-sm font-semibold text-[#10251d]">
            Ayadi Cloudversity
          </p>

          <p className="text-[11px] text-gray-400">
            Admin Portal
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-[#0b4635]">
          <Bell size={19} strokeWidth={1.8} />

          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#368364]" />
        </button>

        <div className="h-7 w-px bg-gray-200" />

        <button className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition-colors hover:bg-gray-50">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dcefe6] text-sm font-semibold text-[#0b4635]">
            A
          </div>

          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-[#10251d]">
              Ayadi Admin
            </p>

            <p className="text-[10px] text-gray-400">
              Administrator
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-gray-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}