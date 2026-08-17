"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { paymentService } from "@/services/paymentService";

const POLL_INTERVAL_MS = 2000;
const MAX_ATTEMPTS = 30; // ~60s — PayHere's webhook is normally near-instant

type ViewState = "polling" | "completed" | "failed" | "timeout" | "no-order";

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={null}>
      <PaymentStatusContent />
    </Suspense>
  );
}

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [state, setState] = useState<ViewState>(orderId ? "polling" : "no-order");
  const attemptsRef = useRef(0);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        const result = await paymentService.getAdPaymentStatus(orderId);
        if (cancelled) return;

        if (result.status === "COMPLETED") {
          setState("completed");
          return;
        }
        if (result.status === "FAILED") {
          setState("failed");
          return;
        }

        // Still PENDING — PayHere's notify webhook hasn't landed yet.
        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setState("timeout");
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      } catch (err) {
        console.error("Failed to check payment status", err);
        attemptsRef.current += 1;
        if (attemptsRef.current >= MAX_ATTEMPTS) {
          setState("timeout");
          return;
        }
        timer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderId]);

  useEffect(() => {
    if (state === "completed") {
      // my-classes only fetches its data once on mount; without this it can
      // still be sitting in Next's router cache from before this ad existed,
      // so navigating back wouldn't show the newly-published class at all.
      router.refresh();
      const t = setTimeout(() => router.push("/dashboard/tutor/my-classes"), 2000);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  const retryPoll = () => {
    attemptsRef.current = 0;
    setState("polling");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#eef7f1",
        padding: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #c3deca",
          borderRadius: 16,
          padding: "40px 36px",
          maxWidth: 440,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(22,101,52,0.10)",
        }}
      >
        {!orderId && (
          <>
            <div style={{ fontSize: 40 }}>⚠️</div>
            <h2 style={{ color: "#0c1f13", margin: "12px 0 6px" }}>No payment order found</h2>
            <p style={{ color: "#5f8a6d", marginBottom: 20 }}>
              Something went wrong — no order was passed to this page.
            </p>
          </>
        )}

        {orderId && state === "polling" && (
          <>
            <div style={{ fontSize: 40 }}>⏳</div>
            <h2 style={{ color: "#0c1f13", margin: "12px 0 6px" }}>Confirming your payment…</h2>
            <p style={{ color: "#5f8a6d", marginBottom: 0 }}>
              This usually takes a few seconds. Please don't close this page.
            </p>
          </>
        )}

        {state === "completed" && (
          <>
            <div style={{ fontSize: 40 }}>✅</div>
            <h2 style={{ color: "#166534", margin: "12px 0 6px" }}>Payment successful!</h2>
            <p style={{ color: "#5f8a6d", marginBottom: 0 }}>
              Your ad is now live. Redirecting to My Classes…
            </p>
          </>
        )}

        {state === "failed" && (
          <>
            <div style={{ fontSize: 40 }}>❌</div>
            <h2 style={{ color: "#b91c1c", margin: "12px 0 6px" }}>Payment failed</h2>
            <p style={{ color: "#5f8a6d", marginBottom: 20 }}>
              Your card wasn't charged and the ad was not published. You can try posting again.
            </p>
          </>
        )}

        {state === "timeout" && (
          <>
            <div style={{ fontSize: 40 }}>🕑</div>
            <h2 style={{ color: "#0c1f13", margin: "12px 0 6px" }}>Still processing</h2>
            <p style={{ color: "#5f8a6d", marginBottom: 20 }}>
              PayHere is taking longer than usual to confirm this payment. If money left your
              account, the ad will publish automatically — check My Classes shortly.
            </p>
            <button
              onClick={retryPoll}
              style={{
                background: "#166534",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                marginRight: 10,
                cursor: "pointer",
              }}
            >
              Check again
            </button>
          </>
        )}

        {(state === "failed" || state === "timeout" || state === "no-order") && (
          <button
            onClick={() => router.push("/dashboard/tutor/post-ad")}
            style={{
              background: "transparent",
              color: "#166534",
              border: "1px solid #166534",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            Back to Post Ad
          </button>
        )}

        {state === "failed" && (
          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => router.push("/dashboard/tutor/my-classes")}
              style={{
                background: "none",
                border: "none",
                color: "#5f8a6d",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Go to My Classes instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
