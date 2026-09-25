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
  Pin,
  PinOff,
} from "lucide-react";
import { motion } from "framer-motion";

import { logout } from "@/lib/api/auth";

interface AdminSidebarProps {
  open: boolean;
  pinned: boolean;
  expanded: boolean;
  onClose: () => void;
  onTogglePin: () => void;
  onHoverChange: (hovered: boolean) => void;
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
  pinned,
  expanded,
  onClose,
  onTogglePin,
  onHoverChange,
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
      {/* ================================================= */}
      {/* MOBILE OVERLAY */}
      {/* ================================================= */}

      {open && (
        <div
          onClick={onClose}
          className="
            fixed inset-0 z-40
            bg-black/30
            backdrop-blur-sm
            lg:hidden
          "
        />
      )}

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <motion.aside
        initial={false}
        animate={{
          width: expanded ? 270 : 78,
        }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        onMouseEnter={() => onHoverChange(true)}
        onMouseLeave={() => {
          if (!pinned) {
            onHoverChange(false);
          }
        }}
        className={`
          fixed inset-y-0 left-0 z-50
          flex flex-col
          overflow-hidden
          bg-accent-gradient
          text-white
          shadow-[10px_0_40px_rgba(0,0,0,0.06)]
          lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ================================================= */}
        {/* TOP / LOGO */}
        {/* ================================================= */}

        <div className="relative flex h-[82px] shrink-0 items-center  border-b border-white/10">
          {/* Logo */}
          <div
            className={`
              flex w-full items-center
              transition-all duration-300
              ${
                expanded
                  ? "justify-start px-7 pb-3"
                  : "justify-center"
              }
            `}
          >
            <Link
              href="/admin"
              onClick={onClose}
              className="relative flex shrink-0 items-center"
            >
              {/* Full logo */}
              <motion.img
                initial={false}
                animate={{
                  opacity: expanded ? 1 : 0,
                  scale: expanded ? 1 : 0.8,
                }}
                transition={{ duration: 0.2 }}
                src="/images/ayadi-logo-white.png"
                alt="Ayadi Cloudversity"
                className={`
                  w-36 object-contain
                  ${
                    expanded
                      ? "pointer-events-auto"
                      : "pointer-events-none absolute"
                  }
                `}
              />

              {/* Collapsed logo */}
              <motion.div
                initial={false}
                animate={{
                  opacity: expanded ? 0 : 1,
                  scale: expanded ? 0.8 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`
                  flex h-9 w-9
                  items-center justify-center
                  ${
                    expanded
                      ? "pointer-events-none absolute"
                      : ""
                  }
                `}
              >
                <img
                  src="/images/ayadi-mark.png"
                  alt="Ayadi"
                  className="h-8 w-auto object-contain"
                />
              </motion.div>
            </Link>
          </div>

          {/* Pin button */}
          {expanded && (
            <button
              type="button"
              onClick={onTogglePin}
              title={
                pinned
                  ? "Unpin sidebar"
                  : "Keep sidebar expanded"
              }
              className={`
                absolute top-1/2 right-3
                hidden -translate-y-1/2
                rounded-lg p-2
                transition-all
                lg:block
                ${
                  pinned
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              {pinned ? (
                <PinOff
                  size={17}
                  strokeWidth={1.8}
                />
              ) : (
                <Pin
                  size={17}
                  strokeWidth={1.8}
                />
              )}
            </button>
          )}

          {/* Mobile close */}
          <button
            type="button"
            onClick={onClose}
            className="
              absolute right-4
              rounded-lg p-2
              text-white/60
              hover:bg-white/10
              hover:text-white
              lg:hidden
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-7">
          {/* Workspace */}
          <motion.div
            initial={false}
            animate={{
              opacity: expanded ? 1 : 0,
              height: expanded ? 16 : 0,
              marginBottom: expanded ? 12 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-3"
          >
            <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Workspace
            </p>
          </motion.div>

          {/* Navigation items */}
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
                  title={!expanded ? item.label : undefined}
                  className={`
                    group flex h-11 items-center
                    rounded-xl text-sm
                    transition-colors duration-200
                    ${
                      expanded
                        ? "justify-between px-3.5"
                        : "justify-center px-0"
                    }
                    ${
                      active
                        ? "bg-white/10 font-medium text-white"
                        : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                    }
                  `}
                >
                  <span
                    className={`
                      flex items-center
                      ${
                        expanded
                          ? "gap-3"
                          : "justify-center"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      className="shrink-0"
                    />

                    <motion.span
                      initial={false}
                      animate={{
                        opacity: expanded ? 1 : 0,
                        width: expanded ? "auto" : 0,
                      }}
                      transition={{ duration: 0.18 }}
                      className="
                        overflow-hidden
                        whitespace-nowrap
                      "
                    >
                      {item.label}
                    </motion.span>
                  </span>

                  {/* Courses arrow */}
                  {item.label === "Courses" &&
                    expanded && (
                      <ChevronRight
                        size={15}
                        className="
                          shrink-0
                          text-white/30
                          transition-transform
                          group-hover:translate-x-0.5
                        "
                      />
                    )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* ================================================= */}
        {/* BOTTOM */}
        {/* ================================================= */}

        <div className="shrink-0 border-t border-white/10 p-3">
          {/* Settings */}
          <Link
            href="/admin/settings"
            onClick={onClose}
            title={!expanded ? "Settings" : undefined}
            className={`
              flex h-11 items-center
              rounded-xl text-sm
              text-white/60
              transition-all duration-200
              hover:bg-white/[0.07]
              hover:text-white
              ${
                expanded
                  ? "gap-3 px-3.5"
                  : "justify-center px-0"
              }
            `}
          >
            <Settings
              size={19}
              strokeWidth={1.8}
              className="shrink-0"
            />

            <motion.span
              initial={false}
              animate={{
                opacity: expanded ? 1 : 0,
                width: expanded ? "auto" : 0,
              }}
              transition={{ duration: 0.18 }}
              className="
                overflow-hidden
                whitespace-nowrap
              "
            >
              Settings
            </motion.span>
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            title={!expanded ? "Logout" : undefined}
            className={`
              mt-1 flex h-11 w-full
              items-center
              rounded-xl
              text-sm text-white/60
              transition-all duration-200
              hover:bg-white/[0.07]
              hover:text-white
              ${
                expanded
                  ? "gap-3 px-3.5"
                  : "justify-center px-0"
              }
            `}
          >
            <LogOut
              size={19}
              strokeWidth={1.8}
              className="shrink-0"
            />

            <motion.span
              initial={false}
              animate={{
                opacity: expanded ? 1 : 0,
                width: expanded ? "auto" : 0,
              }}
              transition={{ duration: 0.18 }}
              className="
                overflow-hidden
                whitespace-nowrap
              "
            >
              Logout
            </motion.span>
          </button>
        </div>
      </motion.aside>
    </>
  );
}