import React from 'react';
import {
  Trophy,
  Sparkles,
  Star,
  BookOpen,
  Calendar,
  Users,
  Target,
  Flame,
  Zap,
  Lock,
} from 'lucide-react';

interface AchievementBadgeProps {
  iconName?: string;
  isUnlocked?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  points?: number;
  className?: string;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  iconName,
  isUnlocked = false,
  size = 'md',
  points,
  className = '',
}) => {
  const renderIcon = () => {
    const iconSize = size === 'sm' ? 14 : size === 'md' ? 20 : size === 'lg' ? 28 : 36;
    const name = iconName?.toLowerCase() || '';

    if (!isUnlocked) {
      return <Lock size={iconSize} className="text-[#92908A]" />;
    }

    if (name.includes('calendar') || name.includes('event')) {
      return <Calendar size={iconSize} className="text-indigo-600" />;
    }
    if (name.includes('book') || name.includes('course') || name.includes('learn')) {
      return <BookOpen size={iconSize} className="text-emerald-600" />;
    }
    if (name.includes('user') || name.includes('team') || name.includes('community')) {
      return <Users size={iconSize} className="text-purple-600" />;
    }
    if (name.includes('flame') || name.includes('streak')) {
      return <Flame size={iconSize} className="text-orange-600" />;
    }
    if (name.includes('zap') || name.includes('milestone')) {
      return <Zap size={iconSize} className="text-amber-600" />;
    }
    if (name.includes('target')) {
      return <Target size={iconSize} className="text-rose-600" />;
    }
    if (name.includes('star')) {
      return <Star size={iconSize} className="text-amber-600" />;
    }
    if (name.includes('sparkle')) {
      return <Sparkles size={iconSize} className="text-pink-600" />;
    }

    return <Trophy size={iconSize} className="text-amber-600" />;
  };

  const containerSizes = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-12 h-12 rounded-xl text-sm',
    lg: 'w-16 h-16 rounded-2xl text-base',
    xl: 'w-20 h-20 rounded-3xl text-lg',
  };

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`${containerSizes[size]} flex items-center justify-center border transition-all duration-300 ${
          isUnlocked
            ? 'bg-[#FAF9F6] border-[rgba(17,17,17,0.12)] shadow-sm'
            : 'bg-[#F5F4F0] border-[rgba(17,17,17,0.06)] opacity-60'
        }`}
      >
        {renderIcon()}
      </div>

      {isUnlocked && points !== undefined && size !== 'sm' && (
        <span className="absolute -bottom-1.5 -right-1 px-1.5 py-0.5 bg-[#050505] text-[#FFFFFF] font-mono font-bold text-[9px] rounded-full shadow-sm">
          +{points}
        </span>
      )}
    </div>
  );
};

