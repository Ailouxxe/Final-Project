'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import AdminRoute from '../../components/AdminRoute';
import VoterFeed from '../../components/VoterFeed';
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeElections, setActiveElections] = useState([]);
  const [upcomingElections, setUpcomingElections] = useState([]);
  const [pastElections, setPastElections] = useState([]);
  const [stats, setStats] = useState({
    totalElections: 0,
    totalCandidates: 0,
    totalVotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Simpler approach to avoid composite index requirements
        const allElectionsQuery = query(
          collection(db, 'elections')
        );
        
        const [
          allElectionsSnapshot,
          candidatesSnapshot,
          votesSnapshot
        ] = await Promise.all([
          getDocs(allElectionsQuery),
          getDocs(collection(db, 'candidates')),
          getDocs(collection(db, 'votes'))
        ]);
        
        // Get all elections
        const allElections = allElectionsSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        }));
        
        // Filter elections based on dates
        const now = new Date();
        
        // Process results
        const active = [];
        const upcoming = [];
        const past = [];
        
        allElections.forEach(election => {
          const startDate = new Date(election.startDate);
          const endDate = new Date(election.endDate);
          
          if (startDate <= now && endDate >= now) {
            active.push(election);
          } else if (startDate > now) {
            upcoming.push(election);
          } else if (endDate < now) {
            past.push(election);
          }
        });
        
        // Sort the filtered elections
        active.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        upcoming.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        past.sort((a, b) => new Date(b.endDate) - new Date(a.endDate));
        
        setActiveElections(active.slice(0, 5));
        setUpcomingElections(upcoming.slice(0, 5));
        setPastElections(past.slice(0, 5));
        
        // Set stats
        setStats({
          totalElections: allElectionsSnapshot.size,
          totalCandidates: candidatesSnapshot.size,
          totalVotes: votesSnapshot.size,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="mt-3 sm:mt-0 sm:ml-4">
                <Link
                  href="/admin/elections"
                  className="mr-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Manage Elections
                </Link>
                <Link
                  href="/admin/candidates"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Manage Candidates
                </Link>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats cards */}
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-gradient-to-r from-blue-500 to-blue-700 overflow-hidden shadow-lg rounded-xl text-white">
                <div className="px-6 py-8">
                  <div className="flex items-center justify-between">
                    <dl>
                      <dt className="text-sm font-medium text-blue-100 truncate">Total Elections</dt>
                      <dd className="mt-2 text-4xl font-bold">{stats.totalElections}</dd>
                    </dl>
                    <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-purple-700 overflow-hidden shadow-lg rounded-xl text-white">
                <div className="px-6 py-8">
                  <div className="flex items-center justify-between">
                    <dl>
                      <dt className="text-sm font-medium text-purple-100 truncate">Total Candidates</dt>
                      <dd className="mt-2 text-4xl font-bold">{stats.totalCandidates}</dd>
                    </dl>
                    <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-green-700 overflow-hidden shadow-lg rounded-xl text-white">
                <div className="px-6 py-8">
                  <div className="flex items-center justify-between">
                    <dl>
                      <dt className="text-sm font-medium text-green-100 truncate">Total Votes Cast</dt>
                      <dd className="mt-2 text-4xl font-bold">{stats.totalVotes}</dd>
                    </dl>
                    <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Active elections */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="bg-green-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </span>
                  Active Elections
                </h2>
                <Link href="/admin/elections" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center">
                  <span>View all</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              {activeElections.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No active elections at the moment.</p>
                  <p className="text-gray-500 text-sm mt-1">Create a new election to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeElections.map((election) => (
                    <Link key={election.id} href={`/admin/elections/${election.id}`}>
                      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
                        <div className="h-2 bg-green-500"></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{election.title}</h3>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              Active
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{election.description}</p>
                          <div className="flex justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                            <div>
                              <span className="font-medium text-gray-600">Started:</span> {formatDate(election.startDate)}
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Ends:</span> {formatDate(election.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming elections */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Upcoming Elections
                </h2>
              </div>
              {upcomingElections.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No upcoming elections scheduled.</p>
                  <p className="text-gray-500 text-sm mt-1">Plan your next election in advance.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingElections.map((election) => (
                    <Link key={election.id} href={`/admin/elections/${election.id}`}>
                      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
                        <div className="h-2 bg-yellow-500"></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{election.title}</h3>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
                              Upcoming
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{election.description}</p>
                          <div className="flex justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                            <div>
                              <span className="font-medium text-gray-600">Starts:</span> {formatDate(election.startDate)}
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Ends:</span> {formatDate(election.endDate)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Past elections */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="bg-gray-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                  Past Elections
                </h2>
              </div>
              {pastElections.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No past elections found.</p>
                  <p className="text-gray-500 text-sm mt-1">Completed elections will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pastElections.map((election) => (
                    <Link key={election.id} href={`/admin/results?electionId=${election.id}`}>
                      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 h-full">
                        <div className="h-2 bg-gray-500"></div>
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{election.title}</h3>
                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 flex items-center">
                              <span className="w-2 h-2 bg-gray-500 rounded-full mr-1"></span>
                              Completed
                            </span>
                          </div>
                          <p className="text-gray-600 mb-4 line-clamp-2">{election.description}</p>
                          <div className="flex justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                            <div>
                              <span className="font-medium text-gray-600">Ended:</span> {formatDate(election.endDate)}
                            </div>
                            <div className="text-blue-600 font-medium flex items-center">
                              View Results 
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Voter feed */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  Real-Time Voter Feed
                </h2>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <VoterFeed limit={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
