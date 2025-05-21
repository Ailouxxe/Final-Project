// Email validation for domain @paterostechnologicalcollege.edu.ph
export const validateEmail = (email) => {
  const domainRegex = /@paterostechnologicalcollege\.edu\.ph$/i;
  return domainRegex.test(email);
};

// Password validation: minimum 6 characters, at least one letter and one number
export const validatePassword = (password) => {
  return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
};

// Student ID validation: alphanumeric, minimum 5 characters
export const validateStudentId = (studentId) => {
  return /^[a-zA-Z0-9]{5,}$/.test(studentId);
};

// Election date validation: ensure end date is after start date
export const validateElectionDates = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return end > start;
};

// Check if a user has already voted in an election
export const validateUserHasVoted = (votesData, userId, electionId) => {
  return votesData.some(vote => 
    vote.studentId === userId && vote.electionId === electionId
  );
};
