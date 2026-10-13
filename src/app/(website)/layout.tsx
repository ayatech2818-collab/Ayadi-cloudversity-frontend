import type { ReactNode } from "react";
import { Navbar } from "@/components/website/layout/Navbar";
import Footer from "@/components/website/layout/Footer";
import { SmoothScroll } from "@/components/website/layout/SmoothScroll";
import { ScrollProbe } from "@/components/website/layout/ScrollProbe";

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
      <SmoothScroll />
      <Navbar />
      {children}
      <Footer />
      {/* Temporary, and silent until asked for with ?probe — see ScrollProbe.tsx. */}
      <ScrollProbe />
    </div>
  );
}


