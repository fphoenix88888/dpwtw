import { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/services/db";
import type { ThemeMode } from "@/types";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const initialState: ThemeProviderState = {
  theme: "auto",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "auto",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  // We prioritize DB settings over local storage key for site-wide consistency managed by admin
  // But strictly speaking, theme is often a per-user preference.
  // The requirement says "admin can switch theme in settings", implying site-wide setting?
  // "在後台新增 1. 主題切換（包含明/暗/自動）" -> This sounds like a site-wide config in admin settings.
  // However, usually theme is client-side. I will sync state with DB settings.
  
  const [theme, setThemeState] = useState<ThemeMode>(defaultTheme);

  useEffect(() => {
      // Load initial from DB
      const settings = db.settings.get();
      if (settings.themeMode) {
          setThemeState(settings.themeMode);
      }

      // Listen for DB updates
      const handleUpdate = () => {
          const newSettings = db.settings.get();
          setThemeState(newSettings.themeMode);
      };
      window.addEventListener('tocas-settings-updated', handleUpdate);
      return () => window.removeEventListener('tocas-settings-updated', handleUpdate);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "auto") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const setTheme = (theme: ThemeMode) => {
    setThemeState(theme);
    // Also update DB if we want this to be persistent site-wide
    // But since the requirement is "In Admin Settings", we assume the admin changes it there via DB update.
    // If we use this hook in a toggle button, we might want to update DB too?
    // For now, let's keep setThemeState internal and let Settings page handle DB update.
  };

  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
