"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Images,
  Settings,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";

import { logout } from "@/lib/api/auth";

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navigation = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    label: "Media",
    href: "/admin/media",
    icon: Images,
  },
];

export default function AdminSidebar({
  open,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-[270px]
          flex-col bg-[#0b4635] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-7">
          <Link href="/admin">
            <img
              src="/images/ayadi-logo-white.png"
              alt="Ayadi Cloudversity"
              className="w-36"
            />
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Workspace
          </p>

          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group flex items-center justify-between rounded-xl px-3.5 py-3 text-sm transition-all ${
                    active
                      ? "bg-white/10 font-medium text-white"
                      : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={19} strokeWidth={1.8} />

                    {item.label}
                  </span>

                  {item.label === "Courses" && (
                    <ChevronRight
                      size={15}
                      className="text-white/30 transition-transform group-hover:translate-x-0.5"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom navigation */}
        <div className="border-t border-white/10 p-4">
          <Link
            href="/admin/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-white/60 transition-all hover:bg-white/[0.07] hover:text-white"
          >
            <Settings size={19} strokeWidth={1.8} />
            Settings
          </Link>

          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-white/60 transition-all hover:bg-white/[0.07] hover:text-white"
          >
            <LogOut size={19} strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}