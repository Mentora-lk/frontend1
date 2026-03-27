"use client";

import Link from "next/link";
import Navbar from "@/components/navbar/Navbar";
export default function HomePage() {
  return (
    <div className="bg-gray-50">

      {/* HERO */}
      <div className="h-[500px] bg-[url('/banner.jpg')] bg-cover bg-center flex items-center justify-center relative">
        <div className="absolute inset-0 bg-black/60"></div>

        <div className="relative text-center text-white max-w-2xl">
          <h1 className="text-5xl font-bold">
            Find Your Best Tutor
          </h1>

          <p className="mt-3 text-gray-300">
            Beginning journey with us.....
          </p>

          {/* SEARCH */}
          <div className="mt-6 flex justify-center">
            <input
              placeholder="What you discover"
              className="px-5 py-3 w-96 rounded-l-xl text-black"
            />
            <button className="bg-green-500 px-6 py-3 rounded-r-xl">
              Search
            </button>
          </div>

          {/* TAGS */}
          <div className="mt-4 flex justify-center gap-3 flex-wrap">
            {["IT", "Music", "Physics", "Accounting", "English"].map(
              (tag) => (
                <span
                  key={tag}
                  className="border px-3 py-1 rounded-full text-sm hover:bg-white hover:text-black cursor-pointer"
                >
                  {tag}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {/* FILTER + CARDS SECTION */}
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-6 p-10">

        {/* FILTER */}
        <div className="bg-white p-5 rounded-xl shadow space-y-4">
          <h2 className="font-semibold">Filters</h2>

          <select className="w-full border p-2 rounded">
            <option>All District</option>
          </select>

          <div>
            <p className="text-sm">Price Range</p>
            <input type="range" className="w-full" />
          </div>

          <div>
            <p className="text-sm">Minimum Rating</p>
            <p>⭐ 4.0+</p>
          </div>

          <div>
            <p className="text-sm">Availability</p>
            <label className="block">Weekends</label>
            <label className="block">Evening</label>
          </div>

          <button className="w-full bg-gray-200 py-2 rounded">
            Clear All
          </button>
        </div>

        {/* CARDS */}
        <div className="col-span-3 grid grid-cols-3 gap-6">

          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="bg-white rounded-xl shadow p-4 hover:shadow-lg"
            >
              <img
                src={`/class${(item % 3) + 1}.jpg`}
                className="rounded-lg h-32 w-full object-cover"
              />

              <h3 className="font-semibold mt-2">
                Sample Class Title
              </h3>

              <p className="text-sm text-gray-500">
                by Tutor Name
              </p>

              <p className="text-green-600 font-medium">
                Rs. 2500
              </p>

              <p className="text-yellow-500">⭐ 4.5</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div className="grid grid-cols-3 gap-6 text-center p-10 bg-gray-100">
        <div>
          <h3 className="font-semibold">Nearby tutor</h3>
          <p className="text-sm text-gray-500">
            Find tutors near your location
          </p>
        </div>

        <div>
          <h3 className="font-semibold">Learn from the best</h3>
          <p className="text-sm text-gray-500">
            Select best tutors easily
          </p>
        </div>

        <div>
          <h3 className="font-semibold">No subscription fees</h3>
          <p className="text-sm text-gray-500">
            Platform is free to use
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-200 p-10 grid grid-cols-4 gap-6 text-sm">
        <div>
          <h4 className="font-semibold">Categories</h4>
          <p>ICT</p>
          <p>Music</p>
          <p>Business</p>
        </div>

        <div>
          <h4 className="font-semibold">About</h4>
          <p>Our Courses</p>
          <p>Privacy Policy</p>
        </div>

        <div>
          <h4 className="font-semibold">Support</h4>
          <p>FAQ</p>
          <p>Contact</p>
        </div>

        <div>
          <h4 className="font-semibold">Share</h4>
          <p>Facebook</p>
          <p>Twitter</p>
        </div>
      </footer>

    </div>
  );
}