import React from 'react';

export const ProgressBar = ({ 
  percentage = 0, 
  showPercentage = true,
  className = '' 
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Progress Track */}
      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden relative">
        {/* Progress Fill */}
        <div 
          className="h-full bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full relative transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer Glow Effect */}
          <div 
            className="absolute inset-0 animate-slide"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 50%, transparent 100%)'
            }}
          />
        </div>
      </div>
      
      {/* Percentage Display */}
      {showPercentage && (
        <span className="font-bold text-[#667eea] min-w-[48px] text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
};

export default ProgressBar;
