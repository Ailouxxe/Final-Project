'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  where,
  onSnapshot
} from 'firebase/firestore';
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

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    const days = Math.floor(diffInMinutes / 1440);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48 animate-pulse">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto animate-spin" />
          <p className="text-gray-500 text-sm font-medium">Loading live votes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-5 shadow-sm text-sm text-red-700">
        <p className="font-semibold mb-1">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (votes.length === 0) {
    return (
      <div className="text-center bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 rounded-full mx-auto flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 00-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5v1a3 3 0 006 0v-1z" />
          </svg>
        </div>
        <p className="text-gray-600 font-medium">No voting activity yet</p>
        <p className="text-gray-400 text-xs mt-1">This feed updates live as students vote.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
      {votes.map((vote) => (
        <div
          key={vote.id}
          className="bg-white border border-gray-100 rounded-lg shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition"
        >
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-lg font-semibold shadow">
            {vote.voterName?.charAt(0) || 'A'}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <p className="font-semibold text-gray-800 truncate">{vote.voterName || 'Anonymous'}</p>
              <span className="text-xs text-gray-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatTimestamp(vote.timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              Voted in <span className="text-blue-600 font-medium">{vote.electionTitle}</span>
            </p>
            <div className="mt-2 inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              Vote recorded
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
