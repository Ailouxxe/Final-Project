'use client';

export default function CandidateCard({ candidate, isSelected, onClick, selectable = false, onEdit, isAdminView = false }) {
  if (!candidate) return null;

  return (
    <div 
      className={`bg-white rounded-xl shadow-md overflow-hidden ${
        selectable ? 'cursor-pointer transition-all duration-300 hover:shadow-lg' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 transform scale-[1.02]' : ''}`}
      onClick={selectable ? onClick : undefined}
    >
      {/* Main candidate image */}
      <div className="w-full h-48 bg-gray-100 relative">
        {candidate.mainImageUrl ? (
          <img 
            src={candidate.mainImageUrl} 
            alt={candidate.fullName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200">
            <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-blue-700 text-4xl font-bold shadow-sm">
              {candidate.fullName.charAt(0)}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{candidate.fullName}</h3>
        <p className="text-gray-600 text-center mb-4">{candidate.department}</p>
        
        {candidate.position && (
          <p className="text-blue-600 text-center font-medium mb-4">Running for: {candidate.position}</p>
        )}
        
        {/* Secondary image (campaign banner) */}
        {candidate.secondaryImageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={candidate.secondaryImageUrl} 
              alt="Campaign banner"
              className="w-full h-32 object-cover"
            />
          </div>
        )}
        
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Manifesto:</h4>
          <p className="text-gray-600 text-sm">{candidate.manifesto}</p>
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
