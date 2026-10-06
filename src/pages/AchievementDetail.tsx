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
        <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center text-gray-400">
          <Loader2 size={36} className="animate-spin text-cyan-400 mb-3" />
          <p className="text-sm">Loading achievement details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !achievement) {
    return (
      <DashboardLayout pageTitle="Achievement Not Found">
        <div className="max-w-md mx-auto text-center py-20">
          <Shield size={48} className="mx-auto text-gray-600 mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">Achievement Not Found</h2>
          <p className="text-xs text-gray-400 mb-6">
            {error || "The achievement you're looking for doesn't exist or is currently inactive."}
          </p>
          <button
            onClick={() => navigate('/achievements')}
            className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition-colors inline-flex items-center gap-2"
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Achievements</span>
        </button>

        {/* Hero Card */}
        <div
          className={`relative overflow-hidden rounded-3xl p-6 sm:p-10 border transition-all ${
            isEarned
              ? 'bg-gradient-to-br from-[#1a1f33] via-[#141829] to-[#0e111d] border-amber-500/40 shadow-2xl shadow-amber-500/10'
              : 'bg-[#121624] border-white/10'
          }`}
        >
          {isEarned && (
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          )}

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
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  +{achievement.points} CLUB POINTS
                </span>

                {isEarned ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 size={13} />
                    <span>Unlocked</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/5 text-gray-400 border border-white/10">
                    <Lock size={13} />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white">{achievement.name}</h1>
              <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                {achievement.description}
              </p>
            </div>
          </div>
        </div>

        {/* Progress & Criteria Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Progress Card */}
          <div className="rounded-2xl bg-[#121624] border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Target size={18} className="text-cyan-400" />
                  <span>Your Progress</span>
                </h3>
                <span className="text-xs font-bold text-cyan-300">
                  {progress.percentage}% Complete
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Current Status</span>
                  <span className="font-semibold text-white">
                    {progress.current} / {progress.target}
                  </span>
                </div>

                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progress.percentage))}%` }}
                  />
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
                  {isEarned
                    ? 'Congratulations! You have satisfied all criteria required for this milestone.'
                    : `You need ${Math.max(0, progress.target - progress.current)} more to unlock this achievement.`}
                </p>
              </div>
            </div>

            {isEarned && formattedEarnedDate && (
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-gray-400">
                <Clock size={15} className="text-amber-400" />
                <span>Earned on {formattedEarnedDate}</span>
              </div>
            )}
          </div>

          {/* Criteria & Action Card */}
          <div className="rounded-2xl bg-[#121624] border border-white/10 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-amber-400" />
                <span>Unlock Criteria</span>
              </h3>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Type: {achievement.criteria_type?.replace(/_/g, ' ')}
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {achievement.criteria_config?.description ||
                    `Reach ${progress.target} ${achievement.criteria_type?.toLowerCase().replace(/_/g, ' ')} across AI Club activities.`}
                </p>
              </div>
            </div>

            {relatedAction && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <Link
                  to={relatedAction.path}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2"
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
