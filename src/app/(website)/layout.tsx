import type { ReactNode } from "react";
import { Navbar } from "@/components/website/layout/Navbar";
import Footer from "@/components/website/layout/Footer";

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}


