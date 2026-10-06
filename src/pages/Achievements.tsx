import React, { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
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
  const [evaluating, setEvaluating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [achievementsRes, statsRes] = await Promise.all([
        achievementsApi.getAchievements({ limit: 100 }),
        achievementsApi.getMyStats(),
      ]);
      setAchievements(achievementsRes.items);
      setStats(statsRes);
    } catch (err) {
      console.error('Failed to load achievements data', err);
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
        const matchesName = a.name.toLowerCase().includes(query);
        const matchesDesc = a.description.toLowerCase().includes(query);
        const matchesCat = a.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [achievements, activeTab, selectedCategory, searchTerm]);

  return (
    <DashboardLayout pageTitle="Achievements">
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Hero Banner with Stats */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#121624] via-[#1a2035] to-[#121624] border border-white/10 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Sprint 6 Recognition
                </span>
                <span className="text-gray-400 text-xs">AI CLUB Milestones</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Achievements & Rewards
              </h1>
              <p className="text-sm text-gray-300 mt-1 max-w-xl">
                Earn recognition for attending events, collaborating on projects, completing courses,
                and contributing to the AI Club community.
              </p>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 disabled:opacity-50 shrink-0"
            >
              <RefreshCw size={16} className={evaluating ? 'animate-spin' : ''} />
              <span>{evaluating ? 'Evaluating Activity...' : 'Check My Achievements'}</span>
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <Trophy size={18} />
                <span className="text-xs font-semibold text-gray-300">Earned</span>
              </div>
              <div className="text-2xl font-black text-white">{stats.totalEarned}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                of {stats.totalActiveAchievements} unlocked
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-cyan-400 mb-1">
                <Star size={18} />
                <span className="text-xs font-semibold text-gray-300">Club Points</span>
              </div>
              <div className="text-2xl font-black text-white">{stats.totalPoints}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Total recognition score</div>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Target size={18} />
                <span className="text-xs font-semibold text-gray-300">In Progress</span>
              </div>
              <div className="text-2xl font-black text-white">{stats.inProgressCount}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Actively tracked goals</div>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Sparkles size={18} />
                <span className="text-xs font-semibold text-gray-300">Completion</span>
              </div>
              <div className="text-2xl font-black text-white">
                {stats.totalActiveAchievements > 0
                  ? Math.round((stats.totalEarned / stats.totalActiveAchievements) * 100)
                  : 0}
                %
              </div>
              <div className="text-[11px] text-gray-400 mt-0.5">Overall achievement rate</div>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-cyan-400" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters and Navigation Tabs */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#121624] border border-white/10 overflow-x-auto">
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121624] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/15 hover:text-gray-300'
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
                className="h-48 rounded-2xl bg-white/[0.03] animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="py-16 text-center rounded-3xl bg-[#121624]/60 border border-white/10 p-8">
            <Trophy size={48} className="mx-auto text-gray-600 mb-3 opacity-50" />
            <h3 className="text-base font-bold text-white">No achievements match your criteria</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              Try adjusting your category filter, tab selection, or search query.
            </p>
            {(selectedCategory !== 'ALL' || activeTab !== 'ALL' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setActiveTab('ALL');
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
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
