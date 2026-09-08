"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getInputStyle,
  getSelectStyle,
  formContainerStyle,
  formGridStyle,
  getPrimaryButtonStyle,
  handleButtonHoverEnter,
  handleButtonHoverLeave,
  handleLinkHoverEnter,
  handleLinkHoverLeave,
} from "@/utils/formStyles";
import { authService } from "@/services/authService";
import { EmailVerificationField } from "./EmailVerificationField";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { getPasswordError, isPasswordValid } from "@/lib/validators";
import { usePalette } from "@/hooks/usePalette";

export default function StudentRegistration() {
  const router = useRouter();
  const palette = usePalette();

  const [formData, setFormData] = useState({
    fullName: "",
    school: "",
    age: "",
    language: "",
    email: "",
    address: "",
    grade: "",
    password: "",
    confirmPassword: "",
  });

  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Set once "Sign up with Google" verifies an email — the account is
  // created with this ticket instead of a password (see handleSubmit).
  const [googleSignupToken, setGoogleSignupToken] = useState<string | null>(null);
  const [alreadyHasAccount, setAlreadyHasAccount] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "O/L", "A/L"];
  const languages = ["Sinhala", "English", "Tamil", "Bilingual"];

  // Layers theme-aware colors (background/border/text) on top of
  // formStyles.ts's base styling (font, radius, hover ring), so the same
  // fields used across light/dark mode instead of always rendering white.
  const themedInput = (fieldName: string, extra?: Record<string, any>): React.CSSProperties => ({
    ...getInputStyle(hoveredField, fieldName, extra),
    background: palette.inputBg,
    color: palette.textPrimary,
    border: hoveredField === fieldName ? "2px solid #10b981" : `1px solid ${palette.border}`,
  });

  // Same as themedInput, but tints the border red while the field's current
  // value fails validation (focus ring still wins, so typing stays calm).
  const invalidableInput = (fieldName: string, invalid: boolean): React.CSSProperties => ({
    ...themedInput(fieldName),
    ...(invalid && hoveredField !== fieldName ? { border: "1px solid #dc2626" } : {}),
  });

  const themedSelect = (fieldName: string, isSelected: boolean): React.CSSProperties => ({
    ...themedInput(fieldName),
    cursor: "pointer",
    color: isSelected ? palette.textPrimary : palette.textMuted,
  });

  const themedPrimaryButton = (disabled: boolean): React.CSSProperties => ({
    ...getPrimaryButtonStyle(disabled),
    background: disabled ? palette.surfaceAlt : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: disabled ? palette.textMuted : "white",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const useDifferentEmail = () => {
    setGoogleSignupToken(null);
    setFormData((prev) => ({ ...prev, email: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!googleSignupToken && !emailVerified) {
        setError("Please verify your email before creating an account.");
        setIsLoading(false);
        return;
      }

      // Password fields don't apply once verified via Google.
      if (!googleSignupToken) {
        const passwordError = getPasswordError(formData.password, formData.confirmPassword);
        if (passwordError) {
          setError(passwordError);
          setIsLoading(false);
          return;
        }
      }

      const response = await authService.registerStudent({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        school: formData.school,
        age: formData.age,
        language: formData.language,
        gradeLevel: formData.grade,   // form field is "grade", backend expects "gradeLevel"
        address: formData.address,
        googleSignupToken: googleSignupToken || undefined,
      });

      // Extract user info from nested response.user (fullName comes from
      // the profile row the backend just created, since registration
      // doesn't return it on user itself)
      const user = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        fullName: response.profile?.full_name ?? formData.fullName,
      };

      // Store token and user info
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set user_role cookie so middleware allows dashboard access
      document.cookie = `user_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 30}`;

      // Redirect to login so user can sign in with their new account
      router.push("/auth/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      console.warn("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formContainerStyle}>
      {/* Error Message */}
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
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {alreadyHasAccount && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 10,
            color: "#92400e",
            fontSize: 14,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          An account already exists for that email.{" "}
          <a href="/auth/login" style={{ color: "#92400e", fontWeight: 700 }}>
            Log in instead
          </a>
          .
        </div>
      )}

      {/* Full Name */}
      <input
        type="text"
        placeholder="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        onFocus={() => setHoveredField("fullName")}
        onBlur={() => setHoveredField(null)}
        style={themedInput("fullName")}
        required
      />

      {/* School/Institute & Age */}
      <div style={formGridStyle(2)}>
        <input
          type="text"
          placeholder="School / Institute"
          name="school"
          value={formData.school}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("school")}
          onBlur={() => setHoveredField(null)}
          style={themedInput("school")}
          required
        />
        <input
          type="number"
          placeholder="Age"
          name="age"
          value={formData.age}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("age")}
          onBlur={() => setHoveredField(null)}
          style={themedInput("age")}
          required
        />
      </div>

      {/* Language & Grade */}
      <div style={formGridStyle(2)}>
        <select
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("language")}
          onBlur={() => setHoveredField(null)}
          style={themedSelect("language", !!formData.language)}
          required
        >
          <option value="">Select Language</option>
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>

        <select
          name="grade"
          value={formData.grade}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("grade")}
          onBlur={() => setHoveredField(null)}
          style={themedSelect("grade", !!formData.grade)}
          required
        >
          <option value="">Select Grade/Level</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </div>

      {/* Email */}
      {googleSignupToken ? (
        <div>
          <div style={themedInput("email")}>
            ✓ {formData.email}
          </div>
          <button
            type="button"
            onClick={useDifferentEmail}
            style={{ background: "none", border: "none", color: "#10b981", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 0" }}
          >
            Use a different email
          </button>
        </div>
      ) : (
        <EmailVerificationField
          email={formData.email}
          onEmailChange={(value) => setFormData((prev) => ({ ...prev, email: value }))}
          verified={emailVerified}
          onVerifiedChange={setEmailVerified}
          hoveredField={hoveredField}
          setHoveredField={setHoveredField}
          disabled={isLoading}
        />
      )}

      {/* Address */}
      <input
        type="text"
        placeholder="Address"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        onFocus={() => setHoveredField("address")}
        onBlur={() => setHoveredField(null)}
        style={themedInput("address")}
        required
      />

      {/* Password Fields — not needed once verified via Google */}
      {!googleSignupToken && (
      <>
        <div style={formGridStyle(2)}>
          <PasswordInput
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => setHoveredField("password")}
            onBlur={() => setHoveredField(null)}
            style={invalidableInput("password", !!formData.password && !isPasswordValid(formData.password))}
            required
          />
          <PasswordInput
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            onFocus={() => setHoveredField("confirmPassword")}
            onBlur={() => setHoveredField(null)}
            style={invalidableInput(
              "confirmPassword",
              !!formData.confirmPassword && formData.confirmPassword !== formData.password
            )}
            required
          />
        </div>
        <PasswordRequirements
          password={formData.password}
          confirmPassword={formData.confirmPassword}
        />
      </>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        style={themedPrimaryButton(isLoading)}
        onMouseEnter={(e) => !isLoading && handleButtonHoverEnter(e, true)}
        onMouseLeave={(e) => !isLoading && handleButtonHoverLeave(e, true)}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </button>

      {/* Login Link */}
      <p
        style={{
          textAlign: "center",
          fontSize: 14,
          color: palette.textSecondary,
          margin: "12px 0 0",
        }}
      >
        Already have an account?{" "}
        <a
          href="/auth/login"
          style={{
            color: "#10b981",
            textDecoration: "none",
            fontWeight: 600,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={handleLinkHoverEnter}
          onMouseLeave={handleLinkHoverLeave}
        >
          Sign in
        </a>
      </p>
    </form>
  );
}

