"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  getInputStyle,
  getSelectStyle,
  getStaticInputStyle,
  cardStyle,
  cardLightStyle,
  fileUploadAreaStyle,
  handleButtonHoverEnter,
  handleButtonHoverLeave,
} from "@/utils/formStyles";
import { authService } from "@/services/authService";

type Qualification = {
  id: string;
  university: string;
  degree: string;
  year: string;
  experience: string;
};

type TimeSlot = {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
};

export default function TutorRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: About
    fullName: "",
    dateOfBirth: "",
    gender: "",
    city: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
    // Step 2: Pictures
    profilePicture: null as File | null,
    profileBanner: null as File | null,
    // Step 3: Education
    qualifications: [] as Qualification[],
    // Step 4: Teaching Profile
    subjects: "",
    gradeRange: "",
    level: "",
    medium: "",
    classTypes: [] as string[],
    aboutYourself: "",
    teachingLocation: "",
    timeSlots: [] as TimeSlot[],
    instituteLocation: "",
    instituteName: "",
  });

  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [previewPicture, setPreviewPicture] = useState<string | null>(null);
  const [previewBanner, setPreviewBanner] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [newQualification, setNewQualification] = useState<Qualification>({
    id: "",
    university: "",
    degree: "",
    year: "",
    experience: "",
  });

  const genders = ["Male", "Female", "Other"];
  const levels = ["G.C.E. ADVANCED LEVEL", "G.C.E. ORDINARY LEVEL", "Grade 6-9", "University"];
  const mediums = ["SINHALA", "ENGLISH", "TAMIL"];
  const classTypeOptions = ["Individual Class", "Group Class", "Hall Class"];
  const teachingLocations = ["Home", "Student's Home", "Online", "Institute"];
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const yearOptions = Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i);

  const [newTimeSlot, setNewTimeSlot] = useState<TimeSlot>({
    id: "",
    day: "",
    startTime: "",
    endTime: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profilePicture" | "profileBanner"
  ) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, [type]: file }));
      const reader = new FileReader();
      reader.onload = () => {
        if (type === "profilePicture") setPreviewPicture(reader.result as string);
        else setPreviewBanner(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addQualification = () => {
    if (newQualification.university && newQualification.degree && newQualification.year) {
      setFormData((prev) => ({
        ...prev,
        qualifications: [
          ...prev.qualifications,
          { ...newQualification, id: Date.now().toString() },
        ],
      }));
      setNewQualification({ id: "", university: "", degree: "", year: "", experience: "" });
    }
  };

  const removeQualification = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      qualifications: prev.qualifications.filter((q) => q.id !== id),
    }));
  };

  const addTimeSlot = () => {
    if (newTimeSlot.day && newTimeSlot.startTime && newTimeSlot.endTime) {
      setFormData((prev) => ({
        ...prev,
        timeSlots: [...prev.timeSlots, { ...newTimeSlot, id: Date.now().toString() }],
      }));
      setNewTimeSlot({ id: "", day: "", startTime: "", endTime: "" });
    }
  };

  const removeTimeSlot = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((t) => t.id !== id),
    }));
  };

  const toggleClassType = (classType: string) => {
    setFormData((prev) => ({
      ...prev,
      classTypes: prev.classTypes.includes(classType)
        ? prev.classTypes.filter((c) => c !== classType)
        : [...prev.classTypes, classType],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      const submissionData = new FormData();
      submissionData.append("fullName", formData.fullName);
      submissionData.append("dob", formData.dateOfBirth);
      submissionData.append("gender", formData.gender);
      submissionData.append("city", formData.city);
      submissionData.append("email", formData.email);
      submissionData.append("address", formData.address);
      submissionData.append("password", formData.password);
      
      if (formData.profilePicture) {
        submissionData.append("profilePicture", formData.profilePicture);
      }
      if (formData.profileBanner) {
        submissionData.append("banner", formData.profileBanner);
      }

      // Extract the first qualification to match backend schema currently
      if (formData.qualifications.length > 0) {
        const firstQual = formData.qualifications[0];
        submissionData.append("university", firstQual.university);
        submissionData.append("degreeTitle", firstQual.degree);
        submissionData.append("graduationYear", firstQual.year);
        submissionData.append("experience", firstQual.experience || "");
      }

      submissionData.append("subjects", formData.subjects);
      submissionData.append("gradeRange", formData.gradeRange);
      submissionData.append("level", formData.level);
      submissionData.append("medium", formData.medium);
      submissionData.append("classType", formData.classTypes.join(", "));
      submissionData.append("description", formData.aboutYourself);

      const response = await authService.registerTutorFormData(submissionData);

      // Guard against missing user data in response
      if (!response || !response.user || !response.token) {
        throw new Error("Invalid response from server. Please try again.");
      }

      // Extract user info from response (backend returns { token, user: { id, email, role }, profile })
      const user = { id: response.user.id, email: response.user.email, role: response.user.role };

      // Store token and user info
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set user_role cookie so middleware allows dashboard access
      document.cookie = `user_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 30}`;

      // Redirect to tutor dashboard
      router.push("/dashboard/tutor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.dateOfBirth && formData.gender && formData.city && formData.email && formData.address && formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;
      case 2:
        return true;
      case 3:
        return formData.qualifications.length > 0;
      case 4:
        return formData.subjects && formData.gradeRange && formData.level && formData.medium && formData.classTypes.length > 0;
      default:
        return false;
    }
  };

  type TimeSlot = {
    id: string;
    day: string;
    startTime: string;
    endTime: string;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Step Indicator */}
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        {[1, 2, 3, 4].map((step) => (
          <div key={step} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background:
                  currentStep >= step
                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                    : "#e5e7eb",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.3s ease",
              }}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                style={{
                  width: 40,
                  height: 2,
                  background:
                    currentStep > step
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "#e5e7eb",
                  transition: "all 0.3s ease",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div style={{ display: "flex", justifyContent: "space-around", fontSize: 12, fontWeight: 600, color: "#6b7280" }}>
        <span>About</span>
        <span>Pictures</span>
        <span>Education</span>
        <span>Teaching</span>
      </div>

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

      {/* Step 1: About */}
      {currentStep === 1 && (
        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              onFocus={() => setHoveredField("fullName")}
              onBlur={() => setHoveredField(null)}
              placeholder="Legal name"
              style={getInputStyle(hoveredField, "fullName")}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              onFocus={() => setHoveredField("dateOfBirth")}
              onBlur={() => setHoveredField(null)}
              style={getInputStyle(hoveredField, "dateOfBirth")}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              onFocus={() => setHoveredField("gender")}
              onBlur={() => setHoveredField(null)}
              style={getSelectStyle(hoveredField, "gender", !!formData.gender)}
              required
            >
              <option value="">Select gender</option>
              {genders.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              onFocus={() => setHoveredField("city")}
              onBlur={() => setHoveredField(null)}
              placeholder="Current city"
              style={getInputStyle(hoveredField, "city")}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={() => setHoveredField("email")}
              onBlur={() => setHoveredField(null)}
              placeholder="Contact email"
              style={getInputStyle(hoveredField, "email")}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              onFocus={() => setHoveredField("address")}
              onBlur={() => setHoveredField(null)}
              placeholder="Full residential address"
              style={getInputStyle(hoveredField, "address")}
              required
            />
          </div>

          {/* Password Fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setHoveredField("password")}
                onBlur={() => setHoveredField(null)}
                placeholder="Create a password"
                style={getInputStyle(hoveredField, "password")}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => setHoveredField("confirmPassword")}
                onBlur={() => setHoveredField(null)}
                placeholder="Confirm password"
                style={getInputStyle(hoveredField, "confirmPassword")}
                required
              />
            </div>
          </div>
        </form>
      )}

      {/* Step 2: Pictures & Media */}
      {currentStep === 2 && (
        <form style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Profile Picture (JPG, PNG - Min 400x400px)
            </label>
            <div
              style={{
                border: "2px dashed #10b981",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFileChange(e, "profilePicture")}
                style={{ display: "none" }}
                id="profilePicture"
              />
              <label htmlFor="profilePicture" style={{ cursor: "pointer", display: "block" }}>
                {previewPicture ? (
                  <div>
                    <img
                      src={previewPicture}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: 150, borderRadius: 8 }}
                    />
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#10b981", margin: "0 0 8px" }}>
                      📷 Upload Profile Picture
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                      Click to select or drag and drop
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Profile Banner (Recommended 1200x300px)
            </label>
            <div
              style={{
                border: "2px dashed #10b981",
                borderRadius: 12,
                padding: 32,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => handleFileChange(e, "profileBanner")}
                style={{ display: "none" }}
                id="profileBanner"
              />
              <label htmlFor="profileBanner" style={{ cursor: "pointer", display: "block" }}>
                {previewBanner ? (
                  <div>
                    <img
                      src={previewBanner}
                      alt="Preview"
                      style={{ maxWidth: "100%", maxHeight: 100, borderRadius: 8 }}
                    />
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 8 }}>
                      Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#10b981", margin: "0 0 8px" }}>
                      🖼️ Upload Banner
                    </p>
                    <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
                      Click to select or drag and drop
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </form>
      )}

      {/* Step 3: Education */}
      {currentStep === 3 && (
        <form style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              Add Qualification
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="text"
                placeholder="University / Institute Name"
                value={newQualification.university}
                onChange={(e) =>
                  setNewQualification({ ...newQualification, university: e.target.value })
                }
                style={getStaticInputStyle()}
              />
              <input
                type="text"
                placeholder="Degree / Certificate Title"
                value={newQualification.degree}
                onChange={(e) =>
                  setNewQualification({ ...newQualification, degree: e.target.value })
                }
                style={getStaticInputStyle()}
              />
              <select
                value={newQualification.year}
                onChange={(e) =>
                  setNewQualification({ ...newQualification, year: e.target.value })
                }
                style={getStaticInputStyle({ cursor: "pointer" })}
              >
                <option value="">Year of Graduation</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <textarea
                placeholder="Working Experience (optional)"
                value={newQualification.experience}
                onChange={(e) =>
                  setNewQualification({ ...newQualification, experience: e.target.value })
                }
                style={getStaticInputStyle({ minHeight: 80 })}
              />
              <button
                type="button"
                onClick={addQualification}
                style={{
                  padding: "10px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "white",
                  background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.transform = "translateY(-2px)";
                  (e.target as HTMLButtonElement).style.boxShadow = "0 8px 12px rgba(16, 185, 129, 0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.transform = "translateY(0)";
                  (e.target as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                + Add Qualification
              </button>
            </div>
          </div>

          {formData.qualifications.map((qual) => (
            <div
              key={qual.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
                background: "#f9fafb",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600 }}>
                    {qual.university}
                  </h4>
                  <p style={{ margin: "0 0 4px", fontSize: 12, color: "#6b7280" }}>
                    {qual.degree}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{qual.year}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeQualification(qual.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: 18,
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </form>
      )}

      {/* Step 4: Teaching Profile */}
      {currentStep === 4 && (
        <form style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Subjects You Teach
            </label>
            <input
              type="text"
              name="subjects"
              value={formData.subjects}
              onChange={handleInputChange}
              placeholder="e.g., Mathematics, Physics, Chemistry"
              style={getInputStyle(hoveredField, "subjects")}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Grade Range
            </label>
            <input
              type="text"
              name="gradeRange"
              value={formData.gradeRange}
              onChange={handleInputChange}
              placeholder="e.g., Grade 10-13"
              style={getInputStyle(hoveredField, "gradeRange")}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Level
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              onFocus={() => setHoveredField("level")}
              onBlur={() => setHoveredField(null)}
              style={getSelectStyle(hoveredField, "level", !!formData.level)}
              required
            >
              <option value="">Select Level</option>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Medium of Instruction
            </label>
            <select
              name="medium"
              value={formData.medium}
              onChange={handleInputChange}
              onFocus={() => setHoveredField("medium")}
              onBlur={() => setHoveredField(null)}
              style={getSelectStyle(hoveredField, "medium", !!formData.medium)}
              required
            >
              <option value="">Select Medium</option>
              {mediums.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Class Type
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {classTypeOptions.map((classType) => (
                <label
                  key={classType}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    transition: "all 0.2s ease",
                    background: formData.classTypes.includes(classType)
                      ? "rgba(16, 185, 129, 0.05)"
                      : "transparent",
                    borderColor: formData.classTypes.includes(classType) ? "#10b981" : "#e5e7eb",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.classTypes.includes(classType)}
                    onChange={() => toggleClassType(classType)}
                    style={{ cursor: "pointer", accentColor: "#10b981" }}
                  />
                  <span style={{ fontSize: 13, color: "#4b5563" }}>{classType}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              Describe Yourself
            </label>
            <textarea
              name="aboutYourself"
              value={formData.aboutYourself}
              onChange={handleInputChange}
              placeholder="Share your experience and teaching methods"
              style={{
                padding: "12px 16px",
                fontSize: 14,
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                minHeight: 100,
                outline: "none",
              }}
            />
          </div>

          {formData.classTypes.includes("Individual Class") && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Teaching Location
                </label>
                <select
                  name="teachingLocation"
                  value={formData.teachingLocation}
                  onChange={handleInputChange}
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    border: "1px solid #e5e7eb",
                    borderRadius: 10,
                    cursor: "pointer",
                  }}
                >
                  <option value="">Select Location</option>
                  {teachingLocations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                  Schedule Time Slots
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <select
                    value={newTimeSlot.day}
                    onChange={(e) =>
                      setNewTimeSlot({ ...newTimeSlot, day: e.target.value })
                    }
                    style={getStaticInputStyle({ padding: "10px 12px", fontSize: 13, cursor: "pointer", borderRadius: 8 })}
                  >
                    <option value="">Select Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <input
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={(e) =>
                      setNewTimeSlot({ ...newTimeSlot, startTime: e.target.value })
                    }
                    style={getStaticInputStyle({ padding: "10px 12px", fontSize: 13, borderRadius: 8 })}
                  />
                  <input
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={(e) =>
                      setNewTimeSlot({ ...newTimeSlot, endTime: e.target.value })
                    }
                    style={getStaticInputStyle({ padding: "10px 12px", fontSize: 13, borderRadius: 8 })}
                  />
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    style={{
                      padding: "10px 16px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "white",
                      background: "#10b981",
                      border: "none",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                  >
                    + Add Time Slot
                  </button>
                </div>

                {formData.timeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px",
                      background: "#f9fafb",
                      borderRadius: 8,
                      marginTop: 8,
                      fontSize: 12,
                    }}
                  >
                    <span>
                      {slot.day}: {slot.startTime} - {slot.endTime}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(slot.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {(formData.classTypes.includes("Group Class") ||
            formData.classTypes.includes("Hall Class")) && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Institute Name
                </label>
                <input
                  type="text"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleInputChange}
                  placeholder="Institute name"
                  style={getStaticInputStyle()}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
                  Institute Location
                </label>
                <input
                  type="text"
                  name="instituteLocation"
                  value={formData.instituteLocation}
                  onChange={handleInputChange}
                  placeholder="Institute location"
                  style={getStaticInputStyle()}
                />
              </div>
            </>
          )}
        </form>
      )}

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "space-between",
          marginTop: 24,
        }}
      >
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          style={{
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 600,
            color: currentStep === 1 ? "#9ca3af" : "#10b981",
            background: currentStep === 1 ? "#f3f4f6" : "white",
            border: currentStep === 1 ? "1px solid #d1d5db" : "2px solid #10b981",
            borderRadius: 10,
            cursor: currentStep === 1 ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (currentStep !== 1) {
              (e.target as HTMLButtonElement).style.background = "#f0fdf4";
            }
          }}
          onMouseLeave={(e) => {
            if (currentStep !== 1) {
              (e.target as HTMLButtonElement).style.background = "white";
            }
          }}
        >
          ← Previous
        </button>

        {currentStep < 4 ? (
          <button
            onClick={() => {
              if (canProceedToNextStep()) {
                setCurrentStep(currentStep + 1);
              }
            }}
            disabled={!canProceedToNextStep()}
            style={{
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 600,
              color: "white",
              background:
                canProceedToNextStep()
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "#d1d5db",
              border: "none",
              borderRadius: 10,
              cursor: canProceedToNextStep() ? "pointer" : "not-allowed",
              transition: "all 0.2s ease",
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            style={{
              padding: "12px 24px",
              fontSize: 14,
              fontWeight: 700,
              color: "white",
              background: isLoading
                ? "#d1d5db"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              borderRadius: 10,
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {isLoading ? "Completing Registration..." : "Complete Registration"}
          </button>
        )}
      </div>
    </div>
  );
}
