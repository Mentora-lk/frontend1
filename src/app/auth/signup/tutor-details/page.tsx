"use client";

import { useState } from "react";
import Link from "next/link";
import TutorRegistration from "../components/SignupForm/TutorRegistration";
import { GoogleSignUpButton } from "@/components/auth/GoogleSignUpButton";
import { usePalette } from "@/hooks/usePalette";

export default function TutorDetailsPage() {
  const palette = usePalette();
  const [googleError, setGoogleError] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, transition: "background 0.25s ease" }}>
      <div
        style={{
          maxWidth: 600,
          margin: "60px auto",
          padding: "40px 20px",
          background: palette.surfaceAlt,
          borderRadius: 16,
        }}
      >
        {/* Header with Back Button */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <Link href="/auth/signup">
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 24,
                padding: "8px",
                color: palette.textPrimary,
              }}
            >
              ←
            </button>
          </Link>
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36,
                fontWeight: 700,
                color: palette.textPrimary,
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Tutor Details
            </h1>
            <p
              style={{
                fontSize: 14,
                color: palette.textSecondary,
                margin: "8px 0 0",
                lineHeight: 1.6,
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              Share your teaching experience with us
            </p>
          </div>
        </div>

        {/* Google Sign-Up */}
        {googleError && (
          <div
            style={{
              padding: "12px 16px",
              background: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              color: "#991b1b",
              fontSize: 14,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {googleError}
          </div>
        )}
        <GoogleSignUpButton role="tutor" onError={setGoogleError} />

        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "22px 0" }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${palette.border})` }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: palette.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            or fill in your details
          </span>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${palette.border}, transparent)` }} />
        </div>

        {/* Form */}
        <TutorRegistration />
      </div>
    </div>
  );
}
