/**
 * Loading Spinner Component
 */

import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  const sizeMap = {
    small: { size: '30px', border: '3px' },
    medium: { size: '50px', border: '4px' },
    large: { size: '80px', border: '5px' },
  };

  const dimensions = sizeMap[size] || sizeMap.medium;

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(fullScreen && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 9999,
    }),
    minHeight: fullScreen ? '100vh' : '100px',
  };

  const spinnerStyle = {
    width: dimensions.size,
    height: dimensions.size,
    border: `${dimensions.border} solid #f3f3f3`,
    borderTop: `${dimensions.border} solid #0066cc`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div style={containerStyle}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle} />
    </div>
  );
};

export default LoadingSpinner;
