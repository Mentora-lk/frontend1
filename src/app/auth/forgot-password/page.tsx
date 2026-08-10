"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Failed to send reset link");
        return;
      }

      setSuccess("Reset link sent to your email. Please check your inbox.");
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div
        style={{
          maxWidth: 500,
          margin: "80px auto",
          padding: "0 20px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 42,
              fontWeight: 900,
              color: "#111827",
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            Forgot Password
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#5f646f",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Forms */}
        <form onSubmit={handleSendLink} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {error && (
            <div
              style={{
                padding: "12px 16px",
                background: "#fee2e2",
                border: "1px solid #fecaca",
                borderRadius: 10,
                color: "#991b1b",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "12px 16px",
                background: "#dcfce7",
                border: "1px solid #bbf7d0",
                borderRadius: 10,
                color: "#166534",
                fontSize: 14,
                textAlign: "center",
              }}
            >
              {success}
            </div>
          )}

          {!success && (
            <>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#374151",
                    marginBottom: 8,
                  }}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  onFocus={() => setHoveredField("email")}
                  onBlur={() => setHoveredField(null)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: 14,
                    border:
                      hoveredField === "email"
                        ? "2px solid #10b981"
                        : "1px solid #d1d5db",
                    borderRadius: 10,
                    background: "#ffffff",
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    boxShadow:
                      hoveredField === "email"
                        ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                        : "none",
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  padding: "14px 20px",
                  fontSize: 16,
                  fontWeight: 600,
                  border: "none",
                  borderRadius: 10,
                  background: isLoading
                    ? "#d1d5db"
                    : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "white",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  transition: "all 0.3s ease",
                  marginTop: 8,
                  boxShadow: isLoading
                    ? "none"
                    : "0 4px 12px rgba(16, 185, 129, 0.25)",
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(16, 185, 129, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(16, 185, 129, 0.25)";
                  }
                }}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </>
          )}
        </form>

        {/* Back to Login Link */}
        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "#6b7280",
            margin: "32px 0 0",
          }}
        >
          <Link
            href="/auth/login"
            style={{
              color: "#10b981",
              textDecoration: "none",
              fontWeight: 600,
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#059669")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#10b981")}
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}