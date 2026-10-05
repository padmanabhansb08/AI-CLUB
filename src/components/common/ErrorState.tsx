import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to connect to AI CLUB server',
  message = 'Please check your connection or ensure the backend service is running, then try again.',
  onRetry,
  fullScreen = false,
}) => {
  return (
    <div
      className="error-state-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        minHeight: fullScreen ? '100vh' : 'auto',
        backgroundColor: fullScreen ? 'var(--bg-primary, #0a0a0c)' : 'transparent',
      }}
    >
      <div
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--error-color, #ef4444)',
        }}
      >
        <AlertCircle size={28} />
      </div>
      <h3 style={{
        fontSize: '1.15rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
        color: 'var(--text-primary, #ffffff)',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary, rgba(255, 255, 255, 0.6))',
        maxWidth: '420px',
        lineHeight: 1.5,
        marginBottom: onRetry ? '1.5rem' : '0',
      }}>
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary">
          Try Again
        </Button>
      )}
    </div>
  );
};
