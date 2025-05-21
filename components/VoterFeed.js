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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
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
    );
  }

  if (votes.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No voting activity yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {votes.map((vote) => (
        <div key={vote.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 font-bold">{vote.voterName?.charAt(0) || 'A'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">
              {vote.voterName || 'Anonymous'} voted in <span className="text-blue-600">{vote.electionTitle}</span>
            </p>
            <p className="text-xs text-gray-500">
              {formatTimestamp(vote.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
