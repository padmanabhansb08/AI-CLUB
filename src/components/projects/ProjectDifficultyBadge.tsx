import React from 'react';

interface Props {
  difficulty: string;
  className?: string;
}

export const ProjectDifficultyBadge: React.FC<Props> = ({ difficulty, className = '' }) => {
  const norm = (difficulty || '').toUpperCase();
  let color = '#10b981';
  let label = 'Beginner';

  switch (norm) {
    case 'INTERMEDIATE':
      color = '#3b82f6';
      label = 'Intermediate';
      break;
    case 'ADVANCED':
      color = '#f59e0b';
      label = 'Advanced';
      break;
    case 'EXPERT':
      color = '#ef4444';
      label = 'Expert';
      break;
    default:
      color = '#10b981';
      label = 'Beginner';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}
      style={{
        backgroundColor: `${color}15`,
        border: `1px solid ${color}35`,
        color,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full mr-1.5"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
};
