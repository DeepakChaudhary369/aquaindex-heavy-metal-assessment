import React from 'react';

const LoadingSkeleton = ({ count = 3, height = '40px', style = {} }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', ...style }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{ height, width: '100%' }}
        />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
