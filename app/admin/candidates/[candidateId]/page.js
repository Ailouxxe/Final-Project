'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useAuth } from '../../../../context/AuthContext';
import AdminRoute from '../../../../components/AdminRoute';
import CandidateForm from '../../../../components/CandidateForm';

export default function CandidateDetails({ params }) {
  const { candidateId } = params;
  const [candidate, setCandidate] = useState(null);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCandidateData();
  }, [candidateId]);

  const fetchCandidateData = async () => {
    try {
      setLoading(true);
      
      // Fetch candidate details
      const candidateDoc = await getDoc(doc(db, 'candidates', candidateId));
      
      if (!candidateDoc.exists()) {
        setError('Candidate not found');
        return;
      }
      
      const candidateData = { id: candidateDoc.id, ...candidateDoc.data() };
      setCandidate(candidateData);
      
      // Fetch associated election
      if (candidateData.electionId) {
        const electionDoc = await getDoc(doc(db, 'elections', candidateData.electionId));
        
        if (electionDoc.exists()) {
          setElection({ id: electionDoc.id, ...electionDoc.data() });
        }
      }
    } catch (err) {
      console.error('Error fetching candidate data:', err);
      setError('Failed to load candidate data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateUpdate = async () => {
    setShowEditForm(false);
    await fetchCandidateData();
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
                onClick={() => router.push('/admin/candidates')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Candidates
              </button>
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
            {showEditForm ? (
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Candidate</h1>
                <CandidateForm 
                  candidate={candidate} 
                  onSubmit={handleCandidateUpdate} 
                  onCancel={() => setShowEditForm(false)} 
                />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">{candidate.fullName}</h1>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => router.push('/admin/candidates')}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                    >
                      Back to Candidates
                    </button>
                    <button
                      onClick={() => setShowEditForm(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Edit Candidate
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-1">
                        <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-full overflow-hidden">
                          <div className="flex items-center justify-center h-full bg-blue-100 text-blue-700 text-4xl font-bold">
                            {candidate.fullName.charAt(0)}
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Department</h3>
                            <p className="mt-1 text-lg text-gray-900">{candidate.department}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-500">Election</h3>
                            <p className="mt-1 text-lg text-gray-900">
                              {election ? (
                                <a 
                                  href={`/admin/elections/${election.id}`}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  {election.title}
                                </a>
                              ) : (
                                'Unknown'
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Manifesto</h3>
                          <div className="prose max-w-none">
                            {candidate.manifesto.split('\n').map((paragraph, i) => (
                              <p key={i} className="mb-4 text-gray-700">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        </div>
                        
                        {candidate.position && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-2">Position</h3>
                            <p className="text-gray-700">{candidate.position}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
