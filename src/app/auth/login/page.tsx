"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // Guard against missing user data in response
      if (!response || !response.user || !response.token) {
        throw new Error("Invalid response from server. Please try again.");
      }

      // The backend returns { token, user: { id, email, role, fullName } }
      const user = {
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        fullName: response.user.fullName,
      };

      // Store token and user info in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Set user_role cookie so the middleware can protect dashboard routes
      document.cookie = `user_role=${user.role}; path=/; max-age=${60 * 60 * 24 * 30}`;

      // Redirect based on role
      if (user.role === "tutor") {
        router.push("/dashboard/tutor");
      } else if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/student");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      console.warn("Login error:", err);
    } finally {
      setIsLoading(false);
    }
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
            Welcome Back
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "#5f646f",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            Sign in to your Mentora account
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
              }}
            >
              {error}
            </div>
          )}

          {/* Google Sign-In */}
          <GoogleSignInButton onError={setError} />

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "8px 0" }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, #e5e7eb)" }} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                whiteSpace: "nowrap",
              }}
            >
              or continue with email
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, #e5e7eb, transparent)" }} />
          </div>

          {/* Email Field */}
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

          {/* Password Field */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <label
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#374151",
                }}
              >
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                style={{
                  fontSize: 13,
                  color: "#10b981",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "color 0.3s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#059669")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#10b981")
                }
              >
                Forgot password?
              </Link>
            </div>
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
          </div>

          {/* Submit Button */}
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
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          {/* Sign Up Link */}
          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: "#6b7280",
              margin: "16px 0 0",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
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
              Sign up here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}