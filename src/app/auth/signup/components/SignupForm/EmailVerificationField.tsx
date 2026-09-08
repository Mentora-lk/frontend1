"use client";

import { useState } from "react";
import { authService } from "@/services/authService";
import { getInputStyle, getSecondaryButtonStyle, FORM_COLORS } from "@/utils/formStyles";
import { usePalette } from "@/hooks/usePalette";

interface EmailVerificationFieldProps {
  email: string;
  onEmailChange: (email: string) => void;
  verified: boolean;
  onVerifiedChange: (verified: boolean) => void;
  hoveredField: string | null;
  setHoveredField: (field: string | null) => void;
  disabled?: boolean;
}

type Phase = "idle" | "sent";

export function EmailVerificationField({
  email,
  onEmailChange,
  verified,
  onVerifiedChange,
  hoveredField,
  setHoveredField,
  disabled,
}: EmailVerificationFieldProps) {
  const palette = usePalette();
  const [phase, setPhase] = useState<Phase>("idle");
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const themedInput = (fieldName: string, extra?: Record<string, any>): React.CSSProperties => ({
    ...getInputStyle(hoveredField, fieldName, extra),
    background: palette.inputBg,
    color: palette.textPrimary,
    border: hoveredField === fieldName ? "2px solid #10b981" : `1px solid ${palette.border}`,
  });

  const themedSecondaryButton = (disabled: boolean): React.CSSProperties => ({
    ...getSecondaryButtonStyle(disabled),
    background: disabled ? palette.surfaceAlt : palette.surface,
  });

  const sendCode = async () => {
    setIsSending(true);
    setError("");
    setSuccess("");
    try {
      const data = await authService.sendVerification(email);
      setSuccess(data.message || "Verification code sent to your email.");
      setPhase("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setIsSending(false);
    }
  };

  const verifyCode = async () => {
    setIsVerifying(true);
    setError("");
    setSuccess("");
    try {
      const data = await authService.verifyEmail(email, otp);
      setSuccess(data.message || "Email verified.");
      onVerifiedChange(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify code");
    } finally {
      setIsVerifying(false);
    }
  };

  const changeEmail = () => {
    onEmailChange("");
    onVerifiedChange(false);
    setPhase("idle");
    setOtp("");
    setError("");
    setSuccess("");
  };

  if (verified) {
    return (
      <div>
        <div style={themedInput("email")}>✓ {email}</div>
        <button
          type="button"
          onClick={changeEmail}
          style={{ background: "none", border: "none", color: FORM_COLORS.primary, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          placeholder="Email Address"
          name="email"
          value={email}
          onChange={(e) => {
            onEmailChange(e.target.value);
            setError("");
            setSuccess("");
            if (phase === "sent") {
              // Address changed after a code was already sent — that code
              // no longer applies to what's currently typed.
              setPhase("idle");
              setOtp("");
            }
          }}
          onFocus={() => setHoveredField("email")}
          onBlur={() => setHoveredField(null)}
          style={{ ...themedInput("email"), flex: 1 }}
          disabled={disabled}
          required
        />
        <button
          type="button"
          onClick={sendCode}
          disabled={disabled || isSending || !looksLikeEmail}
          style={themedSecondaryButton(disabled || isSending || !looksLikeEmail)}
        >
          {isSending ? "Sending..." : phase === "sent" ? "Resend" : "Send Code"}
        </button>
      </div>

      {phase === "sent" && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            onFocus={() => setHoveredField("otp")}
            onBlur={() => setHoveredField(null)}
            style={{ ...themedInput("otp"), flex: 1, letterSpacing: 4, textAlign: "center" }}
            maxLength={6}
            disabled={disabled}
          />
          <button
            type="button"
            onClick={verifyCode}
            disabled={disabled || isVerifying || otp.length !== 6}
            style={themedSecondaryButton(disabled || isVerifying || otp.length !== 6)}
          >
            {isVerifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}

      {error && <p style={{ fontSize: 12, color: "#991b1b", margin: 0 }}>{error}</p>}
      {!error && success && <p style={{ fontSize: 12, color: "#166534", margin: 0 }}>{success}</p>}
    </div>
  );
}
