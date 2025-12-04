import React from 'react';
import { Check, Loader2 } from 'lucide-react';

export const StepIndicator = ({ 
  step, 
  status = 'default', // 'default' | 'active' | 'success'
  className = '' 
}) => {
  const getBackgroundClass = () => {
    if (status === 'success') {
      return 'bg-gradient-to-br from-emerald-500 to-emerald-600';
    }
    return 'bg-gradient-to-br from-[#667eea] to-[#764ba2]';
  };

  const getAnimationClass = () => {
    if (status === 'active') {
      return 'animate-pulse-ring';
    }
    return '';
  };

  return (
    <div 
      className={`
        relative
        w-14 h-14 
        rounded-2xl 
        ${getBackgroundClass()}
        flex items-center justify-center
        text-white font-bold text-2xl
        flex-shrink-0
        shadow-[0_10px_20px_rgba(102,126,234,0.3)]
        ${getAnimationClass()}
        ${className}
      `}
    >
      {status === 'active' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-16 h-16 absolute animate-spin text-white/20 stroke-[3]" />
        </div>
      )}
      
      {status === 'success' ? (
        <Check className="w-8 h-8" strokeWidth={3} />
      ) : (
        <span className="relative z-10">{step}</span>
      )}
    </div>
  );
};

export default StepIndicator;
