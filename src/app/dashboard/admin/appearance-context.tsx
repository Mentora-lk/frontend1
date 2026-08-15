'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'admin_theme_v1';
const DEFAULT_THEME: ThemePreference = 'system';

function loadTheme(): ThemePreference {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : DEFAULT_THEME;
}

function saveTheme(value: ThemePreference) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(THEME_STORAGE_KEY, value);
}

// Global theme variables — every admin page nested inside AppearanceProvider
// can use var(--card-bg), var(--text-primary), etc. and will respond to the toggle.
const GLOBAL_THEME_STYLES = `
  .admin-appearance-root[data-theme='light'] {
    --page-bg: #f7f8f8;
    --card-bg: #ffffff;
    --card-border: #e5e7eb;
    --divider: #f1f5f4;
    --text-primary: #111827;
    --text-muted: #6b7280;
    --input-bg: #ffffff;
    --input-border: #d1d5db;
    --accent: #0f766e;
    --accent-soft: #ecfeff;
    --sidebar-active-bg: rgba(15,118,110,0.08);
    --shadow: 0 8px 20px rgba(0,0,0,0.04);
    --danger: #dc2626;
    --danger-border: #fecaca;
    --danger-bg-soft: #fef2f2;
    --danger-title: #991b1b;
    --danger-sub: #b45309;
    --success: #0f766e;
    --success-bg: #ecfeff;
    --success-border: #99f6e4;
  }
  .admin-appearance-root[data-theme='dark'] {
    --page-bg: #0f1115;
    --card-bg: #171a21;
    --card-border: #262b36;
    --divider: #232733;
    --text-primary: #f3f4f6;
    --text-muted: #9ca3af;
    --input-bg: #1f232c;
    --input-border: #333947;
    --accent: #14b8a6;
    --accent-soft: rgba(20,184,166,0.12);
    --sidebar-active-bg: rgba(20,184,166,0.14);
    --shadow: 0 8px 20px rgba(0,0,0,0.35);
    --danger: #f87171;
    --danger-border: #7f1d1d;
    --danger-bg-soft: rgba(220,38,38,0.14);
    --danger-title: #fca5a5;
    --danger-sub: #fbbf24;
    --success: #2dd4bf;
    --success-bg: rgba(20,184,166,0.12);
    --success-border: rgba(45,212,191,0.35);
  }
  .admin-appearance-root {
    background: var(--page-bg);
    color: var(--text-primary);
    min-height: 100%;
    transition: background 0.2s ease, color 0.2s ease;
  }
`;

type AppearanceContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: ThemePreference) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemePreference>(DEFAULT_THEME);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setThemeState(loadTheme());
    setHydrated(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const compute = () => {
      setResolvedTheme(theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme);
    };
    compute();
    mq.addEventListener('change', compute);
    return () => mq.removeEventListener('change', compute);
  }, [theme]);

  const setTheme = (next: ThemePreference) => {
    setThemeState(next);
    saveTheme(next);
  };

  // Avoid a flash of default theme before localStorage is read on mount.
  if (!hydrated) return null;

  return (
    <AppearanceContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      <style>{GLOBAL_THEME_STYLES}</style>
      <div className="admin-appearance-root" data-theme={resolvedTheme}>
        {children}
      </div>
    </AppearanceContext.Provider>
  );
}

export function useAppearance() {
  const ctx = useContext(AppearanceContext);
  if (!ctx) throw new Error('useAppearance must be used within an AppearanceProvider');
  return ctx;
}
