"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { usePalette } from "@/hooks/usePalette";

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const { token } = resolvedParams;
  const palette = usePalette();

  const router = useRouter();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: formData.password,
        }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.message || "Failed to reset password");
        return;
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, transition: "background 0.25s ease" }}>
      <div
        style={{
          maxWidth: 500,
          margin: "80px auto",
          padding: "0 20px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 42,
              fontWeight: 900,
              color: palette.textPrimary,
              margin: "0 0 12px",
              lineHeight: 1.2,
            }}
          >
            Create New Password
          </h1>
          <p
            style={{
              fontSize: 16,
              color: palette.textSecondary,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Please enter your new password below.
          </p>
        </div>

        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                    color: palette.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onFocus={() => setHoveredField("password")}
                  onBlur={() => setHoveredField(null)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: 14,
                    border:
                      hoveredField === "password"
                        ? "2px solid #10b981"
                        : `1px solid ${palette.border}`,
                    borderRadius: 10,
                    background: palette.inputBg,
                    color: palette.textPrimary,
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    boxShadow:
                      hoveredField === "password"
                        ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                        : "none",
                  }}
                  required
                />
                <p
                  style={{
                    fontSize: 12,
                    color: palette.textMuted,
                    marginTop: 6,
                    margin: "6px 0 0",
                  }}
                >
                  At least 8 characters
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: palette.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  onFocus={() => setHoveredField("confirmPassword")}
                  onBlur={() => setHoveredField(null)}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: 14,
                    border:
                      hoveredField === "confirmPassword"
                        ? "2px solid #10b981"
                        : `1px solid ${palette.border}`,
                    borderRadius: 10,
                    background: palette.inputBg,
                    color: palette.textPrimary,
                    outline: "none",
                    transition: "all 0.3s ease",
                    boxSizing: "border-box",
                    boxShadow:
                      hoveredField === "confirmPassword"
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
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </>
          )}
        </form>

        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: palette.textMuted,
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
