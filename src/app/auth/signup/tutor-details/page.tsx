"use client";

import Link from "next/link";
import TutorRegistration from "../components/SignupForm/TutorRegistration";
import { usePalette } from "@/hooks/usePalette";

export default function TutorDetailsPage() {
  const palette = usePalette();

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

        {/* Form (includes its own "Sign up with Google" button) */}
        <TutorRegistration />
      </div>
    </div>
  );
}
