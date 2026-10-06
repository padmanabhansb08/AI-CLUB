import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Calendar, BookOpen, FolderGit2 } from 'lucide-react';
import type { CourseRecommendation, EventRecommendation, ProjectRecommendation, RecommendationStrength } from '../../types/ai';

interface RecommendationCardProps {
  type: 'course' | 'event' | 'project';
  item: CourseRecommendation | EventRecommendation | ProjectRecommendation;
}

export const AIRecommendationCard: React.FC<RecommendationCardProps> = ({ type, item }) => {
  const getStrengthBadge = (strength: RecommendationStrength) => {
    switch (strength) {
      case 'STRONG_MATCH':
        return { label: 'Strong Match', bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' };
      case 'GOOD_MATCH':
        return { label: 'Good Match', bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', border: 'rgba(59, 130, 246, 0.3)' };
      case 'GROWTH_OPPORTUNITY':
      default:
        return { label: 'Growth Opportunity', bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' };
    }
  };

  const badge = getStrengthBadge(item.matchStrength);

  let linkTo = '#';
  let typeLabel = '';
  let IconComponent = BookOpen;

  if (type === 'course') {
    const course = item as CourseRecommendation;
    linkTo = `/courses/${course.courseId}`;
    typeLabel = `${course.category} • ${course.difficulty}`;
    IconComponent = BookOpen;
  } else if (type === 'event') {
    const event = item as EventRecommendation;
    linkTo = `/events/${event.eventId}`;
    typeLabel = `${event.eventType}${event.location ? ` • ${event.location}` : ''}`;
    IconComponent = Calendar;
  } else {
    const project = item as ProjectRecommendation;
    linkTo = `/projects/${project.projectId}`;
    typeLabel = `${project.category || 'Tech'}${project.difficulty ? ` • ${project.difficulty}` : ''}`;
    IconComponent = FolderGit2;
  }

  return (
    <div 
      className="ai-recommendation-card" 
      style={{
        background: 'var(--card-bg, #1e293b)',
        borderRadius: '12px',
        border: '1px solid var(--border-color, #334155)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted, #94a3b8)', fontSize: '0.85rem' }}>
            <IconComponent size={16} />
            <span>{typeLabel}</span>
          </div>
          <span 
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: badge.bg,
              color: badge.text,
              border: `1px solid ${badge.border}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Sparkles size={12} />
            {badge.label}
          </span>
        </div>

        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-color, #f8fafc)', marginBottom: '0.75rem' }}>
          {item.title}
        </h3>

        {/* Explainability bullet points */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-color, #38bdf8)', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            Why recommended:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.85rem', color: 'var(--text-muted, #cbd5e1)', lineHeight: 1.4 }}>
            {item.reasons.map((reason, idx) => (
              <li key={idx} style={{ marginBottom: '0.25rem' }}>{reason}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--border-color, #334155)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
          Match score: {Math.round(item.score * 100)}%
        </span>
        <Link 
          to={linkTo} 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: 'var(--accent-color, #38bdf8)',
            textDecoration: 'none',
          }}
        >
          View {type === 'course' ? 'Course' : type === 'event' ? 'Event' : 'Project'}
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
