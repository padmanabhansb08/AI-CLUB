import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  message = 'There is currently no data to display in this section.',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div
      className="empty-state-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        border: '1px dashed var(--border-color, rgba(255, 255, 255, 0.1))',
        borderRadius: '12px',
        backgroundColor: 'var(--surface-color, rgba(255, 255, 255, 0.02))',
      }}
    >
      <div
        style={{
          width: '3.5rem',
          height: '3.5rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          color: 'var(--text-tertiary, rgba(255, 255, 255, 0.4))',
        }}
      >
        {icon || <Inbox size={26} />}
      </div>
      <h3 style={{
        fontSize: '1.1rem',
        fontWeight: 600,
        marginBottom: '0.4rem',
        color: 'var(--text-primary, #ffffff)',
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-secondary, rgba(255, 255, 255, 0.6))',
        maxWidth: '380px',
        lineHeight: 1.5,
        marginBottom: onAction && actionText ? '1.5rem' : '0',
      }}>
        {message}
      </p>
      {onAction && actionText && (
        <Button onClick={onAction} variant="secondary">
          {actionText}
        </Button>
      )}
    </div>
  );
};
