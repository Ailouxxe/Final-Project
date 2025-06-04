'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return pathname === path;
  };

  if (!mounted) return null;

  return (
<nav className="text-white shadow-md bg-green-gradient bg-[length:400%_400%] animate-gradient-flow transition-all duration-200 font-sans">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center space-x-2">
              <img
                src="/uploads/ptclogo.png" // Replace with your actual logo path
                alt="PTC Logo"
                className="h-14 w-14 object-contain"
              />
              <span className="text-xl font-bold">PTC Elections</span>
            </Link>
<div className="hidden md:ml-6 md:flex md:space-x-4">
  <Link
    href="/"
    className={`px-3 py-2 rounded-md text-lg font-medium ${
      isActive('/') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
    }`}
  >
    Home
  </Link>

  {user && !user.isAdmin && (
    <Link
      href="/student"
      className={`px-3 py-2 rounded-md text-lg font-medium ${
        isActive('/student') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
      }`}
    >
      Dashboard
    </Link>
  )}

  {user && user.isAdmin && (
    <>
      <Link
        href="/admin"
        className={`px-3 py-2 rounded-md text-lg font-medium ${
          isActive('/admin') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
        }`}
      >
        Dashboard
      </Link>
      <Link
        href="/admin/elections"
        className={`px-3 py-2 rounded-md text-lg font-medium ${
          pathname.startsWith('/admin/elections') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
        }`}
      >
        Elections
      </Link>
      <Link
        href="/admin/candidates"
        className={`px-3 py-2 rounded-md text-lg font-medium ${
          pathname.startsWith('/admin/candidates') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
        }`}
      >
        Candidates
      </Link>
      <Link
        href="/admin/results"
        className={`px-3 py-2 rounded-md text-lg font-medium ${
          pathname.startsWith('/admin/results') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
        }`}
      >
        Results
      </Link>
    </>
  )}
</div>

         </div>
<div className="hidden md:ml-6 md:flex md:items-center">
  {loading ? (
    <div className="animate-pulse px-3 py-2 rounded-md text-lg font-medium text-gray-200">
      Loading...
    </div>
  ) : user ? (
    <div className="ml-3 relative flex items-center">
      <span className="mr-4 text-lg">{user.displayName || user.fullName || user.email}</span>
      <button
        onClick={handleLogout}
        className="px-3 py-2 rounded-md text-lg font-medium bg-red-600 text-white hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  ) : (
    <div className="flex space-x-4">
      <Link
        href="/login"
        className={`px-3 py-2 rounded-md text-lg font-medium ${
          isActive('/login') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
        }`}
      >
        Login
      </Link>
      <Link
        href="/register"
        className="px-3 py-2 rounded-md text-lg font-medium bg-yellow-600 text-white hover:bg-yellow-800"
      >
        Register
      </Link>
    </div>
  )}
</div>


          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-yellow-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {user && !user.isAdmin && (
              <Link
                href="/student"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/student') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {user && user.isAdmin && (
              <>
                <Link
                  href="/admin"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/admin') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/elections"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith('/admin/elections') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Elections
                </Link>
                <Link
                  href="/admin/candidates"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith('/admin/candidates') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Candidates
                </Link>
                <Link
                  href="/admin/results"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith('/admin/results') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Results
                </Link>
              </>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-yellow-700">
            {loading ? (
              <div className="animate-pulse px-3 py-2 rounded-md text-base font-medium text-gray-200">
                Loading...
              </div>
            ) : user ? (
              <div className="px-2">
                <div className="px-3 py-2 font-medium text-sm text-white">
                  {user.displayName || user.fullName || user.email}
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="mt-2 block w-full px-3 py-2 rounded-md text-base font-medium bg-red-600 text-white hover:bg-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-2 space-y-2">
                <Link
                  href="/login"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/login') ? 'bg-yellow-600 text-white' : 'text-gray-200 hover:bg-yellow-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-yellow-600 text-white hover:bg-yellow-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
