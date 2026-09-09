import type { ReactNode } from "react";
import { Navbar } from "@/components/website/layout/Navbar";

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      {children}
    </div>
  );
}
