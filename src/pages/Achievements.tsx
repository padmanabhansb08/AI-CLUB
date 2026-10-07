import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ErrorState } from '../components/common/ErrorState';
import { achievementsApi } from '../api/achievements.api';
import { AchievementCard } from '../components/achievements/AchievementCard';
import {
  Trophy,
  Star,
  Target,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { AchievementItem, MemberAchievementStats } from '../types/achievements';

const CATEGORIES = [
  'ALL',
  'EVENT',
  'LEARNING',
  'PROJECT',
  'TEAM',
  'COMMUNITY',
  'MILESTONE',
  'SPECIAL',
];

type TabType = 'ALL' | 'EARNED' | 'IN_PROGRESS' | 'LOCKED';

export const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [stats, setStats] = useState<MemberAchievementStats>({
    totalEarned: 0,
    totalPoints: 0,
    totalActiveAchievements: 0,
    inProgressCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [achievementsRes, statsRes] = await Promise.all([
        achievementsApi.getAchievements({ limit: 100 }),
        achievementsApi.getMyStats(),
      ]);
      setAchievements(achievementsRes.items);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load achievements data', err);
      setError(err instanceof Error ? err.message : 'Achievements could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setToastMessage(null);
    try {
      const res = await achievementsApi.evaluateMyAchievements();
      if (res.newlyAwardedCount > 0) {
        setToastMessage(`🎉 Awesome! You unlocked ${res.newlyAwardedCount} new achievement(s)!`);
      } else {
        setToastMessage('Recognition up to date! Keep participating to unlock more.');
      }
      await loadData();
    } catch (err) {
      console.error('Evaluation failed:', err);
      setToastMessage('Could not complete evaluation at this time.');
    } finally {
      setEvaluating(false);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  // Filtered achievements by tab, category, and search term
  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      // Tab filter
      if (activeTab === 'EARNED' && !a.earned) return false;
      if (activeTab === 'IN_PROGRESS' && (a.earned || !a.progress || a.progress.current === 0))
        return false;
      if (activeTab === 'LOCKED' && a.earned) return false;

      // Category filter
      if (selectedCategory !== 'ALL' && a.category?.toUpperCase() !== selectedCategory)
        return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const nameMatch = a.name.toLowerCase().includes(query);
        const descMatch = a.description.toLowerCase().includes(query);
        const catMatch = a.category?.toLowerCase().includes(query);
        if (!nameMatch && !descMatch && !catMatch) return false;
      }

      return true;
    });
  }, [achievements, activeTab, selectedCategory, searchTerm]);

  if (error && !loading) return <DashboardLayout pageTitle="Achievements"><ErrorState message={error} onRetry={loadData} /></DashboardLayout>;
  return (
    <DashboardLayout pageTitle="Achievements">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Hero Banner with Stats */}
        <div className="rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF9F6] text-[#111111] border border-[rgba(17,17,17,0.1)]">
                  Recognition & Milestones
                </span>
                <span className="text-[#66645F] text-xs">AI CLUB Badges</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
                Achievements & Credentials
              </h1>
              <p className="text-sm text-[#66645F] mt-1 max-w-xl">
                Earn recognition for attending seminars, collaborating in research pods, completing courses,
                and contributing to AI Club initiatives.
              </p>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="pill-btn flex items-center justify-center gap-2 px-6 py-3 shrink-0"
            >
              <RefreshCw size={16} className={evaluating ? 'animate-spin' : ''} />
              <span>{evaluating ? 'Evaluating Activity...' : 'Check My Achievements'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[rgba(17,17,17,0.08)]">
            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[rgba(17,17,17,0.06)]">
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <Trophy size={18} />
                <span className="text-xs font-semibold text-[#111111]">Earned</span>
              </div>
              <div className="text-2xl font-black text-[#111111] font-mono">{stats.totalEarned}</div>
              <div className="text-[11px] text-[#66645F] mt-0.5">
                of {stats.totalActiveAchievements} unlocked
              </div>
            </div>

            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[rgba(17,17,17,0.06)]">
              <div className="flex items-center gap-2 text-[#111111] mb-1">
                <Star size={18} />
                <span className="text-xs font-semibold text-[#111111]">Club Points</span>
              </div>
              <div className="text-2xl font-black text-[#111111] font-mono">{stats.totalPoints}</div>
              <div className="text-[11px] text-[#66645F] mt-0.5">Total recognition score</div>
            </div>

            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[rgba(17,17,17,0.06)]">
              <div className="flex items-center gap-2 text-emerald-700 mb-1">
                <Target size={18} />
                <span className="text-xs font-semibold text-[#111111]">In Progress</span>
              </div>
              <div className="text-2xl font-black text-[#111111] font-mono">{stats.inProgressCount}</div>
              <div className="text-[11px] text-[#66645F] mt-0.5">Actively tracked goals</div>
            </div>

            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[rgba(17,17,17,0.06)]">
              <div className="flex items-center gap-2 text-[#111111] mb-1">
                <Sparkles size={18} />
                <span className="text-xs font-semibold text-[#111111]">Completion</span>
              </div>
              <div className="text-2xl font-black text-[#111111] font-mono">
                {stats.totalActiveAchievements > 0
                  ? Math.round((stats.totalEarned / stats.totalActiveAchievements) * 100)
                  : 0}
                %
              </div>
              <div className="text-[11px] text-[#66645F] mt-0.5">Overall achievement rate</div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-700" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs text-[#66645F] hover:text-[#111111] px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters and Navigation Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] overflow-x-auto shadow-sm">
              {(
                [
                  { id: 'ALL', label: 'All Achievements', icon: Layers },
                  { id: 'EARNED', label: 'Earned', icon: CheckCircle2 },
                  { id: 'IN_PROGRESS', label: 'In Progress', icon: Target },
                  { id: 'LOCKED', label: 'Locked', icon: Lock },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
                        : 'text-[#66645F] hover:text-[#111111]'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#92908A]"
              />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.12)] rounded-full pl-10 pr-4 py-2 text-xs text-[#111111] placeholder-[#92908A] focus:outline-none focus:border-[#111111] transition-colors shadow-sm"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-[#050505] text-[#FFFFFF] border-[#050505]'
                    : 'bg-[#FFFFFF] text-[#66645F] border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.2)] hover:text-[#111111]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-[#FFFFFF] animate-pulse border border-[rgba(17,17,17,0.08)]"
              />
            ))}
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] p-8 shadow-sm">
            <Trophy size={48} className="mx-auto text-[#92908A] mb-3 opacity-50" />
            <h3 className="text-base font-bold text-[#111111]">No achievements match your criteria</h3>
            <p className="text-xs text-[#66645F] max-w-sm mx-auto mt-1">
              Try adjusting your category filter, tab selection, or search query.
            </p>
            {(selectedCategory !== 'ALL' || activeTab !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setActiveTab('ALL');
                  setSearchTerm('');
                }}
                className="mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#050505] text-[#FFFFFF] hover:bg-[#222222] transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
export default Achievements;
