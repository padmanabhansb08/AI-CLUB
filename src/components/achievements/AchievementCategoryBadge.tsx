import React from 'react';
import type { AchievementCategory } from '../../types/achievements';

interface CategoryBadgeProps {
  category: AchievementCategory | string;
  className?: string;
}

export const AchievementCategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  className = '',
}) => {
  const getBadgeStyle = () => {
    switch (category?.toUpperCase()) {
      case 'EVENT':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'LEARNING':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'PROJECT':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
      case 'TEAM':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'COMMUNITY':
        return 'bg-pink-500/10 text-pink-300 border-pink-500/30';
      case 'MILESTONE':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'SPECIAL':
      default:
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getBadgeStyle()} ${className}`}
    >
      {category}
    </span>
  );
};
