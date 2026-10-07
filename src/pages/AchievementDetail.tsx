import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { achievementsApi } from '../api/achievements.api';
import { AchievementBadge } from '../components/achievements/AchievementBadge';
import { AchievementCategoryBadge } from '../components/achievements/AchievementCategoryBadge';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Sparkles,
  Calendar,
  BookOpen,
  FolderGit2,
  Users,
  Target,
  Clock,
  Shield,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import type { AchievementItem } from '../types/achievements';

export const AchievementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [achievement, setAchievement] = useState<AchievementItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    achievementsApi
      .getAchievement(id)
      .then((data) => {
        setAchievement(data);
      })
      .catch((err) => {
        console.error('Failed to load achievement:', err);
        setError('Achievement not found or could not be loaded.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Achievement Details">
        <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center text-[#66645F]">
          <Loader2 size={36} className="animate-spin text-[#111111] mb-3" />
          <p className="text-sm font-medium">Loading achievement details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !achievement) {
    return (
      <DashboardLayout pageTitle="Achievement Not Found">
        <div className="max-w-md mx-auto text-center py-20 bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-3xl p-8 shadow-sm">
          <Shield size={48} className="mx-auto text-[#92908A] mb-4" />
          <h2 className="text-lg font-bold text-[#111111] mb-2">Achievement Not Found</h2>
          <p className="text-xs text-[#66645F] mb-6">
            {error || "The achievement you're looking for doesn't exist or is currently inactive."}
          </p>
          <button
            onClick={() => navigate('/achievements')}
            className="pill-btn px-5 py-2.5 inline-flex items-center gap-2 text-xs"
          >
            <ArrowLeft size={14} />
            <span>Back to Achievements</span>
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isEarned = !!achievement.earned;
  const progress = achievement.progress || {
    current: 0,
    target: (achievement.criteria_config?.target as number) || 1,
    percentage: 0,
  };

  const getRelatedActivityLink = () => {
    switch (achievement.category) {
      case 'EVENT':
        return { label: 'Explore Events', path: '/events', icon: Calendar };
      case 'LEARNING':
        return { label: 'Browse Courses', path: '/courses', icon: BookOpen };
      case 'PROJECT':
        return { label: 'View Club Projects', path: '/projects', icon: FolderGit2 };
      case 'TEAM':
        return { label: 'Discover Teams', path: '/projects', icon: Users };
      default:
        return null;
    }
  };

  const relatedAction = getRelatedActivityLink();

  const formattedEarnedDate = achievement.earned_at
    ? new Date(achievement.earned_at).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <DashboardLayout pageTitle={achievement.name}>
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Back Link */}
        <button
          onClick={() => navigate('/achievements')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#66645F] hover:text-[#111111] transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Achievements</span>
        </button>

        {/* Hero Card */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border transition-all ${
            isEarned
              ? 'bg-[#FFFFFF] border-amber-300 shadow-sm'
              : 'bg-[#FFFFFF] border-[rgba(17,17,17,0.08)] shadow-sm'
          }`}
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <AchievementBadge
              iconName={achievement.icon}
              isUnlocked={isEarned}
              points={achievement.points}
              size="xl"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <AchievementCategoryBadge category={achievement.category} />
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isEarned
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-[#FAF9F6] text-[#66645F] border-[rgba(17,17,17,0.08)]'
                  }`}
                >
                  +{achievement.points} CLUB POINTS
                </span>

                {isEarned ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 size={13} />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FAF9F6] text-[#66645F] border border-[rgba(17,17,17,0.08)]">
                    <Lock size={13} />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#111111] tracking-tight">{achievement.name}</h1>
              <p className="text-sm text-[#66645F] mt-2 leading-relaxed">
                {achievement.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Criteria Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Card */}
          <div className="rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                  <Target size={18} className="text-[#111111]" />
                  <span>Your Progress</span>
                </h3>
                <span className="text-xs font-bold font-mono text-[#111111]">
                  {progress.percentage}% Complete
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#66645F]">
                  <span>Current Status</span>
                  <span className="font-semibold text-[#111111] font-mono">
                    {progress.current} / {progress.target}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-[#EBE9E3] rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-[#050505] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                  />
                </div>

                <p className="text-[11px] text-[#66645F] leading-relaxed pt-1">
                  {isEarned
                    ? 'Congratulations! You have satisfied all criteria required for this milestone.'
                    : `You need ${Math.max(0, progress.target - progress.current)} more to unlock this achievement.`}
                </p>
              </div>
            </div>

            {isEarned && formattedEarnedDate && (
              <div className="mt-6 pt-4 border-t border-[rgba(17,17,17,0.08)] flex items-center gap-2 text-xs text-[#66645F]">
                <Clock size={15} className="text-amber-600" />
                <span>Earned on {formattedEarnedDate}</span>
              </div>
            )}
          </div>

          {/* Criteria & Action Card */}
          <div className="rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-amber-600" />
                <span>Unlock Criteria</span>
              </h3>

              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)] space-y-2">
                <div className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
                  Type: {achievement.criteria_type?.replace(/_/g, ' ')}
                </div>
                <p className="text-xs text-[#66645F] leading-relaxed">
                  {achievement.criteria_config?.description ||
                    `Reach ${progress.target} ${achievement.criteria_type?.toLowerCase().replace(/_/g, ' ')} across AI Club activities.`}
                </p>
              </div>
            </div>

            {relatedAction && (
              <div className="mt-6 pt-4 border-t border-[rgba(17,17,17,0.08)]">
                <Link
                  to={relatedAction.path}
                  className="w-full py-2.5 px-4 rounded-full bg-[#050505] text-[#FFFFFF] hover:bg-[#222222] text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <relatedAction.icon size={16} />
                  <span>{relatedAction.label}</span>
                  <ExternalLink size={14} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

