'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import Chart from 'chart.js/auto';

export default function ResultsChart({ electionId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!electionId) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        
        // Fetch all candidates for this election
        const candidatesQuery = query(
          collection(db, 'candidates'),
          where('electionId', '==', electionId)
        );
        
        const candidatesSnapshot = await getDocs(candidatesQuery);
        const candidatesData = candidatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch all votes for this election
        const votesQuery = query(
          collection(db, 'votes'),
          where('electionId', '==', electionId)
        );
        
        const votesSnapshot = await getDocs(votesQuery);
        const totalVotes = votesSnapshot.size;
        setTotalVotes(totalVotes);
        
        // Count votes per candidate
        const voteCounts = {};
        votesSnapshot.docs.forEach(doc => {
          const vote = doc.data();
          if (vote.candidateId) {
            voteCounts[vote.candidateId] = (voteCounts[vote.candidateId] || 0) + 1;
          }
        });
        
        // Combine candidate data with vote counts
        const resultsData = candidatesData.map(candidate => {
          const voteCount = voteCounts[candidate.id] || 0;
          const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(2) : 0;
          
          return {
            ...candidate,
            voteCount,
            percentage
          };
        });
        
        // Sort by vote count descending
        resultsData.sort((a, b) => b.voteCount - a.voteCount);
        setResults(resultsData);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load election results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [electionId]);

  useEffect(() => {
    if (loading || error || results.length === 0 || !chartRef.current) return;
    
    const ctx = chartRef.current.getContext('2d');
    
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    const labels = results.map(result => result.fullName);
    const data = results.map(result => result.voteCount);
    const backgroundColors = [
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 99, 132, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
      'rgba(199, 199, 199, 0.7)',
      'rgba(83, 102, 255, 0.7)',
      'rgba(78, 129, 189, 0.7)',
      'rgba(192, 80, 77, 0.7)',
    ];
    
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Votes',
          data,
          backgroundColor: backgroundColors.slice(0, results.length),
          borderColor: backgroundColors.slice(0, results.length).map(color => color.replace('0.7', '1')),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const percentage = results[context.dataIndex].percentage;
                return `${percentage}% of total votes`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Votes'
            },
            ticks: {
              precision: 0
            }
          },
          x: {
            title: {
              display: true,
              text: 'Candidates'
            }
          }
        }
      }
    });
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [loading, error, results]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
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

  if (results.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No voting data available for this election yet.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <canvas ref={chartRef} height="300"></canvas>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Votes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <tr key={result.id} className={result.voteCount === Math.max(...results.map(r => r.voteCount)) ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-bold">{result.fullName.charAt(0)}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {result.fullName}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                  {result.voteCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {result.percentage}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="2" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                Total Votes:
              </td>
              <td className="px-6 py-3 text-sm font-medium text-gray-900">
                {totalVotes}
              </td>
              <td className="px-6 py-3 text-sm font-medium text-gray-900">
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
