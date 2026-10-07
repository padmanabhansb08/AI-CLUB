import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { AchievementBadge } from './AchievementBadge';
import { AchievementCategoryBadge } from './AchievementCategoryBadge';
import type { AchievementItem } from '../../types/achievements';

interface AchievementCardProps {
  achievement: AchievementItem;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const isEarned = !!achievement.earned;
  const progress = achievement.progress || {
    current: 0,
    target: (achievement.criteria_config?.target as number) || 1,
    percentage: 0,
  };

  const formattedDate = achievement.earned_at
    ? new Date(achievement.earned_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Link
      to={`/achievements/${achievement.slug || achievement.id}`}
      className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isEarned
          ? 'bg-[#FFFFFF] border-amber-300 shadow-sm hover:shadow-md hover:-translate-y-0.5'
          : 'bg-[#FFFFFF] border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.2)] hover:shadow-sm hover:-translate-y-0.5'
      }`}
    >
      <div>
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <AchievementBadge
            iconName={achievement.icon}
            isUnlocked={isEarned}
            points={achievement.points}
            size="lg"
          />

          <div className="flex flex-col items-end gap-1.5">
            <AchievementCategoryBadge category={achievement.category} />
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                isEarned
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-[#FAF9F6] text-[#66645F] border-[rgba(17,17,17,0.08)]'
              }`}
            >
              +{achievement.points} PTS
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-[#111111] group-hover:text-black transition-colors mb-1.5 flex items-center gap-1.5">
          {achievement.name}
          {isEarned && <CheckCircle2 size={16} className="text-amber-600 shrink-0" />}
        </h3>

        <p className="text-xs text-[#66645F] line-clamp-2 leading-relaxed mb-4">
          {achievement.description}
        </p>
      </div>

      {/* Progress & Footer */}
      <div className="pt-3 border-t border-[rgba(17,17,17,0.06)] mt-auto">
        {isEarned ? (
          <div className="flex items-center justify-between text-xs text-amber-800 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-600" />
              <span>Unlocked</span>
            </span>
            {formattedDate && <span className="text-[#92908A] text-[11px] font-mono">{formattedDate}</span>}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#66645F] mb-1.5">
              <span>Progress</span>
              <span className="font-semibold text-[#111111] font-mono">
                {progress.current} / {progress.target} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#EBE9E3] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#050505] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-[11px] text-[#66645F] group-hover:text-[#111111] transition-colors">
          <span>View details</span>
          <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
