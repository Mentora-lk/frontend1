'use client';

import { useTheme } from './useTheme';
import { getPalette, Palette } from '@/lib/theme';

/** Convenience wrapper: current theme's color tokens in one call. */
export function usePalette(): Palette {
  const { theme } = useTheme();
  return getPalette(theme === 'dark');
}
