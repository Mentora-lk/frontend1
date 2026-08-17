"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePalette } from "@/hooks/usePalette";
import { authService } from "@/services/authService";

type Step = "email" | "reset";

export default function ForgotPasswordPage() {
  const palette = usePalette();
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetComplete, setResetComplete] = useState(false);

  // When the current code expires. Requesting a code replaces any previous one,
  // so this doubles as "which code is live" — with several reset emails in an
  // inbox it's otherwise very easy to type a stale code and get rejected.
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (codeExpiresAt === null) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((codeExpiresAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [codeExpiresAt]);

  const countdown = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`;

  const fieldStyle = (name: string) => ({
    width: "100%",
    padding: "12px 16px",
    fontSize: 14,
    border: hoveredField === name ? "2px solid #10b981" : `1px solid ${palette.border}`,
    borderRadius: 10,
    background: palette.inputBg,
    color: palette.textPrimary,
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box" as const,
    boxShadow: hoveredField === name ? "0 0 0 3px rgba(16, 185, 129, 0.1)" : "none",
  });

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const data = await authService.forgotPassword(email);
      setSuccess(data.message || "Verification code sent to your email.");
      // A new code invalidates the old one, so clear any code already typed.
      setOtp("");
      setCodeExpiresAt(Date.now() + 10 * 60 * 1000);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const data = await authService.resetPassword(email, otp, password);
      setSuccess(data.message || "Password reset successfully! Redirecting to login...");
      setResetComplete(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
      console.error("Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const useDifferentEmail = () => {
    setStep("email");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess("");
    setResetComplete(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: palette.bg, transition: "background 0.25s ease" }}>
      <div style={{ maxWidth: 500, margin: "80px auto", padding: "0 20px" }}>
        {/* Header */}
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
            {step === "email" ? "Forgot Password" : "Reset Password"}
          </h1>
          <p style={{ fontSize: 16, color: palette.textSecondary, margin: 0, lineHeight: 1.6 }}>
            {step === "email"
              ? "Enter your email to receive a verification code"
              : `Enter the code sent to ${email} and choose a new password`}
          </p>
        </div>

        {step === "email" ? (
          <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {error && <Banner kind="error">{error}</Banner>}
            {success && <Banner kind="success">{success}</Banner>}

            <div>
              <FieldLabel palette={palette}>Email Address</FieldLabel>
              <input
                type="email"
                placeholder="you@example.com"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onFocus={() => setHoveredField("email")}
                onBlur={() => setHoveredField(null)}
                style={fieldStyle("email")}
                required
              />
            </div>

            <SubmitButton isLoading={isLoading}>
              {isLoading ? "Sending..." : "Send Verification Code"}
            </SubmitButton>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {error && <Banner kind="error">{error}</Banner>}
            {success && <Banner kind="success">{success}</Banner>}

            {!resetComplete && (
              <>
                <div>
                  <FieldLabel palette={palette}>Verification Code</FieldLabel>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="6-digit code"
                    name="otp"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    onFocus={() => setHoveredField("otp")}
                    onBlur={() => setHoveredField(null)}
                    style={{ ...fieldStyle("otp"), letterSpacing: 4, textAlign: "center" }}
                    maxLength={6}
                    required
                  />
                  <p style={{ fontSize: 12, color: palette.textMuted, margin: "6px 0 0", textAlign: "center" }}>
                    {secondsLeft > 0
                      ? `Use the code from the newest email — expires in ${countdown}`
                      : "This code has expired. Use “Resend code” to get a new one."}
                  </p>
                </div>

                <div>
                  <FieldLabel palette={palette}>New Password</FieldLabel>
                  <input
                    type="password"
                    placeholder="••••••••"
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    onFocus={() => setHoveredField("password")}
                    onBlur={() => setHoveredField(null)}
                    style={fieldStyle("password")}
                    required
                  />
                  <p style={{ fontSize: 12, color: palette.textMuted, margin: "6px 0 0" }}>
                    At least 8 characters
                  </p>
                </div>

                <div>
                  <FieldLabel palette={palette}>Confirm Password</FieldLabel>
                  <input
                    type="password"
                    placeholder="••••••••"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    onFocus={() => setHoveredField("confirmPassword")}
                    onBlur={() => setHoveredField(null)}
                    style={fieldStyle("confirmPassword")}
                    required
                  />
                </div>

                <SubmitButton isLoading={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </SubmitButton>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isLoading}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#10b981",
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Resend code
                  </button>
                  <button
                    type="button"
                    onClick={useDifferentEmail}
                    disabled={isLoading}
                    style={{
                      background: "none",
                      border: "none",
                      color: palette.textMuted,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    Use a different email
                  </button>
                </div>
              </>
            )}
          </form>
        )}

        {/* Back to Login Link */}
        <p style={{ textAlign: "center", fontSize: 14, color: palette.textMuted, margin: "32px 0 0" }}>
          <Link
            href="/auth/login"
            style={{ color: "#10b981", textDecoration: "none", fontWeight: 600, transition: "color 0.3s ease" }}
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

function FieldLabel({ children, palette }: { children: React.ReactNode; palette: { textSecondary: string } }) {
  return (
    <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: palette.textSecondary, marginBottom: 8 }}>
      {children}
    </label>
  );
}

function Banner({ kind, children }: { kind: "error" | "success"; children: React.ReactNode }) {
  const styles =
    kind === "error"
      ? { background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b" }
      : { background: "#dcfce7", border: "1px solid #bbf7d0", color: "#166534" };
  return (
    <div style={{ padding: "12px 16px", borderRadius: 10, fontSize: 14, textAlign: "center", ...styles }}>
      {children}
    </div>
  );
}

function SubmitButton({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      style={{
        padding: "14px 20px",
        fontSize: 16,
        fontWeight: 600,
        border: "none",
        borderRadius: 10,
        background: isLoading ? "#d1d5db" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        cursor: isLoading ? "not-allowed" : "pointer",
        transition: "all 0.3s ease",
        marginTop: 8,
        boxShadow: isLoading ? "none" : "0 4px 12px rgba(16, 185, 129, 0.25)",
      }}
      onMouseEnter={(e) => {
        if (!isLoading) e.currentTarget.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.35)";
      }}
      onMouseLeave={(e) => {
        if (!isLoading) e.currentTarget.style.boxShadow = "0 4px 12px rgba(16, 185, 129, 0.25)";
      }}
    >
      {children}
    </button>
  );
}
