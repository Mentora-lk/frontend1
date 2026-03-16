import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 backdrop-blur-md bg-white/80 border-b shadow-sm z-50">

      <div className="max-w-7xl mx-auto flex items-center px-8 py-4">

        {/* Logo */}
        <Link href="/" className="text-2xl font-extrabold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          Mentora.lk
        </Link>

        {/* Navigation */}
        <div className="flex-1 flex justify-center space-x-8 text-gray-700 font-medium">

          <Link
            href="/"
            className="hover:text-green-600 transition-colors duration-300"
          >
            Home
          </Link>

          <Link
            href="/profile"
            className="hover:text-green-600 transition-colors duration-300"
          >
            Profile
          </Link>

          <Link
            href="/dashboard/tutor"
            className="hover:text-green-600 transition-colors duration-300"
          >
            Teaching
          </Link>

          <Link
            href="/community"
            className="hover:text-green-600 transition-colors duration-300"
          >
            Community
          </Link>

          <Link
            href="/contact"
            className="hover:text-green-600 transition-colors duration-300"
          >
            Contact
          </Link>

        </div>

      </div>

    </nav>
  );
}