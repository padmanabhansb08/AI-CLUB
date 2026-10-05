import React from 'react';
import { ApiError } from '../../services/apiError';

interface StateViewProps {
  loading: boolean;
  error: ApiError | null;
  retry?: () => void;
  children: React.ReactNode;
  empty?: boolean;
  emptyMessage?: string;
}

export function StateView({ loading, error, retry, children, empty, emptyMessage = 'No data available.' }: StateViewProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-surface)] border border-red-500/30 rounded-xl p-6 text-center">
        <h3 className="text-red-400 font-medium mb-2">Unable to load content</h3>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">{error.message}</p>
        {retry && (
          <button 
            onClick={retry}
            className="px-4 py-2 bg-[var(--color-primary)] text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-8 text-center text-[var(--color-text-secondary)]">
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
