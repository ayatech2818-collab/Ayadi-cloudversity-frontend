"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  ADMIN_THEME_ATTRIBUTE,
  ADMIN_THEME_SCRIPT,
  isAdminThemeChange,
  readAdminTheme,
  storeAdminTheme,
  type AdminTheme,
} from "./admin-theme";

interface AdminThemeContextValue {
  theme: AdminTheme;
  toggleTheme: () => void;
}

const AdminThemeContext =
  createContext<AdminThemeContextValue | null>(null);

export function useAdminTheme(): AdminThemeContextValue {
  const value = useContext(AdminThemeContext);

  if (!value) {
    throw new Error(
      "useAdminTheme must be used inside AdminThemeProvider"
    );
  }

  return value;
}

/**
 * Owns the dashboard's theme and marks the page with it. Wraps the dashboard
 * only, so the public site and the sign-in pages never see the attribute.
 */
export default function AdminThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<AdminTheme>(readAdminTheme);

  // <html> carries it too: dialogs render into <body>, outside the wrapper
  // below, and the page scrollbar takes its colours from the root.
  useLayoutEffect(() => {
    const root = document.documentElement;

    root.setAttribute(ADMIN_THEME_ATTRIBUTE, theme);

    return () => root.removeAttribute(ADMIN_THEME_ATTRIBUTE);
  }, [theme]);

  // Follow the switch being flipped in another admin tab.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (isAdminThemeChange(event)) setTheme(readAdminTheme());
    };

    window.addEventListener("storage", onStorage);

    return () =>
      window.removeEventListener("storage", onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";

    storeAdminTheme(next);
    setTheme(next);
  }, [theme]);

  const value = useMemo(
    () => ({ theme, toggleTheme }),
    [theme, toggleTheme]
  );

  return (
    <AdminThemeContext.Provider value={value}>
      {/* The server always renders light; the script corrects the attribute
          before the first paint, and React is told to leave that alone. */}
      <div
        className="contents"
        data-admin-theme={theme}
        suppressHydrationWarning
      >
        {/* Only the server's copy may run. A copy React creates in the browser
            never executes, and React warns about script tags it renders. */}
        <script
          type={
            typeof window === "undefined"
              ? "text/javascript"
              : "text/plain"
          }
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: ADMIN_THEME_SCRIPT }}
        />

        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}
