import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { CourseCard } from '../components/courses/CourseCard';
import { CourseFilters } from '../components/courses/CourseFilters';
import { coursesApi } from '../api/courses.api';
import type { CourseItem } from '../types/courses';
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'ALL' | 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Action status message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'ALL') {
        const res = await coursesApi.getCourses({
          search: searchTerm.trim() || undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          difficulty: selectedDifficulty !== 'All' ? selectedDifficulty : undefined,
          page,
          limit: 12,
        });

        setCourses(res.items);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      } else if (isAuthenticated) {
        // Enrolled tabs
        const enr = await coursesApi.getMyCourses();

        let filtered = enr;
        if (activeTab === 'IN_PROGRESS') {
          filtered = enr.filter((e) => e.status === 'ENROLLED');
        } else if (activeTab === 'COMPLETED') {
          filtered = enr.filter((e) => e.status === 'COMPLETED');
        }

        const items: CourseItem[] = filtered
          .map((e) => {
            if (!e.course) return null;
            return {
              ...e.course,
              current_enrollment_status: e.status,
              current_progress_percentage: e.progress_percentage || 0,
            };
          })
          .filter(Boolean) as CourseItem[];

        // Apply in-memory category/search if active
        let finalItems = items;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          finalItems = finalItems.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q)
          );
        }
        if (selectedCategory !== 'All') {
          finalItems = finalItems.filter((c) => c.category === selectedCategory);
        }
        if (selectedDifficulty !== 'All') {
          finalItems = finalItems.filter((c) => c.difficulty === selectedDifficulty);
        }

        setCourses(finalItems);
        setTotalCount(finalItems.length);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm, selectedCategory, selectedDifficulty, page, isAuthenticated]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnroll = async (course: CourseItem) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await coursesApi.enroll(course.id);
      setToastMessage(`Successfully enrolled in "${course.title}"!`);
      setTimeout(() => setToastMessage(null), 4000);
      fetchCourses();
    } catch (err: any) {
      alert(err.message || 'Could not enroll in course');
    }
  };

  return (
    <DashboardLayout pageTitle="Curriculum & Learning Management">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-500/90 text-white shadow-xl backdrop-blur-md flex items-center gap-2 text-sm font-semibold animate-slide-in">
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <GraduationCap className="text-indigo-400" size={28} />
            <h2 className="text-2xl font-bold tracking-tight text-white m-0">
              COURSES & LEARNING PATHS
            </h2>
          </div>
          <p className="text-sm text-[var(--text-muted,#94a3b8)]">
            Curated hands-on modules in Artificial Intelligence, Deep Learning, Full-Stack and Robotics.
          </p>
        </div>

        {isAuthenticated && (
          <button
            type="button"
            onClick={() => navigate('/my-learning')}
            className="btn btn-primary flex items-center gap-2 self-start sm:self-auto"
          >
            <PlayCircle size={16} /> My Learning Dashboard <ArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color,rgba(255,255,255,0.08))] mb-6 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('ALL');
            setPage(1);
          }}
          className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'ALL'
              ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          All Catalog
        </button>

        {isAuthenticated && (
          <>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ENROLLED');
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'ENROLLED'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              My Enrolled
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('IN_PROGRESS');
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'IN_PROGRESS'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('COMPLETED');
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'COMPLETED'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              Completed
            </button>
          </>
        )}
      </div>

      {/* Filters Bar */}
      <CourseFilters
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          setPage(1);
        }}
        selectedCategory={selectedCategory}
        onCategoryChange={(v) => {
          setSelectedCategory(v);
          setPage(1);
        }}
        selectedDifficulty={selectedDifficulty}
        onDifficultyChange={(v) => {
          setSelectedDifficulty(v);
          setPage(1);
        }}
        totalResults={totalCount}
      />

      {/* Main Grid / States */}
      {loading ? (
        <div className="p-16 text-center text-sm text-[var(--text-muted,#94a3b8)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
          <p>Loading course catalog...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-center text-sm">
          <p className="mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchCourses}
            className="px-4 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white text-xs font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-[var(--border-color,rgba(255,255,255,0.08))] bg-[var(--surface-color,rgba(15,23,42,0.6))]">
          <BookOpen size={48} className="mx-auto mb-3 text-gray-500" />
          <h3 className="text-lg font-bold text-white mb-1">No Courses Found</h3>
          <p className="text-xs text-[var(--text-muted,#94a3b8)] max-w-sm mx-auto mb-4">
            {activeTab === 'ALL'
              ? 'Try adjusting your search criteria or filter tags.'
              : 'You have not enrolled in any courses in this category yet.'}
          </p>
          {activeTab !== 'ALL' && (
            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className="btn btn-primary text-xs py-2 px-4"
            >
              Explore All Courses
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} onEnrollClick={handleEnroll} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-xs text-white disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-mono text-gray-400 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-800 text-xs text-white disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
};
