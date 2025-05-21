'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import AdminRoute from '../../../components/AdminRoute';
import CandidateForm from '../../../components/CandidateForm';
import Link from 'next/link';

export default function ManageCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [candidateToEdit, setCandidateToEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedElection, setSelectedElection] = useState('all');
  const [electionsList, setElectionsList] = useState([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all elections
      const electionsQuery = query(
        collection(db, 'elections'),
        orderBy('startDate', 'desc')
      );
      
      const electionsSnapshot = await getDocs(electionsQuery);
      const electionsData = {};
      const electionsList = [];
      
      electionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        electionsData[doc.id] = {
          id: doc.id,
          title: data.title,
          startDate: data.startDate,
          endDate: data.endDate
        };
        electionsList.push({
          id: doc.id,
          title: data.title
        });
      });
      
      setElections(electionsData);
      setElectionsList(electionsList);
      
      // Fetch all candidates
      const candidatesQuery = query(
        collection(db, 'candidates')
      );
      
      const candidatesSnapshot = await getDocs(candidatesQuery);
      const candidatesData = candidatesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCandidates(candidatesData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSubmit = async () => {
    setShowForm(false);
    setCandidateToEdit(null);
    await fetchData();
  };

  const handleDeleteCandidate = async (candidateId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'candidates', candidateId));
      
      // Remove from local state
      setCandidates(prev => prev.filter(candidate => candidate.id !== candidateId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting candidate:', err);
      setError('Failed to delete candidate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredCandidates = () => {
    if (selectedElection === 'all') {
      return candidates;
    }
    
    return candidates.filter(candidate => candidate.electionId === selectedElection);
  };

  const getElectionStatus = (electionId) => {
    if (!elections[electionId]) return { status: 'Unknown', color: 'gray' };
    
    const election = elections[electionId];
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);
    
    if (now < startDate) {
      return { status: 'Upcoming', color: 'yellow' };
    } else if (now > endDate) {
      return { status: 'Completed', color: 'gray' };
    } else {
      return { status: 'Active', color: 'green' };
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Manage Candidates</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/admin')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => {
                    setCandidateToEdit(null);
                    setShowForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Add New Candidate
                </button>
              </div>
            </div>

            {error && (
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
            )}

            {showForm && (
              <div className="mb-8">
                <CandidateForm 
                  candidate={candidateToEdit} 
                  onSubmit={handleCandidateSubmit} 
                  onCancel={() => {
                    setShowForm(false);
                    setCandidateToEdit(null);
                  }} 
                />
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="electionFilter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Election</label>
              <select
                id="electionFilter"
                value={selectedElection}
                onChange={(e) => setSelectedElection(e.target.value)}
                className="block w-full md:w-1/3 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Elections</option>
                {electionsList.map((election) => (
                  <option key={election.id} value={election.id}>
                    {election.title}
                  </option>
                ))}
              </select>
            </div>

            {loading && !showForm ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
              </div>
            ) : getFilteredCandidates().length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">No candidates found. Add a new candidate!</p>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {getFilteredCandidates().map((candidate) => {
                    const { status, color } = getElectionStatus(candidate.electionId);
                    
                    return (
                      <li key={candidate.id} className="relative">
                        {confirmDelete === candidate.id && (
                          <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center">
                            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                              <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                              <p className="text-gray-600 mb-6">
                                Are you sure you want to delete the candidate "{candidate.fullName}"? This action cannot be undone.
                              </p>
                              <div className="flex justify-end space-x-4">
                                <button
                                  onClick={() => setConfirmDelete(null)}
                                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleDeleteCandidate(candidate.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-16 w-16 mr-4 rounded-full overflow-hidden border border-gray-200 shadow-sm">
                                {candidate.mainImageUrl ? (
                                  <img 
                                    src={candidate.mainImageUrl} 
                                    alt={candidate.fullName}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center">
                                    <span className="text-blue-700 font-bold text-xl">{candidate.fullName.charAt(0)}</span>
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-medium text-blue-600 truncate">{candidate.fullName}</h3>
                                <p className="mt-1 text-sm text-gray-500">Department: {candidate.department}</p>
                                <p className="mt-1 text-sm text-gray-500 truncate">Election: {elections[candidate.electionId]?.title || 'Unknown'}</p>
                              </div>
                            </div>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-800`}>
                                {status}
                              </p>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{candidate.manifesto}</p>
                          <div className="mt-4 flex space-x-3">
                            <Link
                              href={`/admin/candidates/${candidate.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => {
                                setCandidateToEdit(candidate);
                                setShowForm(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Edit
                            </button>
                            <Link
                              href={`/admin/elections/${candidate.electionId}`}
                              className="text-green-600 hover:text-green-900"
                            >
                              View Election
                            </Link>
                            <button
                              onClick={() => setConfirmDelete(candidate.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
