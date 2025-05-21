'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import ElectionCard from '../../components/ElectionCard';
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
        const now = new Date().toISOString();
        const electionsQuery = query(
          collection(db, 'elections'),
          where('startDate', '<=', now),
          where('endDate', '>=', now),
          orderBy('startDate', 'desc')
        );
        
        const querySnapshot = await getDocs(electionsQuery);
        const electionsData = [];
        
        for (const doc of querySnapshot.docs) {
          const electionData = { id: doc.id, ...doc.data() };
          
          // Check if the student has already voted in this election
          const votesQuery = query(
            collection(db, 'votes'),
            where('electionId', '==', doc.id),
            where('studentId', '==', user.uid)
          );
          const votesSnapshot = await getDocs(votesQuery);
          electionData.hasVoted = !votesSnapshot.empty;
          
          electionsData.push(electionData);
        }
        
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Student Dashboard</h1>
            
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Elections</h2>
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
              ) : elections.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">No active elections available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {elections.map((election) => (
                    <ElectionCard 
                      key={election.id} 
                      election={election} 
                      onClick={() => {
                        if (election.hasVoted) {
                          router.push(`/admin/results?electionId=${election.id}`);
                        } else {
                          router.push(`/student/vote/${election.id}`);
                        }
                      }} 
                      showVoteButton={!election.hasVoted}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Real-Time Voter Feed</h2>
              <VoterFeed limit={10} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
