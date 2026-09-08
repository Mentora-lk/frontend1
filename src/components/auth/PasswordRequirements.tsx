"use client";

import { checkPassword } from "@/lib/validators";
import { usePalette } from "@/hooks/usePalette";

interface PasswordRequirementsProps {
  password: string;
  /** Omit to hide the "passwords match" line (e.g. single-password forms). */
  confirmPassword?: string;
  /** Render the rules even before the user types anything. */
  alwaysShow?: boolean;
}

/**
 * Live checklist for the password rules in lib/validators.ts. Purely
 * presentational — forms own their own inputs (their styling differs) and
 * gate submission with isPasswordValid/getPasswordError.
 */
export function PasswordRequirements({
  password,
  confirmPassword,
  alwaysShow = false,
}: PasswordRequirementsProps) {
  const palette = usePalette();

  if (!password && !alwaysShow) return null;

  const rules = checkPassword(password);
  const showMatch = confirmPassword !== undefined && confirmPassword.length > 0;
  const matches = password === confirmPassword;

  const met = "#059669";
  const unmet = palette.textMuted;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, margin: "-4px 0 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "2px 12px" }}>
        {rules.map((rule) => (
          <span
            key={rule.id}
            style={{
              fontSize: 12,
              color: rule.met ? met : unmet,
              display: "flex",
              alignItems: "center",
              gap: 6,
              transition: "color 0.2s ease",
            }}
          >
            <span aria-hidden style={{ fontSize: 11, width: 10 }}>{rule.met ? "✓" : "○"}</span>
            {rule.label}
          </span>
        ))}
      </div>

      {showMatch && (
        <span style={{ fontSize: 12, color: matches ? met : "#dc2626", display: "flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden style={{ fontSize: 11, width: 10 }}>{matches ? "✓" : "✕"}</span>
          {matches ? "Passwords match" : "Passwords do not match"}
        </span>
      )}
    </div>
  );
}
