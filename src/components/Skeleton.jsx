import React from 'react';

const Skeleton = ({ width, height, borderRadius = '0.5rem', className = '', style = {} }) => {
  return (
    <div 
      className={`skeleton-base ${className}`}
      style={{
        width: width || '100%',
        height: height || '1rem',
        borderRadius,
        background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-pulse 1.5s infinite linear',
        ...style
      }}
    />
  );
};

export const CardSkeleton = () => (
  <div className="glass-card" style={{ padding: '0', overflow: 'hidden', height: '100%' }}>
    <Skeleton height="200px" borderRadius="1rem 1rem 0 0" />
    <div style={{ padding: '1.5rem' }}>
      <Skeleton width="40%" height="0.75rem" style={{ marginBottom: '1rem' }} />
      <Skeleton width="80%" height="1.25rem" style={{ marginBottom: '1rem' }} />
      <Skeleton height="0.85rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton height="0.85rem" style={{ marginBottom: '0.5rem' }} />
      <Skeleton width="60%" height="0.85rem" style={{ marginBottom: '1.5rem' }} />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Skeleton width="60px" height="1.5rem" borderRadius="1rem" />
        <Skeleton width="60px" height="1.5rem" borderRadius="1rem" />
      </div>
    </div>
  </div>
);

export default Skeleton;
