"use client";

import { Moon, Sun } from "lucide-react";

import { iconButtonClass } from "@/components/admin/ui/styles";

import { useAdminTheme } from "./AdminThemeProvider";

const ICON =
  "absolute inset-0 m-auto transition-[opacity,rotate,scale] duration-300 motion-reduce:transition-none";

/**
 * Light / dark switch for the admin header. It shows where a click leads: a
 * moon while the dashboard is light, a sun while it is dark.
 */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useAdminTheme();

  const label =
    theme === "dark"
      ? "Switch to light mode"
      : "Switch to dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`relative ${iconButtonClass()}`}
    >
      <Moon
        size={17}
        aria-hidden="true"
        className={`${ICON} dark:-rotate-90 dark:scale-50 dark:opacity-0`}
      />

      <Sun
        size={17}
        aria-hidden="true"
        className={`${ICON} rotate-90 scale-50 opacity-0 dark:rotate-0 dark:scale-100 dark:opacity-100`}
      />
    </button>
  );
}
