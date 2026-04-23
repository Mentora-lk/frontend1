"use client";

import Link from "next/link";
import TutorRegistration from "../components/SignupForm/TutorRegistration";

export default function TutorDetailsPage() {
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

        {/* Form */}
        <TutorRegistration />
      </div>
    </div>
  );
}
