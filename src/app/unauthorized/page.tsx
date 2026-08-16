'use client';

import { usePalette } from '@/hooks/usePalette';

export default function UnauthorizedPage() {
  const palette = usePalette();
  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", color: palette.textPrimary }}>
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
    </main>
  );
}
