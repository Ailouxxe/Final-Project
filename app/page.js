'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import VoterFeed from '../components/VoterFeed';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="bg-white">
      {/* Hero section */}
      <section className="relative bg-blue-900 text-white">
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <img 
            src="https://pixabay.com/get/ge0f177f9a6d5fdfc02453ca7ee2532d7ad03f56e3ed7cb811fd255284331cc50eb11e50bb7fb95750004d00c457949fc54c13092e02767e3acf2ac7d96c3bd22_1280.jpg" 
            alt="University Campus" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Pateros Technological College Online Voting System
            </h1>
            <p className="text-xl mb-8">
              A secure and transparent platform for university elections
            </p>
            <div className="flex flex-wrap gap-4">
              {!user && (
                <>
                  <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300">
                    Login
                  </Link>
                  <Link href="/register" className="bg-white text-blue-900 font-bold py-3 px-6 rounded-md transition duration-300">
                    Register
                  </Link>
                </>
              )}
              {user && (
                <Link href={user.isAdmin ? "/admin" : "/student"} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition duration-300">
                  {user.isAdmin ? "Admin Dashboard" : "Student Dashboard"}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Voting</h3>
              <p className="text-gray-600">One vote per student per election with secure authentication and encryption.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Updates</h3>
              <p className="text-gray-600">See votes and results in real time with our advanced tracking system.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Elections</h3>
              <p className="text-gray-600">Support for multiple simultaneous elections with customizable settings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Live voter feed */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Live Voter Feed</h2>
          <div className="max-w-3xl mx-auto">
            <VoterFeed limit={5} />
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 bg-blue-800 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to participate in university elections?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the Pateros Technological College voting platform and make your voice heard.
          </p>
          {!user ? (
            <div className="flex justify-center gap-4">
              <Link href="/register" className="bg-white text-blue-800 hover:bg-gray-100 font-bold py-3 px-6 rounded-md transition duration-300">
                Register Now
              </Link>
              <Link href="/login" className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold py-3 px-6 rounded-md transition duration-300">
                Login
              </Link>
            </div>
          ) : (
            <Link href={user.isAdmin ? "/admin" : "/student"} className="bg-white text-blue-800 hover:bg-gray-100 font-bold py-3 px-6 rounded-md transition duration-300">
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
