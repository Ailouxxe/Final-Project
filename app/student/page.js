'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import VoterFeed from '../../components/VoterFeed';

export default function StudentDashboard() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchActiveElections = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const allElectionsQuery = query(collection(db, 'elections'));
        const querySnapshot = await getDocs(allElectionsQuery);
        const now = new Date();
        const electionsData = [];

        for (const doc of querySnapshot.docs) {
          const data = doc.data();
          const startDate = new Date(data.startDate);
          const endDate = new Date(data.endDate);

          if (startDate <= now && endDate >= now) {
            const electionData = { id: doc.id, ...data };
            const votesQuery = query(
              collection(db, 'votes'),
              where('electionId', '==', doc.id),
              where('studentId', '==', user.uid)
            );
            const votesSnapshot = await getDocs(votesQuery);
            electionData.hasVoted = !votesSnapshot.empty;
            electionsData.push(electionData);
          }
        }

        electionsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        setElections(electionsData);
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load elections. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveElections();
  }, [user]);

  return (
    <ProtectedRoute>
      <div
        className="relative min-h-screen bg-cover bg-center"
       style={{ backgroundImage: "url('/uploads/background1.png')" }}
      >

{/* Foreground content */}
<div className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
  <div className="px-4 py-6 sm:px-0">
    <div
      className="relative bg-cover bg-center rounded-xl shadow-lg mb-8 p-8 text-white"
      style={{ backgroundImage: "url('/uploads/background8.png')" }}
    >
      {/* Overlay - lighter */}
      <div className="absolute inset-0 bg-black/30 rounded-xl"></div>

      {/* Foreground text */}
      <div className="relative z-10">
        <h1 className="text-3xl font-bold mb-2">Student Dashboard</h1>
        <p className="text-gray-200">
          Welcome back, {user?.displayName || 'Student'}!
        </p>
        <div className="mt-4 flex items-center text-sm text-gray-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Cast your vote in active elections below</span>
        </div>
      </div>
    </div>




            {/* Active Elections */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <span className="bg-green-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
        <h2 className="text-2xl font-bold text-gray-600">Active Elections</h2>

              </div>

              {loading ? (
                <div className="flex justify-center items-center h-40 bg-white rounded-xl shadow-md p-8">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600"></div>
                    <p className="mt-4 text-gray-600 text-sm font-medium">Loading elections...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg">
                      <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-red-800">Error Loading Elections</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : elections.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-md text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-medium">No active elections available at the moment.</p>
                  <p className="text-gray-500 text-sm mt-1">Check back soon for new elections.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {elections.map((election) => (
                    <div
                      key={election.id}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 cursor-pointer h-full"
                      onClick={() => {
                        if (election.hasVoted) {
                          router.push(`/admin/results?electionId=${election.id}`);
                        } else {
                          router.push(`/student/vote/${election.id}`);
                        }
                      }}
                    >
                      <div className={`h-2 ${election.hasVoted ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">{election.title}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center ${
                            election.hasVoted ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            <span className={`w-2 h-2 rounded-full mr-1 ${
                              election.hasVoted ? 'bg-purple-500' : 'bg-green-500'
                            }`}></span>
                            {election.hasVoted ? 'Voted' : 'Active'}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{election.description}</p>
                        <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Ends:</span> {new Date(election.endDate).toLocaleDateString()}
                          </div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                            election.hasVoted 
                              ? 'text-purple-700 bg-purple-50' 
                              : 'text-green-700 bg-green-50'
                          }`}>
                            {election.hasVoted ? 'View Results' : 'Vote Now'}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Voter Feed */}
            <div className="mt-12">
              <div className="flex items-center mb-6">
                <span className="bg-blue-100 p-2 rounded-lg mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                <h2 className="text-2xl font-bold text-gray-600">Real-Time Voter Feed</h2>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
                <VoterFeed limit={10} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
