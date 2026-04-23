"use client";

import { useState } from "react";

export default function StudentRegistration() {
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

  const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "O/L", "A/L"];
  const languages = ["Sinhala", "English", "Tamil", "Bilingual"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Student Registration:", formData);
    // TODO: Add API call here
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Full Name */}
      <input
        type="text"
        placeholder="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleInputChange}
        onFocus={() => setHoveredField("fullName")}
        onBlur={() => setHoveredField(null)}
        style={{
          padding: "12px 16px",
          fontSize: 14,
          border: hoveredField === "fullName" ? "2px solid #10b981" : "1px solid #d1d5db",
          borderRadius: 10,
          background: "#ffffff",
          outline: "none",
          transition: "all 0.3s ease",
          boxShadow:
            hoveredField === "fullName"
              ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
              : "none",
        }}
        required
      />

      {/* School/Institute & Age */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <input
          type="text"
          placeholder="School / Institute"
          name="school"
          value={formData.school}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("school")}
          onBlur={() => setHoveredField(null)}
          style={{
            padding: "12px 16px",
            fontSize: 14,
            border: hoveredField === "school" ? "2px solid #10b981" : "1px solid #d1d5db",
            borderRadius: 10,
            background: "#ffffff",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow:
              hoveredField === "school"
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
          }}
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
          style={{
            padding: "12px 16px",
            fontSize: 14,
            border: hoveredField === "age" ? "2px solid #10b981" : "1px solid #d1d5db",
            borderRadius: 10,
            background: "#ffffff",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow:
              hoveredField === "age"
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
          }}
          required
        />
      </div>

      {/* Language & Grade */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <select
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("language")}
          onBlur={() => setHoveredField(null)}
          style={{
            padding: "12px 16px",
            fontSize: 14,
            border: hoveredField === "language" ? "2px solid #10b981" : "1px solid #d1d5db",
            borderRadius: 10,
            background: "#ffffff",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow:
              hoveredField === "language"
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
            cursor: "pointer",
            color: formData.language ? "#111827" : "#9ca3af",
          }}
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
          style={{
            padding: "12px 16px",
            fontSize: 14,
            border: hoveredField === "grade" ? "2px solid #10b981" : "1px solid #d1d5db",
            borderRadius: 10,
            background: "#ffffff",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow:
              hoveredField === "grade"
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
            cursor: "pointer",
            color: formData.grade ? "#111827" : "#9ca3af",
          }}
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <input
          type="email"
          placeholder="Email Address"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("email")}
          onBlur={() => setHoveredField(null)}
          style={{
            padding: "12px 16px",
            fontSize: 14,
            border: hoveredField === "email" ? "2px solid #10b981" : "1px solid #d1d5db",
            borderRadius: 10,
            background: "#ffffff",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow:
              hoveredField === "email"
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
          }}
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
          style={{
            padding: "12px 16px",
            fontSize: 14,
            border: hoveredField === "address" ? "2px solid #10b981" : "1px solid #d1d5db",
            borderRadius: 10,
            background: "#ffffff",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow:
              hoveredField === "address"
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
          }}
          required
        />
      </div>

      {/* Password Fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          onFocus={() => setHoveredField("password")}
          onBlur={() => setHoveredField(null)}
          style={{
            padding: "12px 16px",
            fontSize: 14,
            border: hoveredField === "password" ? "2px solid #10b981" : "1px solid #d1d5db",
            borderRadius: 10,
            background: "#ffffff",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow:
              hoveredField === "password"
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
          }}
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
          style={{
            padding: "12px 16px",
            fontSize: 14,
            border: hoveredField === "confirmPassword" ? "2px solid #10b981" : "1px solid #d1d5db",
            borderRadius: 10,
            background: "#ffffff",
            outline: "none",
            transition: "all 0.3s ease",
            boxShadow:
              hoveredField === "confirmPassword"
                ? "0 0 0 3px rgba(16, 185, 129, 0.1)"
                : "none",
          }}
          required
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        style={{
          padding: "14px 24px",
          fontSize: 15,
          fontWeight: 700,
          color: "white",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          marginTop: 12,
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.transform = "translateY(-2px)";
          (e.target as HTMLButtonElement).style.boxShadow =
            "0 8px 25px rgba(16, 185, 129, 0.4)";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.transform = "translateY(0)";
          (e.target as HTMLButtonElement).style.boxShadow =
            "0 4px 15px rgba(16, 185, 129, 0.3)";
        }}
      >
        Create Account
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
          onMouseEnter={(e) => {
            (e.target as HTMLAnchorElement).style.color = "#059669";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLAnchorElement).style.color = "#10b981";
          }}
        >
          Sign in
        </a>
      </p>
    </form>
  );
}

