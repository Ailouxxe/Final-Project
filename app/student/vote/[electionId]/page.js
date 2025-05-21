'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, where, query, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../../../context/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import CandidateCard from '../../../../components/CandidateCard';

export default function Vote({ params }) {
  const { electionId } = params;
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchElectionAndCandidates = async () => {
      if (!user || !electionId) return;
      
      try {
        setLoading(true);
        
        // Check if user has already voted
        const votesQuery = query(
          collection(db, 'votes'),
          where('electionId', '==', electionId),
          where('studentId', '==', user.uid)
        );
        const votesSnapshot = await getDocs(votesQuery);
        
        if (!votesSnapshot.empty) {
          setHasVoted(true);
          router.push('/student');
          return;
        }
        
        // Fetch election details
        const electionDoc = await getDoc(doc(db, 'elections', electionId));
        
        if (!electionDoc.exists()) {
          setError('Election not found');
          return;
        }
        
        const electionData = electionDoc.data();
        setElection({ id: electionDoc.id, ...electionData });
        
        // Check if election is active
        const now = new Date();
        const startDate = new Date(electionData.startDate);
        const endDate = new Date(electionData.endDate);
        
        if (now < startDate || now > endDate) {
          setError('This election is not currently active');
          return;
        }
        
        // Fetch candidates
        const candidatesQuery = query(
          collection(db, 'candidates'),
          where('electionId', '==', electionId)
        );
        const candidatesSnapshot = await getDocs(candidatesQuery);
        const candidatesData = candidatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setCandidates(candidatesData);
      } catch (err) {
        console.error('Error fetching election data:', err);
        setError('Failed to load election data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchElectionAndCandidates();
  }, [user, electionId, router]);

  const handleVote = async () => {
    if (!selectedCandidate || !user || !election) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      // Check once more if user has already voted
      const votesQuery = query(
        collection(db, 'votes'),
        where('electionId', '==', electionId),
        where('studentId', '==', user.uid)
      );
      const votesSnapshot = await getDocs(votesQuery);
      
      if (!votesSnapshot.empty) {
        setError('You have already voted in this election');
        return;
      }
      
      // Record the vote
      await addDoc(collection(db, 'votes'), {
        electionId,
        electionTitle: election.title,
        candidateId: selectedCandidate,
        studentId: user.uid,
        studentName: user.displayName || user.fullName,
        timestamp: Timestamp.now()
      });
      
      // Add to voting activity feed
      await addDoc(collection(db, 'voterFeed'), {
        voterName: user.displayName || user.fullName,
        electionTitle: election.title,
        timestamp: Timestamp.now()
      });
      
      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/student');
      }, 3000);
    } catch (err) {
      console.error('Error casting vote:', err);
      setError('Failed to cast your vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
                onClick={() => router.push('/student')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (success) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">Your vote has been successfully recorded! Redirecting to dashboard...</p>
                  </div>
                </div>
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Vote: {election?.title}</h1>
              <button
                onClick={() => router.push('/student')}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Back to Dashboard
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <p className="text-gray-700 mb-4">{election?.description}</p>
              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                <div className="flex">
                  <span className="font-medium w-24">Start Date:</span>
                  <span>{new Date(election?.startDate).toLocaleString()}</span>
                </div>
                <div className="flex">
                  <span className="font-medium w-24">End Date:</span>
                  <span>{new Date(election?.endDate).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Candidates</h2>
            
            {candidates.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">No candidates available for this election.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {candidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedCandidate === candidate.id}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    selectable={true}
                  />
                ))}
              </div>
            )}
            
            <div className="bg-blue-50 p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-bold text-blue-800 mb-2">Your Selection</h3>
              {selectedCandidate ? (
                <p className="text-blue-700">
                  You have selected: {candidates.find(c => c.id === selectedCandidate)?.fullName}
                </p>
              ) : (
                <p className="text-blue-700">Please select a candidate to vote.</p>
              )}
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleVote}
                disabled={!selectedCandidate || submitting}
                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md ${
                  !selectedCandidate || submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Submitting...' : 'Confirm Vote'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
