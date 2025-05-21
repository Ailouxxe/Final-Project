'use client';

import { useState, useEffect } from 'react';
import { doc, addDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';

export default function CandidateForm({ candidate, electionId, onSubmit, onCancel }) {
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [selectedElectionId, setSelectedElectionId] = useState(electionId || '');
  const [mainImage, setMainImage] = useState(null);
  const [secondaryImage, setSecondaryImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [secondaryImagePreview, setSecondaryImagePreview] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
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
      setMainImagePreview(candidate.mainImageUrl || '');
      setSecondaryImagePreview(candidate.secondaryImageUrl || '');
    }
  }, [candidate]);
  
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMainImage(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setMainImagePreview(e.target.result);
      };
      fileReader.readAsDataURL(file);
    }
  };
  
  const handleSecondaryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSecondaryImage(file);
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        setSecondaryImagePreview(e.target.result);
      };
      fileReader.readAsDataURL(file);
    }
  };

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

  const uploadImage = async (image, candidateId, imageType) => {
    if (!image) return null;
    
    const fileExtension = image.name.split('.').pop();
    const storageRef = ref(storage, `candidates/${candidateId}/${imageType}.${fileExtension}`);
    
    await uploadBytes(storageRef, image);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
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
      
      // Keep existing image URLs if no new images are uploaded
      if (candidate && candidate.mainImageUrl && !mainImage) {
        candidateData.mainImageUrl = candidate.mainImageUrl;
      }
      
      if (candidate && candidate.secondaryImageUrl && !secondaryImage) {
        candidateData.secondaryImageUrl = candidate.secondaryImageUrl;
      }
      
      let candidateId;
      
      if (candidate) {
        // Update existing candidate
        candidateId = candidate.id;
        await updateDoc(doc(db, 'candidates', candidateId), candidateData);
      } else {
        // Create new candidate
        candidateData.createdAt = new Date().toISOString();
        const docRef = await addDoc(collection(db, 'candidates'), candidateData);
        candidateId = docRef.id;
      }
      
      // Upload images if provided
      if (mainImage || secondaryImage) {
        setUploadingImages(true);
        
        try {
          // Upload main image if provided
          if (mainImage) {
            const mainImageUrl = await uploadImage(mainImage, candidateId, 'main');
            if (mainImageUrl) {
              await updateDoc(doc(db, 'candidates', candidateId), { mainImageUrl });
            }
          }
          
          // Upload secondary image if provided
          if (secondaryImage) {
            const secondaryImageUrl = await uploadImage(secondaryImage, candidateId, 'secondary');
            if (secondaryImageUrl) {
              await updateDoc(doc(db, 'candidates', candidateId), { secondaryImageUrl });
            }
          }
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          setError('Successfully saved candidate data but failed to upload images.');
          setLoading(false);
          setUploadingImages(false);
          return;
        }
        
        setUploadingImages(false);
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
          
          <div>
            <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700">
              Main Profile Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                id="mainImage"
                accept="image/*"
                onChange={handleMainImageChange}
                className="hidden"
              />
              <label
                htmlFor="mainImage"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                {mainImagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              {mainImagePreview ? (
                <div className="relative w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={mainImagePreview} 
                    alt="Main profile preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMainImage(null);
                      setMainImagePreview('');
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">This will be displayed as the candidate's profile photo.</p>
          </div>
          
          <div>
            <label htmlFor="secondaryImage" className="block text-sm font-medium text-gray-700">
              Secondary Image (Campaign Banner)
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                id="secondaryImage"
                accept="image/*"
                onChange={handleSecondaryImageChange}
                className="hidden"
              />
              <label
                htmlFor="secondaryImage"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
              >
                {secondaryImagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              {secondaryImagePreview ? (
                <div className="relative w-32 h-16 border border-gray-200 rounded-md overflow-hidden">
                  <img 
                    src={secondaryImagePreview}
                    alt="Secondary image preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSecondaryImage(null);
                      setSecondaryImagePreview('');
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 focus:outline-none"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-32 h-16 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">This will be displayed above the manifesto (e.g., campaign banner, symbol, etc.).</p>
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
