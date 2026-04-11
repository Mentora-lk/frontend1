"use client";

import { useState } from "react";
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
    <form onSubmit={handleSubmit} style={formContainerStyle}>
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
        style={getPrimaryButtonStyle()}
        onMouseEnter={(e) => handleButtonHoverEnter(e, true)}
        onMouseLeave={(e) => handleButtonHoverLeave(e, true)}
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
          onMouseEnter={handleLinkHoverEnter}
          onMouseLeave={handleLinkHoverLeave}
        >
          Sign in
        </a>
      </p>
    </form>
  );
}

