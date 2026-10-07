import React from 'react';
import { ApiError } from '../../services/apiError';

interface StateViewProps {
  loading: boolean;
  error: ApiError | Error | string | null;
  retry?: () => void;
  children: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
}

export function StateView({ loading, error, retry, children, empty, emptyMessage = 'No data available.' }: StateViewProps) {
  if (loading) {
    return (
      <div className="state-view" role="status">
        <span className="state-spinner" aria-hidden="true" /> Loading content…
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-view state-view-error" role="alert">
        <h3>Unable to load content</h3>
        <p>{typeof error === 'string' ? error : error.message}</p>
        {retry && (
          <button 
            onClick={retry}
            className="state-retry"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="state-view">
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
