"use client";

import { useState } from "react";
import Link from "next/link";
import TutorRegistration from "../components/SignupForm/TutorRegistration";
import { GoogleSignUpButton } from "@/components/auth/GoogleSignUpButton";

export default function TutorDetailsPage() {
  const [googleError, setGoogleError] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div
        style={{
          maxWidth: 600,
          margin: "60px auto",
          padding: "40px 20px",
          background: "#f9fafb",
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
                color: "#111827",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Tutor Details
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#6b7280",
                margin: "8px 0 0",
                lineHeight: 1.6,
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
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #e5e7eb)" }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              whiteSpace: "nowrap",
            }}
          >
            or fill in your details
          </span>
          <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #e5e7eb, transparent)" }} />
        </div>

        {/* Form */}
        <TutorRegistration />
      </div>
    </div>
  );
}
