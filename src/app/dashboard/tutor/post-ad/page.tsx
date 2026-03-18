"use client";

import React, { useState } from "react";

export default function PostAdPage() {
  const [form, setForm] = useState({
    name: "",
    subject: "",
    grade: "",
    fees: "",
    banner: null as File | null,
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    console.log(form);
    alert("Ad Posted!");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">

      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6">Create New Class Ad</h1>

      {/* ================= 2 COLUMN LAYOUT ================= */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* ================= LEFT SIDE (FORM) ================= */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow space-y-4"
        >

          {/* Name */}
          <div>
            <label className="text-sm font-medium">Class Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1"
              placeholder="e.g. A/L ICT 2026"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-sm font-medium">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1"
              placeholder="e.g. ICT"
            />
          </div>

          {/* Grade */}
          <div>
            <label className="text-sm font-medium">Grade / Level</label>
            <select
              name="grade"
              value={form.grade}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1"
            >
              <option value="">Select</option>
              <option>A/L</option>
              <option>O/L</option>
              <option>University</option>
            </select>
          </div>

          {/* Fees */}
          <div>
            <label className="text-sm font-medium">Class Fees (LKR)</label>
            <input
              name="fees"
              value={form.fees}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1"
              placeholder="e.g. 2500"
            />
          </div>

          {/* ================= BEAUTIFUL BANNER UPLOAD ================= */}
          <div>
            <label className="text-sm font-semibold">Banner Image</label>

            <div
              className="mt-3 border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition relative"
              onClick={() =>
                document.getElementById("bannerInput")?.click()
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                setForm({ ...form, banner: file });
              }}
            >
              {form.banner ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(form.banner)}
                    className="mx-auto max-h-52 rounded-xl shadow"
                  />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, banner: null });
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded"
                  >
                    Remove ✕
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <div className="text-4xl">📤</div>

                  <p className="font-medium text-gray-700">
                    Drag & Drop your banner
                  </p>

                  <p className="text-sm">
                    or{" "}
                    <span className="text-teal-600 font-medium">
                      Browse Files
                    </span>
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    Recommended: 1600 x 400 px
                  </p>
                </div>
              )}
            </div>

            <input
              id="bannerInput"
              type="file"
              accept="image/*"
              onChange={(e: any) =>
                setForm({ ...form, banner: e.target.files[0] })
              }
              className="hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              className="border px-4 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-teal-500 text-white px-4 py-2 rounded-lg"
            >
              Post Ad
            </button>
          </div>
        </form>

        {/* ================= RIGHT SIDE (LIVE PREVIEW) ================= */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          {/* Banner */}
          <div className="h-48 bg-gray-200">
            {form.banner ? (
              <img
                src={URL.createObjectURL(form.banner)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Banner Preview
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">

            <h2 className="text-lg font-bold">
              {form.name || "Class Title"}
            </h2>

            <p className="text-sm text-gray-500">
              {form.subject || "Subject"} • {form.grade || "Level"}
            </p>

            <p className="text-teal-600 font-semibold">
              {form.fees ? `LKR ${form.fees}` : "Price"}
            </p>

            <button className="w-full bg-teal-500 text-white py-2 rounded-lg">
              View Class
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}