"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [formData, setFormData] = useState({
    email: "",
    code: "",
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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/auth/send-reset-code", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: formData.email }),
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   setError(data.message || "Failed to send reset code");
      //   return;
      // }

      console.log("Reset code sent to:", formData.email);
      setSuccess("Code sent to your email. Please check your inbox.");
      setTimeout(() => {
        setStep("code");
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: Replace with actual API call
      // const response = await fetch("/api/auth/verify-reset-code", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     code: formData.code,
      //   }),
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   setError(data.message || "Invalid code");
      //   return;
      // }

      console.log("Code verified");
      setSuccess("Code verified! Now set your new password.");
      setTimeout(() => {
        setStep("password");
        setSuccess("");
      }, 1500);
    } catch (err) {
      setError("Invalid code. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
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
      // TODO: Replace with actual API call
      // const response = await fetch("/api/auth/reset-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     email: formData.email,
      //     code: formData.code,
      //     password: formData.password,
      //   }),
      // });
      // const data = await response.json();
      // if (!response.ok) {
      //   setError(data.message || "Failed to reset password");
      //   return;
      // }

      console.log("Password reset successful");
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

  const handleBack = () => {
    if (step === "code") {
      setStep("email");
      setFormData((prev) => ({ ...prev, code: "" }));
    } else if (step === "password") {
      setStep("code");
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    }
    setError("");
    setSuccess("");
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
            Reset Password
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#5f646f",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {step === "email" && "Enter your email to receive a reset code"}
            {step === "code" && "Enter the code sent to your email"}
            {step === "password" && "Create your new password"}
          </p>
        </div>

        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 40,
            gap: 12,
          }}
        >
          {(["email", "code", "password"] as const).map((s, index) => (
            <div key={s} style={{ flex: 1 }}>
              <div
                style={{
                  height: 4,
                  background:
                    (step === "email" && index <= 0) ||
                    (step === "code" && index <= 1) ||
                    (step === "password" && index <= 2)
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "#e5e7eb",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                }}
              />
            </div>
          ))}
        </div>

        {/* Forms */}
        {step === "email" && (
          <form onSubmit={handleSendCode} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                value={formData.email}
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
              {isLoading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
                Reset Code
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                name="code"
                maxLength={6}
                value={formData.code}
                onChange={handleInputChange}
                onFocus={() => setHoveredField("code")}
                onBlur={() => setHoveredField(null)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  fontSize: 14,
                  textAlign: "center",
                  letterSpacing: "4px",
                  border:
                    hoveredField === "code"
                      ? "2px solid #10b981"
                      : "1px solid #d1d5db",
                  borderRadius: 10,
                  background: "#ffffff",
                  outline: "none",
                  transition: "all 0.3s ease",
                  boxSizing: "border-box",
                  boxShadow:
                    hoveredField === "code"
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
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: "12px 20px",
                fontSize: 16,
                fontWeight: 500,
                border: "1px solid #d1d5db",
                borderRadius: 10,
                background: "white",
                color: "#6b7280",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              Back
            </button>
          </form>
        )}

        {step === "password" && (
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
                      : "1px solid #d1d5db",
                  borderRadius: 10,
                  background: "#ffffff",
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
                  color: "#9ca3af",
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
                  color: "#374151",
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
                      : "1px solid #d1d5db",
                  borderRadius: 10,
                  background: "#ffffff",
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

            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: "12px 20px",
                fontSize: 16,
                fontWeight: 500,
                border: "1px solid #d1d5db",
                borderRadius: 10,
                background: "white",
                color: "#6b7280",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.borderColor = "#9ca3af";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
                e.currentTarget.style.borderColor = "#d1d5db";
              }}
            >
              Back
            </button>
          </form>
        )}

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
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "#059669")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "#10b981")
            }
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}