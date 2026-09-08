'use client';

import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from '@/components/providers/ThemeProvider';

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider (see src/app/layout.tsx)');
  }
  return ctx;
}
