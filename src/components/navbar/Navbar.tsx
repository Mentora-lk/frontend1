'use client';

import Link from 'next/link';

interface NavbarProps {
  scrollY?: number;
}

export default function Navbar({ scrollY = 0 }: NavbarProps) {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">Mentora.lk</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-8">
            <Link href="/classes/search" className="text-gray-700 hover:text-blue-600">
              Classes
            </Link>
            <Link href="/tutors/list" className="text-gray-700 hover:text-blue-600">
              Tutors
            </Link>
            <Link href="#" className="text-gray-700 hover:text-blue-600">
              About
            </Link>
          </div>

          {/* Auth Links */}
          <div className="flex space-x-4">
            <Link href="/auth/login" className="px-4 py-2 text-blue-600 hover:text-blue-700">
              Login
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
