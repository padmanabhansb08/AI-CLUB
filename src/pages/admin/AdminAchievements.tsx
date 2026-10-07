import { confirmAction } from '../../services/confirmation';
import { useDialog } from '../../hooks/useDialog';
import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { achievementsApi } from '../../api/achievements.api';
import { AchievementBadge } from '../../components/achievements/AchievementBadge';
import { AchievementCategoryBadge } from '../../components/achievements/AchievementCategoryBadge';
import {
  Trophy,
  Plus,
  Search,
  Edit2,
  Trash2,
  BarChart3,
  X,
  Loader2,
  Users,
  Sparkles,
} from 'lucide-react';
import type {
  AchievementItem,
  AchievementCategory,
  AchievementCriteriaType,
  AdminAchievementStats,
  AdminGlobalAchievementStats,
} from '../../types/achievements';

const CATEGORIES: AchievementCategory[] = [
  'EVENT',
  'LEARNING',
  'PROJECT',
  'TEAM',
  'COMMUNITY',
  'MILESTONE',
  'SPECIAL',
];

const CRITERIA_TYPES: AchievementCriteriaType[] = [
  'EVENT_COUNT',
  'EVENT_ATTENDANCE_COUNT',
  'COURSE_ENROLLMENT_COUNT',
  'COURSE_COMPLETION_COUNT',
  'LESSON_COMPLETION_COUNT',
  'PROJECT_COUNT',
  'PROJECT_COMPLETION_COUNT',
  'TEAM_PARTICIPATION_COUNT',
  'MILESTONE_COMPLETION_COUNT',
  'HACKATHON_PARTICIPATION',
  'SPECIAL',
];

export const AdminAchievements: React.FC = () => {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [globalStats, setGlobalStats] = useState<AdminGlobalAchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    slug: string;
    description: string;
    icon: string;
    category: AchievementCategory;
    criteria_type: AchievementCriteriaType;
    target: number;
    points: number;
    is_active: boolean;
  }>({
    name: '',
    slug: '',
    description: '',
    icon: 'Trophy',
    category: 'EVENT',
    criteria_type: 'EVENT_ATTENDANCE_COUNT',
    target: 1,
    points: 10,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // Stats Modal State
  const [selectedStats, setSelectedStats] = useState<AdminAchievementStats | null>(null);
  const editorRef = useDialog(isFormOpen, () => setIsFormOpen(false));
  const statsRef = useDialog(!!selectedStats, () => setSelectedStats(null));

  const loadData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        achievementsApi.getAchievements({ limit: 100 }),
        achievementsApi.getGlobalStats(),
      ]);
      setAchievements(listRes.items);
      setGlobalStats(statsRes);
    } catch (err) {
      console.error('Failed to load admin achievement data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: 'Trophy',
      category: 'EVENT',
      criteria_type: 'EVENT_ATTENDANCE_COUNT',
      target: 1,
      points: 10,
      is_active: true,
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (ach: AchievementItem) => {
    setFormData({
      name: ach.name,
      slug: ach.slug,
      description: ach.description,
      icon: ach.icon,
      category: ach.category,
      criteria_type: ach.criteria_type,
      target: (ach.criteria_config?.target as number) || 1,
      points: ach.points,
      is_active: ach.is_active,
    });
    setEditingId(ach.id);
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;

    setSaving(true);
    try {
      const payload = {
        name: formData.name.trim(),
        title: formData.name.trim(),
        slug:
          formData.slug.trim() ||
          formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000),
        description: formData.description.trim(),
        icon: formData.icon,
        category: formData.category,
        criteria_type: formData.criteria_type,
        criteria_config: { target: Number(formData.target) || 1 },
        points: Number(formData.points) || 10,
        is_active: formData.is_active,
      };

      if (editingId) {
        await achievementsApi.updateAchievement(editingId, payload);
      } else {
        await achievementsApi.createAchievement(payload);
      }
      setIsFormOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to save achievement:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (ach: AchievementItem) => {
    try {
      if (ach.is_active) {
        await achievementsApi.deactivateAchievement(ach.id);
      } else {
        await achievementsApi.activateAchievement(ach.id);
      }
      setAchievements((prev) =>
        prev.map((a) => (a.id === ach.id ? { ...a, is_active: !a.is_active } : a))
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (await confirmAction(`Delete "${name}"?\nThis will remove it from all member profiles.`)) {
      try {
        await achievementsApi.deleteAchievement(id);
        setAchievements((prev) => prev.filter((a) => a.id !== id));
      } catch (err) {
        console.error('Failed to delete achievement:', err);
      }
    }
  };

  const handleViewStats = async (id: string) => {
    try {
      const stats = await achievementsApi.getAchievementStats(id);
      setSelectedStats(stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      a.name.toLowerCase().includes(query) ||
      a.description.toLowerCase().includes(query) ||
      a.slug.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return (
    <AdminLayout pageTitle="Achievements">
      <div className="space-y-6 pb-12">
        {/* Global Stats Overview */}
        {globalStats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#121624] border border-white/10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Trophy size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{globalStats.totalAwards}</div>
                <div className="text-xs text-gray-400">Total Unlocks Awarded</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121624] border border-white/10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Users size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{globalStats.uniqueStudents}</div>
                <div className="text-xs text-gray-400">Recognized Members</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#121624] border border-white/10 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-white">{globalStats.totalPointsAwarded}</div>
                <div className="text-xs text-gray-400">Club Points Distributed</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Header & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search achievements..."
                aria-label="Search achievements"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#121624] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <select
              value={categoryFilter}
              aria-label="Achievement category"
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#121624] border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-cyan-500/20 shrink-0"
          >
            <Plus size={16} />
            <span>Create Achievement</span>
          </button>
        </div>

        {/* Table of Achievements */}
        <div className="rounded-2xl border border-white/10 bg-[#121624] overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Achievement</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Criteria & Target</th>
                  <th className="py-3 px-4 text-center">Points</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <Loader2 size={24} className="animate-spin text-cyan-400 mx-auto mb-2" />
                      <span>Loading achievements...</span>
                    </td>
                  </tr>
                ) : filteredAchievements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No achievements found.
                    </td>
                  </tr>
                ) : (
                  filteredAchievements.map((ach) => (
                    <tr key={ach.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <AchievementBadge
                            iconName={ach.icon}
                            isUnlocked={true}
                            size="sm"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {ach.name}
                            </div>
                            <div className="text-[11px] text-gray-500 font-mono">
                              {ach.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <AchievementCategoryBadge category={ach.category} />
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-300">
                          {ach.criteria_type}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          Target: {ach.criteria_config?.target ?? 1}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-amber-400">+{ach.points}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(ach)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            ach.is_active
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {ach.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewStats(ach.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/5 transition-colors"
                            title="View Statistics"
                          >
                            <BarChart3 size={15} />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ach)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(ach.id, ach.name)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create / Edit Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div
              ref={editorRef} role="dialog" aria-modal="true" aria-label="Achievement editor" tabIndex={-1}
              className="w-full max-w-lg rounded-2xl border border-white/10 p-6 flex flex-col shadow-2xl relative"
              style={{ backgroundColor: '#121624' }}
            >
              <button
                aria-label="Close achievement editor"
                onClick={() => setIsFormOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-cyan-400" />
                <span>{editingId ? 'Edit Achievement' : 'Create New Achievement'}</span>
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="adminachievements-field-1">
                    Achievement Name *
                  </label>
                  <input id="adminachievements-field-1"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="e.g. Workshop Regular"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="adminachievements-field-2">
                    Slug (Unique identifier)
                  </label>
                  <input id="adminachievements-field-2"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50 font-mono"
                    placeholder="e.g. workshop-regular"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="adminachievements-field-3">
                    Description *
                  </label>
                  <textarea id="adminachievements-field-3"
                    required
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/50"
                    placeholder="Criteria explanation for students..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="adminachievements-field-4">
                      Category
                    </label>
                    <select id="adminachievements-field-4"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value as AchievementCategory })
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="adminachievements-field-5">
                      Criteria Metric
                    </label>
                    <select id="adminachievements-field-5"
                      value={formData.criteria_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          criteria_type: e.target.value as AchievementCriteriaType,
                        })
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      {CRITERIA_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="adminachievements-field-6">
                      Target Count *
                    </label>
                    <input id="adminachievements-field-6"
                      type="number"
                      min={1}
                      required
                      value={formData.target}
                      onChange={(e) =>
                        setFormData({ ...formData, target: parseInt(e.target.value, 10) || 1 })
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1" htmlFor="adminachievements-field-7">
                      Points Awarded *
                    </label>
                    <input id="adminachievements-field-7"
                      type="number"
                      min={0}
                      required
                      value={formData.points}
                      onChange={(e) =>
                        setFormData({ ...formData, points: parseInt(e.target.value, 10) || 10 })
                      }
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-xs font-semibold text-black bg-cyan-400 hover:bg-cyan-300 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    <span>{editingId ? 'Update' : 'Create'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Statistics Modal */}
        {selectedStats && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <div
              ref={statsRef} role="dialog" aria-modal="true" aria-label="Achievement statistics" tabIndex={-1}
              className="w-full max-w-md rounded-2xl border border-white/10 p-6 flex flex-col shadow-2xl relative"
              style={{ backgroundColor: '#121624' }}
            >
              <button
                aria-label="Close achievement statistics"
                onClick={() => setSelectedStats(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <h3 className="text-base font-bold text-white mb-1">
                {selectedStats.achievement.name}
              </h3>
              <p className="text-xs text-gray-400 mb-4">Achievement Delivery Analytics</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-xs text-gray-400">Total Awarded</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {selectedStats.totalEarned}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-xs text-gray-400">Unique Members</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {selectedStats.uniqueMembers}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Recent Recipients
                </h4>
                {selectedStats.recentAwards.length === 0 ? (
                  <p className="text-xs text-gray-500 py-3 text-center">No awards recorded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedStats.recentAwards.map((award, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
                      >
                        <span className="font-semibold text-white">{award.full_name}</span>
                        <span className="text-[11px] text-gray-500">
                          {new Date(award.earned_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
