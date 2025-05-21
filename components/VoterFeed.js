'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function VoterFeed({ electionId, limit: feedLimit = 10 }) {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let feedQuery;
    
    if (electionId) {
      feedQuery = query(
        collection(db, 'voterFeed'),
        where('electionId', '==', electionId),
        orderBy('timestamp', 'desc'),
        limit(feedLimit)
      );
    } else {
      feedQuery = query(
        collection(db, 'voterFeed'),
        orderBy('timestamp', 'desc'),
        limit(feedLimit)
      );
    }

    setLoading(true);
    
    const unsubscribe = onSnapshot(
      feedQuery,
      (snapshot) => {
        const feedData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        setVotes(feedData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching voter feed:', err);
        setError('Failed to load the voter feed. Please try again later.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [electionId, feedLimit]);

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const voteTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - voteTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-sm font-medium">Loading voter activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg">
            <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <p className="mt-3 text-xs text-red-700">Please make sure your Firebase configuration is correct and try again.</p>
          </div>
        </div>
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="text-center p-8 bg-white rounded-lg border border-gray-100">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p className="text-gray-700 font-medium">No voting activity yet.</p>
        <p className="text-gray-500 text-sm mt-1">Activity will appear here when students start voting.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {votes.map((vote) => (
        <div key={vote.id} className="flex items-start space-x-4 p-5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white shadow-sm">
            <span className="text-lg font-bold">{vote.voterName?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
              <p className="text-base font-medium text-gray-900">
                {vote.voterName || 'Anonymous'} 
              </p>
              <span className="text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTimestamp(vote.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Voted in <span className="text-blue-600 font-medium">{vote.electionTitle}</span>
            </p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <svg className="mr-1 h-2 w-2 text-green-500" fill="currentColor" viewBox="0 0 8 8">
                <circle cx="4" cy="4" r="3" />
              </svg>
              Vote recorded
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
