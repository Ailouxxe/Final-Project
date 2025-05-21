'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ElectionResults from './ElectionResults';

export default function ResultsPageContent() {
  const searchParams = useSearchParams();
  const electionId = searchParams.get('electionId');
  const [selectedElectionId, setSelectedElectionId] = useState(electionId);

  useEffect(() => {
    setSelectedElectionId(electionId);
  }, [electionId]);

  return (
    <div>
      <ElectionResults electionId={selectedElectionId} />
    </div>
  );
}