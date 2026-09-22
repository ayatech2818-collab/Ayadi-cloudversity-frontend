"use client";

import { ReactNode, useEffect, useState } from "react";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminShellProps {
  children: ReactNode;
}

export default function AdminShell({
  children,
}: AdminShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  // Whether user permanently pinned the sidebar open
  const [sidebarPinned, setSidebarPinned] =
    useState(false);

  // Whether mouse is currently over sidebar
  const [sidebarHovered, setSidebarHovered] =
    useState(false);

  // Load pinned preference
  useEffect(() => {
    const saved = localStorage.getItem(
      "ayadi-admin-sidebar-pinned"
    );

    if (saved !== null) {
      setSidebarPinned(saved === "true");
    }
  }, []);

  const toggleSidebarPin = () => {
    setSidebarPinned((current) => {
      const next = !current;

      localStorage.setItem(
        "ayadi-admin-sidebar-pinned",
        String(next)
      );

      return next;
    });
  };

  /*
   * Desktop:
   * - pinned     → expanded
   * - hovered    → expanded
   * - otherwise  → collapsed
   *
   * Mobile:
   * - opened → expanded
   */
  const sidebarExpanded =
    sidebarPinned ||
    sidebarHovered ||
    mobileSidebarOpen;

  return (
    <div className="min-h-screen bg-[#f5f8f6]">
      <AdminSidebar
        open={mobileSidebarOpen}
        pinned={sidebarPinned}
        expanded={sidebarExpanded}
        onClose={() => setMobileSidebarOpen(false)}
        onTogglePin={toggleSidebarPin}
        onHoverChange={setSidebarHovered}
      />

      <div
        className={`
          transition-[padding]
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          ${
            sidebarExpanded
              ? "lg:pl-[270px]"
              : "lg:pl-[78px]"
          }
        `}
      >
        <AdminHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main>{children}</main>
      </div>
    </div>
  );
}