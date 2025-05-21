// Format date to display in readable format
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format date to input field format (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Format time to input field format (HH:MM)
export const formatTimeForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toTimeString().slice(0, 5);
};

// Check if an election is active
export const isElectionActive = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return now >= start && now <= end;
};

// Check if an election is upcoming
export const isElectionUpcoming = (startDate) => {
  const now = new Date();
  const start = new Date(startDate);
  
  return now < start;
};

// Check if an election has ended
export const isElectionEnded = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  
  return now > end;
};

// Get time left until election starts or ends
export const getTimeLeft = (targetDate) => {
  const now = new Date();
  const target = new Date(targetDate);
  const diffTime = target - now;
  
  if (diffTime <= 0) return 'Ended';
  
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  } else if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  } else {
    return `${diffMinutes}m`;
  }
};
