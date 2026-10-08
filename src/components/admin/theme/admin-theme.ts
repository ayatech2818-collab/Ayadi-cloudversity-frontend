/**
 * The admin dashboard's light / dark switch.
 *
 * The choice is kept in localStorage and shows up in the page as
 * `data-admin-theme`, the attribute globals.css hangs its dark tokens and the
 * `dark:` variant on.
 */

export type AdminTheme = "light" | "dark";

export const ADMIN_THEME_ATTRIBUTE = "data-admin-theme";

const STORAGE_KEY = "ayadi-admin-theme";

/** Light unless dark was chosen — and on the server, which cannot know. */
export function readAdminTheme(): AdminTheme {
  if (typeof window === "undefined") return "light";

  try {
    return localStorage.getItem(STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    // Storage is blocked; the switch still works for this visit.
    return "light";
  }
}

export function storeAdminTheme(theme: AdminTheme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Nothing to do: the choice simply will not outlive the page.
  }
}

/** True for the storage event another tab fires when it flips the switch. */
export const isAdminThemeChange = (event: StorageEvent): boolean =>
  event.key === STORAGE_KEY;

/**
 * Runs as the browser parses the server's HTML, before anything is painted,
 * and marks its parent dark if that is what was chosen. Without it a reload in
 * dark mode shows a light screen until React has loaded.
 */
export const ADMIN_THEME_SCRIPT = `(function(){try{if(localStorage.getItem("${STORAGE_KEY}")==="dark")document.currentScript.parentElement.setAttribute("${ADMIN_THEME_ATTRIBUTE}","dark")}catch(e){}})()`;
