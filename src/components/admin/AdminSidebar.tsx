"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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
  User,
  MessageSquare,
  GitBranch,
  ListTree
} from "lucide-react";
import { motion } from "framer-motion";


import LogoutDialog from "./LogoutDialog";

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
    label: "Authors",
    href: "/admin/authors",
    icon: User,
  },
  {
    label: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    label: "Media",
    href: "/admin/galleries",
    icon: Images,
  },
  {
    label: "Category",
    href: "/admin/main-category",
    icon: ListTree,
  },
  {
    label: "Sub-Category",
    href: "/admin/sub-category",
    icon: GitBranch,
  },
  {
    label: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "enquiries",
    href: "/admin/enquiries",
    icon: MessageSquare,
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


  const [logoutOpen, setLogoutOpen] = useState(false);



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
            bg-[#0B1330]/60
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
          bg-sidebar-premium
          text-white
          border-r border-white/10
          shadow-[20px_0_60px_-15px_rgba(11,19,48,0.55)]
          lg:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Ambient premium glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -top-20 left-1/2 h-56 w-[130%] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[80px]" />
          <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-teal-500/20 blur-[90px]" />
          <div className="absolute top-1/2 -left-20 h-72 w-56 rounded-full bg-[#2f4480]/40 blur-[90px]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        </div>
        {/* ================================================= */}
        {/* TOP / LOGO */}
        {/* ================================================= */}

        <div className="relative flex h-[88px] shrink-0 items-center border-b border-white/10 bg-white/[0.02]">
          {/* Logo ambient glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/25 blur-2xl"
          />
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
              {/* Full logo — kept at w-36, elevated with premium glow/sharpness */}
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
                  drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]
                  brightness-110 contrast-105
                  ${
                    expanded
                      ? "pointer-events-auto"
                      : "pointer-events-none absolute"
                  }
                `}
              />

              {/* Collapsed logo — glass tile */}
              <motion.div
                initial={false}
                animate={{
                  opacity: expanded ? 0 : 1,
                  scale: expanded ? 0.8 : 1,
                }}
                transition={{ duration: 0.2 }}
                className={`
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl
                  bg-white/10
                  ring-1 ring-white/15
                  backdrop-blur
                  shadow-[0_8px_20px_-8px_rgba(0,0,0,0.6)]
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
                  className="h-8 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] brightness-110"
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

        <nav className="admin-sidebar-nav relative flex-1 overflow-y-auto px-3 py-7">
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
            <p className="flex items-center gap-3 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45 after:h-px after:flex-1 after:bg-white/10">
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
                    group relative flex h-11 items-center
                    rounded-xl text-sm
                    transition-all duration-200
                    ${
                      expanded
                        ? "justify-between px-3.5"
                        : "justify-center px-0"
                    }
                    ${
                      active
                        ? "bg-sidebar-active font-semibold text-white shadow-sidebar-active ring-1 ring-white/25"
                        : "text-white/60 hover:translate-x-[1px] hover:bg-white/[0.07] hover:text-white"
                    }
                  `}
                >
                  {active &&
                    (expanded ? (
                      <span
                        aria-hidden
                        className="absolute left-[-12px] top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="absolute -top-[7px] left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                      />
                    ))}
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
                    <span
                      className={`
                        flex h-8 w-8 items-center justify-center rounded-lg transition-all
                        ${
                          active
                            ? "bg-white/20 ring-1 ring-white/25"
                            : "bg-transparent ring-1 ring-transparent group-hover:bg-white/10 group-hover:ring-white/10"
                        }
                      `}
                    >
                      <Icon
                        size={18}
                        strokeWidth={active ? 2 : 1.8}
                        className={`shrink-0 ${active ? "drop-shadow-[0_1px_6px_rgba(0,0,0,0.4)]" : ""}`}
                      />
                    </span>

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

        <div className="relative shrink-0 border-t border-white/10 bg-black/20 p-3 backdrop-blur">
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
            onClick={() => setLogoutOpen(true)}
            title={!expanded ? "Logout" : undefined}
            className={`
              mt-1 flex h-11 w-full
              items-center
              rounded-xl
              text-sm text-white/60
              transition-all duration-200
              hover:bg-rose-500/15
              hover:text-rose-200
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

          {expanded && (
            <p className="mt-3 flex items-center justify-center gap-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
              <span className="h-1 w-1 rounded-full bg-emerald-400/70 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              Premium Admin • v1.0
            </p>
          )}
        </div>
      </motion.aside>

      <LogoutDialog
        open={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}