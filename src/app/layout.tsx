import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Ayadi Cloudversity",
    template: "%s | Ayadi Cloudversity",
  },
  description: "Learning for tomorrow's cloud professionals.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className={`${manrope.variable} min-h-full bg-page text-text`}
      >
        {children}
      </body>
    </html>
  );
}