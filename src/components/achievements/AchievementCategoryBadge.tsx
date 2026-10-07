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
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'LEARNING':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PROJECT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'TEAM':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'COMMUNITY':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'MILESTONE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SPECIAL':
      default:
        return 'bg-[#FAF9F6] text-[#111111] border-[rgba(17,17,17,0.12)]';
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
