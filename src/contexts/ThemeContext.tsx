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
    // Remove Tocas data attribute to reset
    root.removeAttribute("data-theme");

    if (theme === "auto") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      // Tocas might use auto detection, but explicit class helps Tailwind.
      // For Tocas to sync if it relies on data-theme:
      root.setAttribute("data-theme", systemTheme);
      return;
    }

    root.classList.add(theme);
    root.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (theme: ThemeMode) => {
    setThemeState(theme);
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
