import React from "react";

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen">

      {/* HERO */}
      <div className="relative h-72 bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: "url('/banner.jpg')" }}
      >
        <div className="bg-black/50 absolute inset-0"></div>

        <div className="relative text-center text-white">
          <h1 className="text-4xl font-bold">Tutor Dashboard</h1>
          <p className="mt-2">Beginning journey with us...</p>

          <div className="mt-4 flex justify-center">
            <input
              placeholder="What you discover"
              className="px-4 py-2 rounded-l-lg text-black"
            />
            <button className="bg-green-500 px-4 py-2 rounded-r-lg">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-10">
        <h2 className="text-xl font-semibold mb-4">Explore Classes</h2>

        <div className="grid grid-cols-3 gap-6">

          <div className="bg-white p-4 rounded-xl shadow">
            <img src="/class1.jpg" className="rounded-lg mb-2" />
            <h3 className="font-semibold">Advanced Level Physics</h3>
            <p className="text-sm text-gray-500">Thilak Perera</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <img src="/class2.jpg" className="rounded-lg mb-2" />
            <h3 className="font-semibold">Advanced Level ICT</h3>
            <p className="text-sm text-gray-500">Nimesh</p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <img src="/class3.jpg" className="rounded-lg mb-2" />
            <h3 className="font-semibold">Web Development</h3>
            <p className="text-sm text-gray-500">Ravi</p>
          </div>

        </div>
      </div>

    </div>
  );
}