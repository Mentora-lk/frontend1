"use client";

import React from "react";

export default function EditProfilePage() {
  return (
    <div className="bg-gray-100 min-h-screen p-8">

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Edit Your Profile</h1>
          <p className="text-gray-500 text-sm">
            Update your professional information and availability for students.
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg">Cancel</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
            Save Changes
          </button>
        </div>
      </div>

      {/* ================= GENERAL INFO ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4 mb-6">
        <h2 className="font-semibold text-lg">General Information</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Full Name"
            className="border p-2 rounded-lg"
          />
          <input
            placeholder="Professional Headline"
            className="border p-2 rounded-lg"
          />
        </div>

        <textarea
          placeholder="Bio"
          className="border p-2 rounded-lg w-full h-28"
        />

        <input
          placeholder="Contact Number"
          className="border p-2 rounded-lg w-full"
        />
      </div>

      {/* ================= MEDIA ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4 mb-6">
        <h2 className="font-semibold text-lg">Media & Visuals</h2>

        {/* Banner */}
        <div className="border rounded-lg p-6 text-center">
          <p className="text-gray-500">Change Banner Image</p>
        </div>

        {/* Profile Pic */}
        <div className="flex items-center gap-4">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            className="w-16 h-16 rounded-full"
          />

          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-3 py-1 rounded">
              Upload
            </button>
            <button className="border px-3 py-1 rounded">
              Remove
            </button>
          </div>
        </div>
      </div>

      {/* ================= TEACHING ================= */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4 mb-6">
        <h2 className="font-semibold text-lg">Teaching Details</h2>

        <input
          placeholder="Primary Subject"
          className="border p-2 rounded-lg w-full"
        />

        {/* Medium */}
        <div className="flex gap-3">
          <button className="border px-3 py-1 rounded">English</button>
          <button className="border px-3 py-1 rounded">Sinhala</button>
          <button className="border px-3 py-1 rounded">Tamil</button>
        </div>

        <input
          placeholder="Hourly Rate (LKR)"
          className="border p-2 rounded-lg w-full"
        />
      </div>

      {/* ================= SCHEDULE ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="font-semibold text-lg mb-4">
          Availability Schedule
        </h2>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="font-semibold">{day}</div>
          ))}

          {[...Array(21)].map((_, i) => (
            <div
              key={i}
              className="h-8 border rounded cursor-pointer hover:bg-blue-100"
            />
          ))}
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 border rounded-lg">
          Discard Changes
        </button>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Update Profile
        </button>
      </div>

    </div>
  );
}