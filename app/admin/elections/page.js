'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import AdminRoute from '../../../components/AdminRoute';
import ElectionForm from '../../../components/ElectionForm';
import Link from 'next/link';

export default function ManageElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [electionToEdit, setElectionToEdit] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      setLoading(true);
      const electionsQuery = query(
        collection(db, 'elections'),
        orderBy('startDate', 'desc')
      );
      
      const querySnapshot = await getDocs(electionsQuery);
      const electionsData = querySnapshot.docs.map(doc => ({
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

  const handleElectionSubmit = async () => {
    setShowForm(false);
    setElectionToEdit(null);
    await fetchElections();
  };

  const handleDeleteElection = async (electionId) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, 'elections', electionId));
      
      // Remove from local state
      setElections(prev => prev.filter(election => election.id !== electionId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting election:', err);
      setError('Failed to delete election. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const getElectionStatus = (election) => {
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
      <div
        className="relative min-h-screen bg-cover bg-center"
        style={{
          backgroundImage: "url('/uploads/background1.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="min-h-screen bg-gray-50 bg-opacity-30">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Manage Elections</h1>
                <div className="flex space-x-4">
                  <button
                    onClick={() => router.push('/admin')}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    Back to Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setElectionToEdit(null);
                      setShowForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Create New Election
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
                  <ElectionForm 
                    election={electionToEdit} 
                    onSubmit={handleElectionSubmit} 
                    onCancel={() => {
                      setShowForm(false);
                      setElectionToEdit(null);
                    }} 
                  />
                </div>
              )}

              {loading && !showForm ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              ) : elections.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <p className="text-gray-500">No elections created yet. Create your first election!</p>
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {elections.map((election) => {
                      const { status, color } = getElectionStatus(election);
                      
                      return (
                        <li key={election.id} className="relative">
                          {confirmDelete === election.id && (
                            <div className="absolute inset-0 bg-white bg-opacity-90 z-10 flex items-center justify-center">
                              <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
                                <p className="text-gray-600 mb-6">
                                  Are you sure you want to delete the election "{election.title}"? This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-4">
                                  <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleDeleteElection(election.id)}
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
                              <div>
                                <h3 className="text-lg font-medium text-blue-600 truncate">{election.title}</h3>
                                <p className="mt-1 text-sm text-gray-500">{election.description}</p>
                              </div>
                              <div className="ml-2 flex-shrink-0 flex">
                                <p className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-${color}-100 text-${color}-800`}>
                                  {status}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 sm:flex sm:justify-between">
                              <div className="sm:flex">
                                <p className="flex items-center text-sm text-gray-500">
                                  <span>Start: {formatDate(election.startDate)}</span>
                                </p>
                              </div>
                              <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                <span>End: {formatDate(election.endDate)}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex space-x-3">
                              <Link
                                href={`/admin/elections/${election.id}`}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                View Details
                              </Link>
                              <button
                                onClick={() => {
                                  setElectionToEdit(election);
                                  setShowForm(true);
                                }}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                Edit
                              </button>
                              <Link
                                href={`/admin/results?electionId=${election.id}`}
                                className="text-green-600 hover:text-green-900"
                              >
                                View Results
                              </Link>
                              <button
                                onClick={() => setConfirmDelete(election.id)}
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
      </div>
    </AdminRoute>
  );
}
