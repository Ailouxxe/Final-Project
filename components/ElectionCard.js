'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate } from '../utils/dateUtils';

export default function ElectionCard({ election, onClick, showVoteButton = false }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [status, setStatus] = useState('');
  const [statusColor, setStatusColor] = useState('');

  useEffect(() => {
    if (!election) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const startDate = new Date(election.startDate);
      const endDate = new Date(election.endDate);

      if (now < startDate) {
        setStatus('Upcoming');
        setStatusColor('yellow');
        const diffTime = startDate - now;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`Starts in ${diffDays}d ${diffHours}h`);
      } else if (now > endDate) {
        setStatus('Completed');
        setStatusColor('gray');
        setTimeLeft('Election ended');
      } else {
        setStatus('Active');
        setStatusColor('green');
        const diffTime = endDate - now;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft(`Ends in ${diffDays}d ${diffHours}h`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [election]);

  if (!election) return null;

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      <div className={`h-2 bg-${statusColor}-500`}></div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{election.title}</h3>
          <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
            {status}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{election.description}</p>
        
        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Start:</span>
            <span className="text-gray-700">{formatDate(election.startDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">End:</span>
            <span className="text-gray-700">{formatDate(election.endDate)}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-500">Status:</span>
            <span className={`text-${statusColor}-600`}>{timeLeft}</span>
          </div>
        </div>
        
        {showVoteButton ? (
          <button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
          >
            {election.hasVoted ? 'View Results' : 'Vote Now'}
          </button>
        ) : (
          <Link 
            href={`/admin/elections/${election.id}`}
            className="block w-full text-center text-blue-600 hover:text-blue-800 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  );
}
