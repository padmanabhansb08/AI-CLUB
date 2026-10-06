import React from 'react';

interface Props {
  category: string;
}

export const CourseCategoryBadge: React.FC<Props> = ({ category }) => {
  const formatName = (cat: string) => {
    return cat.replace(/_/g, ' ');
  };

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
      {formatName(category || 'GENERAL')}
    </span>
  );
};
