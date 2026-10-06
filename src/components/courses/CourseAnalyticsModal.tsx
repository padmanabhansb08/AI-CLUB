import React, { useState, useEffect } from 'react';
import { X, Users, CheckCircle2, TrendingUp, BarChart2 } from 'lucide-react';
import type { CourseItem, CourseAnalyticsData } from '../../types/courses';
import { coursesApi } from '../../api/courses.api';

interface Props {
  course?: CourseItem;
  courseId?: string;
  onClose: () => void;
}

export const CourseAnalyticsModal: React.FC<Props> = ({ course, courseId, onClose }) => {
  const targetId = course?.id || courseId;
  const [analytics, setAnalytics] = useState<CourseAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetId) return;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await coursesApi.getAnalytics(targetId);
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch course analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [targetId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-slate-900 shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="text-indigo-400" size={20} /> Course Analytics
            </h3>
            <p className="text-xs text-[var(--text-muted,#94a3b8)] mt-0.5 truncate max-w-sm">
              {course?.title || 'Performance & completion metrics'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading analytics...</div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        ) : analytics ? (
          <div className="flex flex-col gap-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-white/10 bg-slate-800/40 text-center">
                <Users size={16} className="mx-auto text-indigo-400 mb-1" />
                <div className="text-2xl font-bold font-mono text-white">
                  {analytics.totalEnrollments}
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                  Enrollments
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-slate-800/40 text-center">
                <TrendingUp size={16} className="mx-auto text-cyan-400 mb-1" />
                <div className="text-2xl font-bold font-mono text-cyan-400">
                  {analytics.activeLearners}
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                  Active
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-slate-800/40 text-center">
                <CheckCircle2 size={16} className="mx-auto text-emerald-400 mb-1" />
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {analytics.completedLearners}
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                  Finished
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-white/10 bg-slate-800/40 text-center">
                <BarChart2 size={16} className="mx-auto text-purple-400 mb-1" />
                <div className="text-2xl font-bold font-mono text-purple-400">
                  {analytics.completionRate}%
                </div>
                <div className="text-[11px] text-gray-400 uppercase tracking-wide">
                  Rate
                </div>
              </div>
            </div>

            {/* Average Progress Bar */}
            <div className="p-4 rounded-xl border border-white/10 bg-slate-800/30">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-300 font-semibold">Average Student Progress</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {analytics.averageProgress}%
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${analytics.averageProgress}%` }}
                />
              </div>
            </div>

            <div className="text-[11px] text-gray-500 text-center">
              Metrics are calculated dynamically from verified student lesson progress.
            </div>
          </div>
        ) : null}

        <div className="pt-6 border-t border-white/5 flex items-center justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
