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
        const now = new Date().toISOString();
        
        // Fetch active elections
        const activeElectionsQuery = query(
          collection(db, 'elections'),
          where('startDate', '<=', now),
          where('endDate', '>=', now),
          orderBy('startDate', 'desc'),
          limit(5)
        );
        
        // Fetch upcoming elections
        const upcomingElectionsQuery = query(
          collection(db, 'elections'),
          where('startDate', '>', now),
          orderBy('startDate', 'asc'),
          limit(5)
        );
        
        // Fetch past elections
        const pastElectionsQuery = query(
          collection(db, 'elections'),
          where('endDate', '<', now),
          orderBy('endDate', 'desc'),
          limit(5)
        );
        
        // Execute all queries in parallel
        const [
          activeElectionsSnapshot,
          upcomingElectionsSnapshot,
          pastElectionsSnapshot,
          candidatesSnapshot,
          votesSnapshot,
          allElectionsSnapshot
        ] = await Promise.all([
          getDocs(activeElectionsQuery),
          getDocs(upcomingElectionsQuery),
          getDocs(pastElectionsQuery),
          getDocs(collection(db, 'candidates')),
          getDocs(collection(db, 'votes')),
          getDocs(collection(db, 'elections'))
        ]);
        
        // Process results
        setActiveElections(activeElectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setUpcomingElections(upcomingElectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setPastElections(pastElectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        
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
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Elections</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalElections}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Candidates</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalCandidates}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Votes Cast</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalVotes}</dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Active elections */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Active Elections</h2>
                <Link href="/admin/elections" className="text-blue-600 hover:text-blue-800">
                  View all
                </Link>
              </div>
              {activeElections.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">No active elections at the moment.</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {activeElections.map((election) => (
                      <li key={election.id}>
                        <Link href={`/admin/elections/${election.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="ml-3">
                                  <p className="text-lg font-medium text-blue-600 truncate">{election.title}</p>
                                  <p className="mt-1 text-sm text-gray-500 truncate">{election.description}</p>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Active
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <span>Started {formatDate(election.startDate)}</span>
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <span>Ends {formatDate(election.endDate)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Upcoming elections */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Upcoming Elections</h2>
              </div>
              {upcomingElections.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">No upcoming elections scheduled.</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {upcomingElections.map((election) => (
                      <li key={election.id}>
                        <Link href={`/admin/elections/${election.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="ml-3">
                                  <p className="text-lg font-medium text-gray-900 truncate">{election.title}</p>
                                  <p className="mt-1 text-sm text-gray-500 truncate">{election.description}</p>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                  Upcoming
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <span>Starts {formatDate(election.startDate)}</span>
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <span>Ends {formatDate(election.endDate)}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Past elections */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Past Elections</h2>
              </div>
              {pastElections.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">No past elections found.</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {pastElections.map((election) => (
                      <li key={election.id}>
                        <Link href={`/admin/results?electionId=${election.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="ml-3">
                                  <p className="text-lg font-medium text-gray-900 truncate">{election.title}</p>
                                  <p className="mt-1 text-sm text-gray-500 truncate">{election.description}</p>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className="inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  Completed
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="flex items-center text-sm text-gray-500">
                                <span>Ended {formatDate(election.endDate)}</span>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-blue-600 sm:mt-0">
                                View Results →
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Voter feed */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Real-Time Voter Feed</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <VoterFeed limit={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
