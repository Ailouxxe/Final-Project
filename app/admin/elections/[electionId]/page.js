'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../../../context/AuthContext';
import AdminRoute from '../../../../components/AdminRoute';
import CandidateForm from '../../../../components/CandidateForm';
import CandidateCard from '../../../../components/CandidateCard';
import ResultsChart from '../../../../components/ResultsChart';
import Link from 'next/link';

export default function ElectionDetails({ params }) {
  const { electionId } = params;
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchElectionData();
  }, [electionId]);

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
      
      // Fetch candidates for this election
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

  const handleCandidateSubmit = async () => {
    setShowCandidateForm(false);
    setCandidateToEdit(null);
    await fetchElectionData();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getElectionStatus = () => {
    if (!election) return {};
    
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    if (now < startDate) {
      return { status: 'Upcoming', color: 'yellow', badge: 'bg-yellow-100 text-yellow-800' };
    } else if (now > endDate) {
      return { status: 'Completed', color: 'gray', badge: 'bg-gray-100 text-gray-800' };
    } else {
      return { status: 'Active', color: 'green', badge: 'bg-green-100 text-green-800' };
    }
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
                onClick={() => router.push('/admin/elections')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Elections
              </button>
            </div>
          </div>
        </div>
      </AdminRoute>
    );
  }

  const { status, badge } = getElectionStatus();

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{election.title}</h1>
                <div className="mt-2 flex items-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badge}`}>
                    {status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/admin/elections')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Back to Elections
                </button>
                <Link 
                  href={`/admin/results?electionId=${electionId}`}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  View Results
                </Link>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <p className="text-gray-700 mb-4">{election.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Start Date:</span> {formatDate(election.startDate)}
                </div>
                <div>
                  <span className="font-medium">End Date:</span> {formatDate(election.endDate)}
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Candidates</h2>
                <button
                  onClick={() => {
                    setCandidateToEdit(null);
                    setShowCandidateForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add Candidate
                </button>
              </div>
              
              {showCandidateForm && (
                <div className="mb-6">
                  <CandidateForm 
                    candidate={candidateToEdit} 
                    electionId={electionId}
                    onSubmit={handleCandidateSubmit} 
                    onCancel={() => {
                      setShowCandidateForm(false);
                      setCandidateToEdit(null);
                    }} 
                  />
                </div>
              )}
              
              {candidates.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">No candidates added to this election yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {candidates.map((candidate) => (
                    <CandidateCard 
                      key={candidate.id} 
                      candidate={candidate} 
                      onEdit={() => {
                        setCandidateToEdit(candidate);
                        setShowCandidateForm(true);
                      }}
                      isAdminView={true}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Current Results</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <ResultsChart electionId={electionId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
