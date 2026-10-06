import React from 'react';
import type { CourseDifficulty } from '../../types/courses';

interface Props {
  difficulty: CourseDifficulty | string;
}

export const CourseDifficultyBadge: React.FC<Props> = ({ difficulty }) => {
  const norm = (difficulty || 'BEGINNER').toUpperCase();

  switch (norm) {
    case 'EXPERT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30 uppercase">
          Expert
        </span>
      );
    case 'ADVANCED':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 uppercase">
          Advanced
        </span>
      );
    case 'INTERMEDIATE':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase">
          Intermediate
        </span>
      );
    case 'BEGINNER':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
          Beginner
        </span>
      );
  }
};
