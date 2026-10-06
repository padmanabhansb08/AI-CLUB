import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { coursesApi, type CourseSearchParams } from '../../api/courses.api';
import type { CourseItem } from '../../types/courses';
import { CourseStatusBadge } from '../../components/courses/CourseStatusBadge';
import { CourseCategoryBadge } from '../../components/courses/CourseCategoryBadge';
import { CourseDifficultyBadge } from '../../components/courses/CourseDifficultyBadge';
import { CourseFormModal } from '../../components/courses/CourseFormModal';
import { CurriculumBuilderModal } from '../../components/courses/CurriculumBuilderModal';
import { CourseAnalyticsModal } from '../../components/courses/CourseAnalyticsModal';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Layers,
  BarChart3,
  Globe,
  Archive,
  EyeOff,
  BookOpen,
  Filter,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCourseForEdit, setSelectedCourseForEdit] = useState<CourseItem | null>(null);

  const [curriculumCourse, setCurriculumCourse] = useState<CourseItem | null>(null);
  const [analyticsCourseId, setAnalyticsCourseId] = useState<string | null>(null);

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: CourseSearchParams = {
        page,
        limit: 15,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        search: searchTerm.trim() || undefined,
      };
      const res = await coursesApi.getCourses(params);
      setCourses(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCourses();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadCourses]);

  // Handlers
  const handleCreate = () => {
    setSelectedCourseForEdit(null);
    setIsFormOpen(true);
  };

  const handleEdit = (course: CourseItem) => {
    setSelectedCourseForEdit(course);
    setIsFormOpen(true);
  };

  const handlePublish = async (course: CourseItem) => {
    try {
      setActionLoading(course.id);
      await coursesApi.publishCourse(course.id);
      showToast('success', `Course "${course.title}" published successfully!`);
      loadCourses();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to publish course. Make sure it has at least one module and lesson with content.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (course: CourseItem) => {
    try {
      setActionLoading(course.id);
      await coursesApi.unpublishCourse(course.id);
      showToast('success', `Course "${course.title}" unpublished.`);
      loadCourses();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to unpublish course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleArchive = async (course: CourseItem) => {
    if (!window.confirm(`Are you sure you want to archive "${course.title}"? It will be hidden from the catalog while preserving all student records.`)) {
      return;
    }
    try {
      setActionLoading(course.id);
      await coursesApi.archiveCourse(course.id);
      showToast('success', `Course "${course.title}" archived.`);
      loadCourses();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to archive course');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (course: CourseItem) => {
    if (!window.confirm(`Are you sure you want to delete course "${course.title}"? This cannot be undone.`)) {
      return;
    }
    try {
      setActionLoading(course.id);
      await coursesApi.deleteCourse(course.id);
      showToast('success', `Course "${course.title}" deleted.`);
      loadCourses();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete course');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout pageTitle="Course Management (LMS)">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border text-sm max-w-md ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-red-950/90 border-red-500/40 text-red-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="admin-section">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 m-0">
              <BookOpen className="text-[var(--accent-color, #6366f1)]" size={22} />
              Courses & Learning Management
            </h2>
            <p className="text-xs text-[var(--text-muted, #94a3b8)] mt-1">
              Curate modules, author lessons, monitor student completion rates, and manage course lifecycles.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary flex items-center gap-2 self-start sm:self-auto"
            onClick={handleCreate}
          >
            <Plus size={16} /> Create Course
          </button>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted, #94a3b8)]"
            />
            <input
              type="text"
              placeholder="Search by title, description or category..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] text-white text-sm focus:outline-none focus:border-indigo-500 transition"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[var(--text-muted, #94a3b8)]" />
            <select
              className="px-3 py-2.5 rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)] text-white text-sm focus:outline-none focus:border-indigo-500"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="UNPUBLISHED">Unpublished</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="p-16 text-center text-sm text-[var(--text-muted, #94a3b8)]">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-color, #6366f1)] mb-3"></div>
            <p>Loading course directory...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
            {error}
            <div className="mt-3">
              <button
                onClick={loadCourses}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-medium transition"
              >
                Retry
              </button>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
            <BookOpen size={40} className="mx-auto mb-3 text-[var(--text-muted, #64748b)]" />
            <h3 className="text-base font-bold text-white mb-1">No Courses Found</h3>
            <p className="text-xs text-[var(--text-muted, #94a3b8)] max-w-sm mx-auto mb-4">
              Get started by creating your first course or adjusting your active search filters.
            </p>
            <button
              type="button"
              className="btn btn-primary inline-flex items-center gap-2 text-xs"
              onClick={handleCreate}
            >
              <Plus size={14} /> Create New Course
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--border-color, #334155)] bg-[var(--surface-color, #1e293b)]">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-[var(--border-color, #334155)] bg-slate-900/50 text-xs uppercase text-[var(--text-muted, #94a3b8)]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Course</th>
                  <th className="py-3.5 px-3 font-semibold">Category</th>
                  <th className="py-3.5 px-3 font-semibold">Difficulty</th>
                  <th className="py-3.5 px-3 font-semibold">Status</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Curriculum</th>
                  <th className="py-3.5 px-3 font-semibold text-center">Enrollments</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color, #334155)]">
                {courses.map((course) => {
                  const isBusy = actionLoading === course.id;

                  return (
                    <tr key={course.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white line-clamp-1 max-w-xs">
                          {course.title}
                        </div>
                        <div className="text-xs text-[var(--text-muted, #94a3b8)] line-clamp-1 max-w-xs mt-0.5">
                          {course.short_description || course.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <CourseCategoryBadge category={course.category} />
                      </td>
                      <td className="py-3.5 px-3">
                        <CourseDifficultyBadge difficulty={course.difficulty} />
                      </td>
                      <td className="py-3.5 px-3">
                        <CourseStatusBadge status={course.status} />
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setCurriculumCourse(course)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--border-color, #334155)] hover:border-indigo-500/50 hover:bg-indigo-500/10 text-indigo-300 text-xs transition"
                          title="Manage Modules & Lessons"
                        >
                          <Layers size={13} />
                          <span>{course.modules_count || 0} mods</span>
                          <span className="text-[var(--text-muted, #64748b)]">|</span>
                          <span>{course.lessons_count || 0} lessons</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-semibold text-white">
                          {course.enrollments_count || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Analytics Button */}
                          <button
                            type="button"
                            onClick={() => setAnalyticsCourseId(course.id)}
                            className="p-1.5 rounded-lg border border-[var(--border-color, #334155)] hover:bg-slate-800 text-slate-300 hover:text-white transition"
                            title="View Course Analytics"
                          >
                            <BarChart3 size={15} />
                          </button>

                          {/* Publish/Unpublish/Archive Toggle */}
                          {course.status === 'PUBLISHED' ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleUnpublish(course)}
                              className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition"
                              title="Unpublish Course"
                            >
                              <EyeOff size={15} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handlePublish(course)}
                              className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition"
                              title="Publish Course"
                            >
                              <Globe size={15} />
                            </button>
                          )}

                          {course.status !== 'ARCHIVED' && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleArchive(course)}
                              className="p-1.5 rounded-lg border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                              title="Archive Course"
                            >
                              <Archive size={15} />
                            </button>
                          )}

                          {/* Edit Form */}
                          <button
                            type="button"
                            onClick={() => handleEdit(course)}
                            className="p-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 transition"
                            title="Edit Course Details"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete Form */}
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleDelete(course)}
                            className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                            title="Delete Course"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 text-xs text-[var(--text-muted, #94a3b8)]">
            <div>
              Showing {courses.length} of {totalCount} courses
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color, #334155)] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
              >
                Previous
              </button>
              <span className="py-1.5 px-3">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-color, #334155)] hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Course Edit/Create Modal */}
      {isFormOpen && (
        <CourseFormModal
          course={selectedCourseForEdit}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedCourseForEdit(null);
          }}
          onSaved={() => {
            setIsFormOpen(false);
            setSelectedCourseForEdit(null);
            loadCourses();
          }}
        />
      )}

      {/* Curriculum Builder Modal */}
      {curriculumCourse && (
        <CurriculumBuilderModal
          course={curriculumCourse}
          onClose={() => setCurriculumCourse(null)}
          onCurriculumUpdated={() => loadCourses()}
        />
      )}

      {/* Course Analytics Modal */}
      {analyticsCourseId && (
        <CourseAnalyticsModal
          courseId={analyticsCourseId}
          onClose={() => setAnalyticsCourseId(null)}
        />
      )}
    </AdminLayout>
  );
};
