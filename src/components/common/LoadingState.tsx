import React from 'react';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading AI CLUB...',
  fullScreen = false,
}) => {
  const content = (
    <div className="loading-state-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      gap: '1rem',
      textAlign: 'center',
      minHeight: fullScreen ? '100vh' : 'auto',
      backgroundColor: fullScreen ? 'var(--bg-primary, #0a0a0c)' : 'transparent',
    }}>
      <div
        className="loading-spinner"
        style={{
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '50%',
          border: '3px solid rgba(255, 255, 255, 0.1)',
          borderTopColor: 'var(--accent-color, #ffffff)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{
        fontSize: '0.9rem',
        color: 'var(--text-secondary, rgba(255, 255, 255, 0.6))',
        letterSpacing: '0.02em',
      }}>
        {message}
      </p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  return content;
};
