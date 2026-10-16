"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentAdmin } from "@/lib/api/auth";
import { supabase } from "@/lib/supabase/client";
import AdminShell from "@/components/admin/AdminShell";
import AdminThemeProvider from "@/components/admin/theme/AdminThemeProvider";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.replace("/admin/login");
          return;
        }

        await getCurrentAdmin();

        setLoading(false);
      } catch {
        await supabase.auth.signOut();
        router.replace("/admin/login");
      }
    };

    checkAdmin();
  }, [router]);

  return (
    <AdminThemeProvider>
      {loading ? (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f8f6] dark:bg-page">
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="relative h-12 w-12 sm:h-16 sm:w-16">
            {/* Ambient glow */}
            <div className="absolute -inset-2 sm:-inset-3 rounded-full bg-emerald-500/20 blur-xl sm:blur-2xl animate-pulse motion-reduce:animate-none" />

            {/* Static track */}
            <div className="absolute inset-0 rounded-full border-[3px] border-emerald-600/10 dark:border-emerald-400/10" />

            {/* Comet arc (conic gradient masked into a ring) */}
            <div
              className="absolute inset-0 rounded-full animate-spin [animation-duration:1s] motion-reduce:animate-none"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(16,185,129,0.05) 40deg, #10b981 300deg, #6ee7b7 360deg)",
                WebkitMask:
                  "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
              }}
            />

            {/* Glowing head dot, synced with the arc */}
            <div className="absolute inset-0 animate-spin [animation-duration:1s] motion-reduce:animate-none">
              <span className="absolute left-1/2 top-[-1px] sm:top-[-1.5px] h-[5px] w-[5px] sm:h-[6px] sm:w-[6px] -translate-x-1/2 rounded-full bg-emerald-200 shadow-[0_0_6px_2px_rgba(16,185,129,0.9)] sm:shadow-[0_0_8px_2px_rgba(16,185,129,0.9)]" />
            </div>

            {/* Inner counter-rotating ring */}
            <div className="absolute inset-[8px] sm:inset-[10px] rounded-full border-[1.5px] border-transparent border-b-emerald-400/70 border-l-emerald-400/30 animate-spin [animation-direction:reverse] [animation-duration:1.6s] motion-reduce:animate-none" />

            {/* Breathing core */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="absolute h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-emerald-500/30 animate-ping [animation-duration:1.8s] motion-reduce:animate-none" />
              <span className="relative h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
            </div>
          </div>

          {/* Label with staggered dots */}
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium tracking-wide text-gray-500 dark:text-muted">
            <span>Checking authentication</span>
            <span className="flex gap-0.5 pt-0.5 sm:pt-1">
              <span className="h-[3px] w-[3px] sm:h-1 sm:w-1 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-[3px] w-[3px] sm:h-1 sm:w-1 rounded-full bg-emerald-600 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-[3px] w-[3px] sm:h-1 sm:w-1 rounded-full bg-emerald-600 animate-bounce" />
            </span>
          </div>
        </div>
      </div>
        
      ) : (
        <AdminShell>{children}</AdminShell>
      )}
    </AdminThemeProvider>
  );
}