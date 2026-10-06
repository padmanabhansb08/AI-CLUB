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
          ? 'bg-gradient-to-b from-[#181d2e] to-[#121624] border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-500/5 hover:-translate-y-1'
          : 'bg-[#121624]/60 border-white/5 hover:border-white/15 hover:bg-[#121624] hover:-translate-y-0.5'
      }`}
    >
      {/* Top ambient glow for unlocked achievements */}
      {isEarned && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
      )}

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
              className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                isEarned
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              +{achievement.points} PTS
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-1.5 flex items-center gap-1.5">
          {achievement.name}
          {isEarned && <CheckCircle2 size={16} className="text-amber-400 shrink-0" />}
        </h3>

        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
          {achievement.description}
        </p>
      </div>

      {/* Progress & Footer */}
      <div className="pt-3 border-t border-white/5 mt-auto">
        {isEarned ? (
          <div className="flex items-center justify-between text-xs text-amber-300/90 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span>Unlocked</span>
            </span>
            {formattedDate && <span className="text-gray-400 text-[11px]">{formattedDate}</span>}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
              <span>Progress</span>
              <span className="font-semibold text-gray-300">
                {progress.current} / {progress.target} ({progress.percentage}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 text-[11px] text-gray-500 group-hover:text-cyan-400 transition-colors">
          <span>View details</span>
          <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
