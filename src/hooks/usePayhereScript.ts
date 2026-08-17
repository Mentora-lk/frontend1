"use client";

import { useEffect, useState } from "react";
// The Window.payhere ambient type is declared globally in src/types/payhere.d.ts
// (picked up automatically by tsconfig's include — no import needed).

const SCRIPT_SRC = "https://www.payhere.lk/lib/payhere.js";

/**
 * Loads PayHere's Checkout JS SDK once and reports when window.payhere is
 * ready to use. Sandbox vs live is determined by the merchant ID itself
 * (a sandbox.payhere.lk account), not by the script URL.
 */
export function usePayhereScript(): boolean {
  const [ready, setReady] = useState<boolean>(
    typeof window !== "undefined" && !!window.payhere
  );

  useEffect(() => {
    if (typeof window === "undefined" || window.payhere) {
      // Already accounted for by the lazy useState initializer above.
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => setReady(true);
    document.body.appendChild(script);
  }, []);

  return ready;
}

export default usePayhereScript;
