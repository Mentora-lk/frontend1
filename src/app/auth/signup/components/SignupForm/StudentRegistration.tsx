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

export default function StudentRegistration() {
  const router = useRouter();
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

  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "O/L", "A/L"];
  const languages = ["Sinhala", "English", "Tamil", "Bilingual"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
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

      {/* Full Name */}
      <input
        type="text"
        placeholder="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        onFocus={() => setHoveredField("fullName")}
        onBlur={() => setHoveredField(null)}
        style={getInputStyle(hoveredField, "fullName")}
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
          style={getInputStyle(hoveredField, "school")}
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
          style={getInputStyle(hoveredField, "age")}
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
          style={getSelectStyle(hoveredField, "language", !!formData.language)}
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
          style={getSelectStyle(hoveredField, "grade", !!formData.grade)}
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

      {/* Email & Address */}
      <div style={formGridStyle(2)}>
        <input
          type="email"
          placeholder="Email Address"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("email")}
          onBlur={() => setHoveredField(null)}
          style={getInputStyle(hoveredField, "email")}
          required
        />
        <input
          type="text"
          placeholder="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("address")}
          onBlur={() => setHoveredField(null)}
          style={getInputStyle(hoveredField, "address")}
          required
        />
      </div>

      {/* Password Fields */}
      <div style={formGridStyle(2)}>
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("password")}
          onBlur={() => setHoveredField(null)}
          style={getInputStyle(hoveredField, "password")}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("confirmPassword")}
          onBlur={() => setHoveredField(null)}
          style={getInputStyle(hoveredField, "confirmPassword")}
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        style={getPrimaryButtonStyle()}
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
          color: "#6b7280",
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

