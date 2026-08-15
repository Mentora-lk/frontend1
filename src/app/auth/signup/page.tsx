"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/navbar/Navbar";
import { usePalette } from "@/hooks/usePalette";
import { useTheme } from "@/hooks/useTheme";

export default function SignupPage() {
  const palette = usePalette();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, transition: "background 0.25s ease" }}>
      {/* <Navbar scrollY={scrollY} /> */}

      <div
        style={{
          maxWidth: 900,
          margin: "80px auto",
          padding: "0 20px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 48,
              fontWeight: 900,
              color: palette.textPrimary,
              margin: "0 0 16px",
              lineHeight: 1.2,
            }}
          >
            Join Mentora
          </h1>
          <p
            style={{
              fontSize: 18,
              color: palette.textSecondary,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            What brings you here today?
          </p>
        </div>

        {/* Registration Choice Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            marginTop: 48,
          }}
        >
          {/* Student Registration Card */}
          <Link href="/auth/signup/student-details" style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: isDark ? "rgba(16,185,129,0.12)" : " rgb(224, 255, 224)",
                border: "2px solid transparent",
                borderRadius: 16,
                padding: 48,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-8px)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "#10b981";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 20px 40px rgba(16, 185, 129, 0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "transparent";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.07)";
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  lineHeight: 1,
                }}
              >
                📚
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: palette.textPrimary,
                    margin: "0 0 8px",
                  }}
                >
                  I'm a Student
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: palette.textSecondary,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Find the perfect tutor and start learning today
                </p>
              </div>
              <button
                style={{
                  padding: "12px 32px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginTop: 8,
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(1)";
                }}
              >
                Register as Student
              </button>
            </div>
          </Link>

          {/* Tutor Registration Card */}
          <Link href="/auth/signup/tutor-details" style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: isDark ? "rgba(16,185,129,0.12)" : "rgb(224, 255, 224)",
                border: "2px solid transparent",
                borderRadius: 16,
                padding: 48,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(-8px)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "#10b981";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 20px 40px rgba(16, 185, 129, 0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform =
                  "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "transparent";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 4px 20px rgba(0,0,0,0.07)";
              }}
            >
              <div
                style={{
                  fontSize: 56,
                  lineHeight: 1,
                }}
              >
                👨‍🏫
              </div>
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: palette.textPrimary,
                    margin: "0 0 8px",
                  }}
                >
                  I'm a Tutor
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: palette.textSecondary,
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  Start teaching and earn by sharing your expertise
                </p>
              </div>
              <button
                style={{
                  padding: "12px 32px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "white",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginTop: 8,
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(1.05)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.transform =
                    "scale(1)";
                }}
              >
                Register as Tutor
              </button>
            </div>
          </Link>
        </div>

        {/* Login Link */}
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <p style={{ fontSize: 14, color: palette.textSecondary, margin: 0 }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#10b981",
                textDecoration: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
