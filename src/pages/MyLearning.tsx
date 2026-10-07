import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { coursesApi } from '../api/courses.api';
import type { CourseEnrollmentItem } from '../types/courses';
import { CourseCategoryBadge } from '../components/courses/CourseCategoryBadge';
import { CourseDifficultyBadge } from '../components/courses/CourseDifficultyBadge';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  PlayCircle,
  Award,
  ArrowRight,
  TrendingUp,
  Layers,
} from 'lucide-react';

export const MyLearning: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<CourseEnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesApi.getMyCourses();
      setEnrollments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your enrolled courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const inProgressCourses = enrollments.filter(
    (e) => e.status === 'ENROLLED' && (e.progress_percentage || 0) < 100
  );
  const completedCourses = enrollments.filter(
    (e) => e.status === 'COMPLETED' || (e.progress_percentage || 0) === 100
  );

  const totalEnrolled = enrollments.length;
  const totalCompleted = completedCourses.length;
  const totalInProgress = inProgressCourses.length;
  const totalEstimatedMinutes = enrollments.reduce(
    (acc, e) => acc + (e.course?.estimated_duration_minutes || 0),
    0
  );
  const totalHours = Math.round(totalEstimatedMinutes / 60);

  return (
    <DashboardLayout pageTitle="My Learning">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="text-[var(--accent-color, #6366f1)]" size={26} />
            <h2 className="text-2xl font-bold tracking-tight text-white m-0">
              My learning
            </h2>
          </div>
          <p className="text-sm text-[var(--text-muted, #94a3b8)]">
            Track your ongoing courses, lessons progress, and skill completions.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary flex items-center gap-2 self-start sm:self-auto"
          onClick={() => navigate('/courses')}
        >
          Explore Catalog <ArrowRight size={16} />
        </button>
      </div>

      {/* Learning Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <BookOpen size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalEnrolled}</div>
            <div className="text-xs text-[var(--text-muted, #94a3b8)]">Courses Enrolled</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalInProgress}</div>
            <div className="text-xs text-[var(--text-muted, #94a3b8)]">In Progress</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalCompleted}</div>
            <div className="text-xs text-[var(--text-muted, #94a3b8)]">Courses Completed</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Clock size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">~{totalHours} hrs</div>
            <div className="text-xs text-[var(--text-muted, #94a3b8)]">Curriculum Time</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-[var(--text-muted, #94a3b8)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color, #6366f1)] mb-3"></div>
          <p>Loading your learning journey...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
          {error}
          <div className="mt-3">
            <button
              onClick={fetchMyCourses}
              className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-medium transition"
            >
              Retry
            </button>
          </div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
          <BookOpen size={48} className="mx-auto mb-3 text-[var(--text-muted, #64748b)]" />
          <h3 className="text-lg font-bold text-white mb-1">No Courses Enrolled Yet</h3>
          <p className="text-xs text-[var(--text-muted, #94a3b8)] max-w-sm mx-auto mb-5">
            Discover cutting-edge AI, machine learning, and development courses curated by club leads.
          </p>
          <button
            type="button"
            className="btn btn-primary inline-flex items-center gap-2"
            onClick={() => navigate('/courses')}
          >
            Browse Courses <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Section 1: Continue Learning */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlayCircle className="text-indigo-400" size={20} />
                Continue Learning
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300">
                  {inProgressCourses.length}
                </span>
              </h3>
            </div>

            {inProgressCourses.length === 0 ? (
              <div className="p-6 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] text-center text-sm text-[var(--text-muted, #94a3b8)]">
                You have no in-progress courses. Either pick a new course or review your completed courses below!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {inProgressCourses.map((enr) => {
                  const course = enr.course;
                  if (!course) return null;
                  const pct = enr.progress_percentage || 0;

                  return (
                    <div
                      key={enr.id}
                      className="p-5 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] hover:border-indigo-500/50 transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <CourseCategoryBadge category={course.category} />
                          <CourseDifficultyBadge difficulty={course.difficulty} />
                        </div>

                        {/* Title & Description */}
                        <h4
                          onClick={() => navigate(`/courses/${course.slug || course.id}`)}
                          className="text-base font-bold text-white hover:text-indigo-400 cursor-pointer transition line-clamp-1 mb-1.5"
                        >
                          {course.title}
                        </h4>
                        <p className="text-xs text-[var(--text-muted, #94a3b8)] line-clamp-2 mb-4">
                          {course.short_description || course.description}
                        </p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center text-xs mb-1">
                            <span className="text-[var(--text-muted, #94a3b8)] font-medium">Course Progress</span>
                            <span className="text-indigo-400 font-bold">{pct}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Modules / Duration stats */}
                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted, #94a3b8)] mb-4">
                          <span className="flex items-center gap-1">
                            <Layers size={14} />
                            {course.modules_count || 0} modules
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {course.estimated_duration_minutes || 0} mins
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        type="button"
                        onClick={() => navigate(`/courses/${course.slug || course.id}/learn`)}
                        className="btn btn-primary w-full flex items-center justify-center gap-2 text-sm"
                      >
                        <PlayCircle size={16} /> Resume Learning
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Completed Courses */}
          {completedCourses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="text-emerald-400" size={20} />
                  Completed Courses
                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
                    {completedCourses.length}
                  </span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {completedCourses.map((enr) => {
                  const course = enr.course;
                  if (!course) return null;

                  return (
                    <div
                      key={enr.id}
                      className="p-5 rounded-xl border border-emerald-500/20 bg-[var(--surface-color, #1e293b)] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <CourseCategoryBadge category={course.category} />
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 size={12} /> Completed
                          </span>
                        </div>

                        <h4
                          onClick={() => navigate(`/courses/${course.slug || course.id}`)}
                          className="text-base font-bold text-white hover:text-indigo-400 cursor-pointer transition line-clamp-1 mb-1.5"
                        >
                          {course.title}
                        </h4>
                        <p className="text-xs text-[var(--text-muted, #94a3b8)] line-clamp-2 mb-4">
                          {course.short_description || course.description}
                        </p>

                        {enr.completed_at && (
                          <div className="text-[11px] text-[var(--text-muted, #94a3b8)] mb-3">
                            Completed on {new Date(enr.completed_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/courses/${course.slug || course.id}/learn`)}
                          className="flex-1 py-2 px-3 rounded-lg border border-[var(--border-color, #334155)] hover:bg-slate-800 text-xs text-white font-medium transition text-center"
                        >
                          Review Lessons
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/courses/${course.slug || course.id}`)}
                          className="py-2 px-3 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium transition"
                        >
                          Overview
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};
