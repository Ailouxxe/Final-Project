'use client';

export default function CandidateCard({ candidate, isSelected, onClick, selectable = false, onEdit, isAdminView = false }) {
  if (!candidate) return null;

  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${
        selectable ? 'cursor-pointer transition-all duration-300 hover:shadow-lg' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 transform scale-[1.02]' : ''}`}
      onClick={selectable ? onClick : undefined}
    >
      <div className="p-6">
        <div className="flex items-center justify-center mb-4">
          <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-2xl font-bold">
            {candidate.fullName.charAt(0)}
          </div>
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{candidate.fullName}</h3>
        <p className="text-gray-600 text-center mb-4">{candidate.department}</p>
        
        {candidate.position && (
          <p className="text-blue-600 text-center font-medium mb-4">Running for: {candidate.position}</p>
        )}
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Manifesto:</h4>
          <p className="text-gray-600 text-sm line-clamp-4">{candidate.manifesto}</p>
        </div>
        
        {isAdminView ? (
          <div className="flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Edit Candidate
            </button>
          </div>
        ) : selectable && (
          <div className="mt-4 flex justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className={`px-4 py-2 rounded-md font-medium ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
