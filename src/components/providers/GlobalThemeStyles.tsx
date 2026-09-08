'use client';

import { usePalette } from '@/hooks/usePalette';

/**
 * Applies the current theme's background to <body> site-wide — mounted at
 * the root layout (outside any page-specific layout), so it takes effect
 * even on pages that don't use DashboardLayout (landing, auth, classes,
 * etc.).
 */
export function GlobalThemeStyles() {
  const palette = usePalette();
  return (
    <style>{`
      body { background: ${palette.bg}; color: ${palette.textPrimary}; transition: background 0.25s ease, color 0.25s ease; }
      ::selection { background: rgba(16,185,129,0.3); }
      /* Edge draws its own reveal/clear buttons inside password fields, which
         doubles up with the toggle in components/auth/PasswordInput.tsx. */
      input::-ms-reveal, input::-ms-clear { display: none; }
    `}</style>
  );
}
