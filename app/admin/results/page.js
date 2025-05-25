'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import AdminRoute from '../../../components/AdminRoute';
import ResultsChart from '../../../components/ResultsChart';
import VoterFeed from '../../../components/VoterFeed';
import Link from 'next/link';

function ResultsPageContent() {
  const [election, setElection] = useState(null);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voteStats, setVoteStats] = useState({
    totalVotes: 0,
    participationRate: 0,
  });
  const searchParams = useSearchParams();
  const electionId = searchParams.get('electionId');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (electionId) {
      fetchElectionData(electionId);
    } else {
      fetchElections();
    }
  }, [electionId]);

  const fetchElectionData = async (id) => {
    try {
      setLoading(true);
      
      // Fetch election details
      const electionDoc = await getDoc(doc(db, 'elections', id));
      
      if (!electionDoc.exists()) {
        setError('Election not found');
        return;
      }
      
      const electionData = { id: electionDoc.id, ...electionDoc.data() };
      setElection(electionData);
      
      // Fetch candidates for this election
      const candidatesQuery = query(
        collection(db, 'candidates'),
        where('electionId', '==', id)
      );
      
      const candidatesSnapshot = await getDocs(candidatesQuery);
      const candidatesData = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCandidates(candidatesData);
      
      // Get vote statistics
      const votesQuery = query(
        collection(db, 'votes'),
        where('electionId', '==', id)
      );
      
      const votesSnapshot = await getDocs(votesQuery);
      
      // Get total number of student users (simplified approach - could be more sophisticated)
      const usersQuery = query(
        collection(db, 'users'),
        where('isAdmin', '==', false)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const totalStudents = usersSnapshot.size;
      
      setVoteStats({
        totalVotes: votesSnapshot.size,
        participationRate: totalStudents > 0 ? (votesSnapshot.size / totalStudents * 100).toFixed(2) : 0
      });
    } catch (err) {
      console.error('Error fetching election data:', err);
      setError('Failed to load election data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchElections = async () => {
    try {
      setLoading(true);
      
      // Fetch all elections
      const electionsQuery = query(
        collection(db, 'elections'),
        where('endDate', '<=', new Date().toISOString())
      );
      
      const electionsSnapshot = await getDocs(electionsQuery);
      const electionsData = electionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setElections(electionsData);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  if (error) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
              <button
                onClick={() => router.push('/admin')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </AdminRoute>
    );
  }

  // If no election is selected, show the list of elections
  if (!electionId || !election) {
    return (
      <AdminRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Election Results</h1>
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Back to Dashboard
                </button>
              </div>
              
              {elections.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">No completed elections found.</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {elections.map((election) => (
                      <li key={election.id}>
                        <Link 
                          href={`/admin/results?electionId=${election.id}`} 
                          className="block hover:bg-gray-50"
                        >
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="ml-3">
                                  <p className="text-lg font-medium text-blue-600 truncate">{election.title}</p>
                                  <p className="mt-1 text-sm text-gray-500 truncate">{election.description}</p>
                                </div>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <span>Ended {formatDate(election.endDate)}</span>
                                </p>
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
          </div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Results: {election.title}</h1>
                <p className="mt-2 text-gray-600">
                  {formatDate(election.startDate)} - {formatDate(election.endDate)}
                </p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/admin/results')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  All Elections
                </button>
                <Link 
                  href={`/admin/elections/${election.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Election Details
                </Link>
              </div>
            </div>
            
            {/* Vote statistics */}
            <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Votes Cast</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{voteStats.totalVotes}</dd>
                  </dl>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Participation Rate</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">{voteStats.participationRate}%</dd>
                  </dl>
                </div>
              </div>
            </div>
            
            {/* Results chart */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Vote Distribution</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <ResultsChart electionId={electionId} />
              </div>
            </div>
            
            {/* Candidate results */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Candidates</h2>
              {candidates.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">No candidates found for this election.</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <li key={candidate.id}>
                        <Link href={`/admin/candidates/${candidate.id}`} className="block hover:bg-gray-50">
                          <div className="px-4 py-4 sm:px-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-700 font-bold">{candidate.fullName.charAt(0)}</span>
                                </div>
                                <div className="ml-4">
                                  <p className="text-lg font-medium text-gray-900">{candidate.fullName}</p>
                                  <p className="text-sm text-gray-500">Department: {candidate.department}</p>
                                </div>
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
            
            {/* Recent voter activity */}
            <div>

            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading results...</div>}>
      <ResultsPageContent />
    </Suspense>
  );
}
