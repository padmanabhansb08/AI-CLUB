import React from 'react';
import type { CourseStatus } from '../../types/courses';

interface Props {
  status: CourseStatus | string;
}

export const CourseStatusBadge: React.FC<Props> = ({ status }) => {
  const norm = (status || 'DRAFT').toUpperCase();

  switch (norm) {
    case 'PUBLISHED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Published
        </span>
      );
    case 'UNPUBLISHED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          Unpublished
        </span>
      );
    case 'ARCHIVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-400 border border-gray-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          Archived
        </span>
      );
    case 'DRAFT':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
          Draft
        </span>
      );
  }
};
