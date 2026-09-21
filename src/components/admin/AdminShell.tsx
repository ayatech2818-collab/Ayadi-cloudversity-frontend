"use client";

import { ReactNode, useState } from "react";

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

  return (
    <div className="min-h-screen bg-[#f5f8f6]">
      <AdminSidebar
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="lg:pl-[270px]">
        <AdminHeader
          onMenuClick={() => setMobileSidebarOpen(true)}
        />

        <main>{children}</main>
      </div>
    </div>
  );
}