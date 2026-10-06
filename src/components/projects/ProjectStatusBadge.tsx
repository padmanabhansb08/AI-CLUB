import React from 'react';

interface Props {
  status: string;
  className?: string;
}

export const ProjectStatusBadge: React.FC<Props> = ({ status, className = '' }) => {
  const normalized = (status || '').toUpperCase().replace(/\s+/g, '_');

  let bg = 'rgba(100, 116, 139, 0.15)';
  let border = 'rgba(100, 116, 139, 0.3)';
  let text = '#94a3b8';
  let label = status;

  switch (normalized) {
    case 'OPEN':
      bg = 'rgba(16, 185, 129, 0.12)';
      border = 'rgba(16, 185, 129, 0.35)';
      text = '#10b981';
      label = 'OPEN FOR COLLABORATION';
      break;
    case 'IN_PROGRESS':
      bg = 'rgba(59, 130, 246, 0.12)';
      border = 'rgba(59, 130, 246, 0.35)';
      text = '#3b82f6';
      label = 'IN PROGRESS';
      break;
    case 'COMPLETED':
      bg = 'rgba(168, 85, 247, 0.12)';
      border = 'rgba(168, 85, 247, 0.35)';
      text = '#a855f7';
      label = 'COMPLETED';
      break;
    case 'DRAFT':
      bg = 'rgba(234, 179, 8, 0.12)';
      border = 'rgba(234, 179, 8, 0.35)';
      text = '#eab308';
      label = 'DRAFT';
      break;
    case 'ARCHIVED':
      bg = 'rgba(148, 163, 184, 0.1)';
      border = 'rgba(148, 163, 184, 0.25)';
      text = '#94a3b8';
      label = 'ARCHIVED';
      break;
    case 'CANCELLED':
      bg = 'rgba(239, 68, 68, 0.12)';
      border = 'rgba(239, 68, 68, 0.35)';
      text = '#ef4444';
      label = 'CANCELLED';
      break;
    default:
      label = status;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase ${className}`}
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: text }}
      />
      {label}
    </span>
  );
};
