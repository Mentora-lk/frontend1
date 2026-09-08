'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'theme';

/**
 * Persists a light/dark preference to localStorage and exposes it via
 * `useTheme()` (src/hooks/useTheme.ts). Scope note: this only drives the
 * dashboard chrome (Sidebar, DashboardLayout, Settings page) for now — the
 * rest of the app has no theming system yet (see frontend1/CLAUDE.md on the
 * inline-style-everywhere architecture), so most pages won't visually
 * change when toggled. Also sets `data-theme` on <html> so a future
 * app-wide CSS-variable pass has something to key off of.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  // Read the stored preference on mount (client-only — localStorage isn't
  // available during SSR, so the first render always uses the 'light'
  // default above to avoid a hydration mismatch).
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}
