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

        {/* Mobile title */}
        <div >
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