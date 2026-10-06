import React from 'react';

interface Props {
  domain: string;
  className?: string;
}

const DOMAIN_FORMATS: Record<string, { label: string; color: string }> = {
  AI_ML: { label: 'AI & Machine Learning', color: '#6366f1' },
  GENERATIVE_AI: { label: 'Generative AI', color: '#ec4899' },
  DATA_SCIENCE: { label: 'Data Science', color: '#06b6d4' },
  COMPUTER_VISION: { label: 'Computer Vision', color: '#8b5cf6' },
  NLP: { label: 'NLP & LLMs', color: '#3b82f6' },
  WEB_DEVELOPMENT: { label: 'Web Development', color: '#10b981' },
  APP_DEVELOPMENT: { label: 'Mobile App', color: '#14b8a6' },
  DEVOPS: { label: 'DevOps & MLOps', color: '#f59e0b' },
  CLOUD: { label: 'Cloud Architecture', color: '#0284c7' },
  CYBERSECURITY: { label: 'Cybersecurity', color: '#ef4444' },
  ROBOTICS: { label: 'Robotics & Control', color: '#f97316' },
  IOT: { label: 'Internet of Things', color: '#84cc16' },
  BLOCKCHAIN: { label: 'Web3 & Blockchain', color: '#d946ef' },
  OPEN_SOURCE: { label: 'Open Source', color: '#22c55e' },
  OTHER: { label: 'Innovation', color: '#64748b' },
};

export const ProjectDomainBadge: React.FC<Props> = ({ domain, className = '' }) => {
  const key = (domain || '').toUpperCase().replace(/\s+/g, '_');
  const config = DOMAIN_FORMATS[key] || {
    label: domain?.replace(/_/g, ' ') || 'General',
    color: '#6366f1',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide ${className}`}
      style={{
        backgroundColor: `${config.color}15`,
        border: `1px solid ${config.color}35`,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
};
