'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import ProtectedRoute from '../../../components/ProtectedRoute';
import ResultsChart from '../../../components/ResultsChart';
import Link from 'next/link';

function ResultsPage() {
  const searchParams = useSearchParams();
  const electionId = searchParams.get('electionId');
  const [election, setElection] = useState(null);
  const [elections, setElections] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchElectionData = async () => {
      try {
        setLoading(true);

        // Fetch election details
        const electionDoc = await getDoc(doc(db, 'elections', electionId));
        if (!electionDoc.exists()) {
          setError('Election not found');
          return;
        }
        setElection({ id: electionDoc.id, ...electionDoc.data() });

        // Fetch candidates
        const candidatesQuery = query(
          collection(db, 'candidates'),
          where('electionId', '==', electionId)
        );
        const candidatesSnapshot = await getDocs(candidatesQuery);
        setCandidates(candidatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
        const electionsQuery = query(
          collection(db, 'elections'),
          where('endDate', '<=', new Date().toISOString())
        );
        const electionsSnapshot = await getDocs(electionsQuery);
        const electionsData = electionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setElections(electionsData);
      } catch (err) {
        console.error('Error fetching elections:', err);
        setError('Failed to load elections. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (electionId) {
      fetchElectionData();
    } else {
      fetchElections();
    }
  }, [electionId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Results: {election.title}</h1>
            <p className="text-gray-700 mb-4">{election.description}</p>

            {/* Results Chart */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Vote Distribution</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <ResultsChart electionId={electionId} />
              </div>
            </div>

           

            <Link
              href="/student"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Page() {
  return (
    <div>
      <Suspense fallback={<div>Loading results...</div>}>
        <ResultsPage />
      </Suspense>
    </div>
  );
}