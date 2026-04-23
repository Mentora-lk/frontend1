"use client";

import { useState } from "react";
import TutorRegistration from "./SignupForm/TutorRegistration";
import StudentRegistration from "./SignupForm/StudentRegistration";

type RegistrationTab = "student" | "tutor";

type RegistrationTabsProps = {
  activeTab: RegistrationTab;
  onTabChange: (tab: RegistrationTab) => void;
};

export default function RegistrationTabs({
  activeTab,
  onTabChange,
}: RegistrationTabsProps) {
  return (
    <div>
      {/* Tab Buttons */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 32,
          background: "#f3f4f6",
          padding: 8,
          borderRadius: 12,
        }}
      >
        {(["student", "tutor"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              flex: 1,
              padding: "14px 20px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
              background:
                activeTab === tab
                  ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  : "transparent",
              color: activeTab === tab ? "white" : "#6b7280",
              textTransform: "capitalize",
              boxShadow:
                activeTab === tab
                  ? "0 4px 12px rgba(16, 185, 129, 0.25)"
                  : "none",
            }}
          >
            {tab === "student" ? "I'm a Student" : "I'm a Tutor"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div
        style={{
          animation: "fadeIn 0.3s ease-in-out",
        }}
      >
        {activeTab === "student" ? (
          <StudentRegistration />
        ) : (
          <TutorRegistration />
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
