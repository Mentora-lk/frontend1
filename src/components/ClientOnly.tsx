'use client';

import { useEffect, useState, ReactNode } from 'react';

/**
 * Renders `children` only after the component has mounted on the client.
 *
 * Why this exists: a browser extension on this machine mutates the DOM
 * (stamping `bis_skin_checked="1"` onto elements, a `hydrated` className onto
 * `<html>`) before React hydrates, which trips React's hydration-mismatch
 * warning across large parts of the tree. `suppressHydrationWarning` doesn't
 * help here because it only covers the exact element it's placed on, not
 * descendants — and the extension touches virtually every element.
 *
 * Rendering nothing (`null`) on the very first pass means there is no markup
 * for the extension to mutate before hydration completes, so there is
 * nothing for React to find "wrong" during hydration. The real content then
 * mounts one tick later via a normal client-side render, which isn't subject
 * to hydration comparison at all.
 *
 * Trade-off: anything wrapped in this renders blank until JS has loaded and
 * the first effect has run (usually a single frame, but real — there's no
 * server-rendered fallback for users with JS disabled or a very slow first
 * paint). Use it narrowly, only around subtrees that actually hit this
 * warning, not as a blanket wrapper for the whole app.
 */
export default function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}
