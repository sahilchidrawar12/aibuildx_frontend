import React from 'react';

export const BackgroundAnimation = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      {/* Shape 1 - Top Left */}
      <div 
        className="absolute rounded-full animate-float-delayed-1"
        style={{
          width: '300px',
          height: '300px',
          top: '-150px',
          left: '-150px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent)'
        }}
      />
      
      {/* Shape 2 - Right Middle */}
      <div 
        className="absolute rounded-full animate-float-delayed-2"
        style={{
          width: '500px',
          height: '500px',
          top: '50%',
          right: '-250px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent)'
        }}
      />
      
      {/* Shape 3 - Bottom Center */}
      <div 
        className="absolute rounded-full animate-float-delayed-3"
        style={{
          width: '400px',
          height: '400px',
          bottom: '-200px',
          left: '30%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15), transparent)'
        }}
      />
    </div>
  );
};

export default BackgroundAnimation;
