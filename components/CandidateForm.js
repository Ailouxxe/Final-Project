'use client';

import { useState, useEffect } from 'react';
import { doc, addDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function CandidateForm({ candidate, electionId, onSubmit, onCancel }) {
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [selectedElectionId, setSelectedElectionId] = useState(electionId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [elections, setElections] = useState([]);
  const [loadingElections, setLoadingElections] = useState(false);

  useEffect(() => {
    fetchElections();
    
    if (candidate) {
      setFullName(candidate.fullName || '');
      setDepartment(candidate.department || '');
      setPosition(candidate.position || '');
      setManifesto(candidate.manifesto || '');
      setSelectedElectionId(candidate.electionId || '');
    }
  }, [candidate]);

  const fetchElections = async () => {
    try {
      setLoadingElections(true);
      const electionsQuery = query(collection(db, 'elections'));
      const snapshot = await getDocs(electionsQuery);
      const electionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort elections by start date (newest first)
      electionsData.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
      
      setElections(electionsData);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError('Failed to load elections. Please try again.');
    } finally {
      setLoadingElections(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!fullName.trim()) {
      setError('Candidate name is required');
      return;
    }
    
    if (!department.trim()) {
      setError('Department is required');
      return;
    }
    
    if (!manifesto.trim()) {
      setError('Manifesto is required');
      return;
    }
    
    if (!selectedElectionId) {
      setError('Please select an election');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const candidateData = {
        fullName,
        department,
        position,
        manifesto,
        electionId: selectedElectionId,
        updatedAt: new Date().toISOString()
      };
      
      if (candidate) {
        // Update existing candidate
        await updateDoc(doc(db, 'candidates', candidate.id), candidateData);
      } else {
        // Create new candidate
        candidateData.createdAt = new Date().toISOString();
        await addDoc(collection(db, 'candidates'), candidateData);
      }
      
      onSubmit();
    } catch (err) {
      console.error('Error saving candidate:', err);
      setError(candidate ? 'Failed to update candidate' : 'Failed to create candidate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {candidate ? 'Edit Candidate' : 'Add New Candidate'}
      </h2>
      
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
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., John Smith"
              required
            />
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <select
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              required
            >
              <option value="">Select Department</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Engineering">Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Education">Education</option>
              <option value="Arts and Sciences">Arts and Sciences</option>
              <option value="Medicine">Medicine</option>
              <option value="Law">Law</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              Position (Optional)
            </label>
            <input
              type="text"
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., President, Vice President, etc."
            />
          </div>
          
          <div>
            <label htmlFor="manifesto" className="block text-sm font-medium text-gray-700">
              Manifesto
            </label>
            <textarea
              id="manifesto"
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              rows="6"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="The candidate's manifesto, goals, and objectives"
              required
            ></textarea>
          </div>
          
          {!electionId && (
            <div>
              <label htmlFor="election" className="block text-sm font-medium text-gray-700">
                Election
              </label>
              {loadingElections ? (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading elections...
                </div>
              ) : (
                <select
                  id="election"
                  value={selectedElectionId}
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select Election</option>
                  {elections.map((election) => (
                    <option key={election.id} value={election.id}>
                      {election.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              candidate ? 'Update Candidate' : 'Add Candidate'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
