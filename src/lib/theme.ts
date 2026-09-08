/**
 * Shared color tokens for light/dark mode. This app styles everything with
 * inline `style={{...}}` objects (no CSS variables, no Tailwind wired in —
 * see frontend1/CLAUDE.md), so every themed page imports `usePalette()`
 * (src/hooks/usePalette.ts) and swaps its hardcoded hex literals for these
 * named tokens instead. Brand green (#10B981/#059669) and semantic colors
 * (danger red, warning amber, etc.) stay constant across both themes —
 * only neutrals (backgrounds/borders/text) change.
 */
export interface Palette {
  bg: string; // page background
  surface: string; // card/panel background
  surfaceAlt: string; // secondary surface — inputs, subtle inset panels
  border: string; // default hairline border
  borderStrong: string; // more visible / accented border
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  navBg: string; // translucent top-nav background
  hoverBg: string; // hover state for list/nav items
  activeBg: string; // active/selected nav item background
  inputBg: string;
  shadow: string; // card drop-shadow
}

export function getPalette(isDark: boolean): Palette {
  return isDark
    ? {
        bg: '#0F1512',
        surface: '#161D1A',
        surfaceAlt: '#1B2420',
        border: '#232E28',
        borderStrong: 'rgba(16,185,129,0.25)',
        textPrimary: '#F3F4F6',
        textSecondary: '#C7D0CB',
        textMuted: '#8B968F',
        navBg: 'rgba(15,21,18,0.96)',
        hoverBg: '#1B2420',
        activeBg: 'rgba(16,185,129,0.15)',
        inputBg: '#0F1512',
        shadow: '0 4px 24px rgba(0,0,0,0.35)',
      }
    : {
        bg: '#F8FAF9',
        surface: '#FFFFFF',
        surfaceAlt: '#F9FAFB',
        border: '#E5E7EB',
        borderStrong: 'rgba(16,185,129,0.12)',
        textPrimary: '#111827',
        textSecondary: '#374151',
        textMuted: '#9CA3AF',
        navBg: 'rgba(255,255,255,0.96)',
        hoverBg: '#F9FAFB',
        activeBg: '#ECFDF5',
        inputBg: '#FFFFFF',
        shadow: '0 4px 24px rgba(0,0,0,0.06)',
      };
}
