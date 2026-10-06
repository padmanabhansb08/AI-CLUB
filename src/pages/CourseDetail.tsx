import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { coursesApi } from '../../src/api/courses.api';
import type { CourseItem, CourseModuleItem } from '../types/courses';
import { CourseCategoryBadge } from '../components/courses/CourseCategoryBadge';
import { CourseDifficultyBadge } from '../components/courses/CourseDifficultyBadge';
import { CourseStatusBadge } from '../components/courses/CourseStatusBadge';
import { CurriculumAccordion } from '../components/courses/CurriculumAccordion';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  User,
  CheckCircle2,
  PlayCircle,
  Sparkles,
  Layers,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [curriculum, setCurriculum] = useState<CourseModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);

  const fetchCourseData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);

      const [courseData, curriculumData] = await Promise.all([
        coursesApi.getCourse(id),
        coursesApi.getCurriculum(id),
      ]);

      setCourse(courseData);
      setCurriculum(curriculumData);
    } catch (err: any) {
      setError(err.message || 'Course could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!course) return;

    try {
      setEnrolling(true);
      await coursesApi.enroll(course.id);
      await fetchCourseData();
    } catch (err: any) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Loading Course...">
        <div className="p-20 text-center text-sm text-[var(--text-muted,#94a3b8)]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
          <p>Loading course information & syllabus...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout pageTitle="Course Not Found">
        <div className="p-16 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/60 my-8">
          <GraduationCap size={48} className="mx-auto mb-3 text-gray-500" />
          <h3 className="text-xl font-bold text-white mb-2">Course Unavailable</h3>
          <p className="text-xs text-[var(--text-muted,#94a3b8)] max-w-md mx-auto mb-6">
            {error || "The requested course could not be found or you don't have access permissions."}
          </p>
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="btn btn-primary text-xs py-2 px-5 inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Course Catalog
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const isEnrolled = course.current_enrollment_status === 'ENROLLED';
  const isCompleted = course.current_enrollment_status === 'COMPLETED';
  const progress = course.current_progress_percentage || 0;

  const formatDuration = (mins: number) => {
    if (!mins || mins <= 0) return 'Self-paced';
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hrs === 0) return `${rem} mins`;
    if (rem === 0) return `${hrs} hours`;
    return `${hrs}h ${rem}m`;
  };

  return (
    <DashboardLayout pageTitle={course.title}>
      {/* Top back button */}
      <button
        type="button"
        onClick={() => navigate('/courses')}
        className="inline-flex items-center gap-2 text-xs font-medium text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Main Grid: Left details + Right sticky enrollment card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Hero, Outcomes, Syllabus */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Hero Banner */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 backdrop-blur-md">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <CourseCategoryBadge category={course.category} />
              <CourseDifficultyBadge difficulty={course.difficulty} />
              <CourseStatusBadge status={course.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug mb-3">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-6">
              {course.short_description || course.description}
            </p>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 text-xs text-[var(--text-muted,#94a3b8)] pt-4 border-t border-white/10 flex-wrap">
              <span className="flex items-center gap-2 font-mono">
                <Clock size={16} className="text-indigo-400" />
                {formatDuration(course.estimated_duration_minutes)}
              </span>
              <span className="flex items-center gap-2 font-mono">
                <BookOpen size={16} className="text-purple-400" />
                {course.lessons_count ?? 0} Lessons ({course.modules_count ?? 0} Modules)
              </span>
              <span className="flex items-center gap-2">
                <User size={16} className="text-cyan-400" />
                Instructor: <strong className="text-white">{course.instructor_name || 'AI Club Faculty'}</strong>
              </span>
            </div>
          </div>

          {/* Learning Objectives */}
          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <div className="p-6 rounded-2xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-[var(--surface-color,rgba(15,23,42,0.6))] backdrop-blur-md">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-400" /> What You Will Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.learning_objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Syllabus & Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers size={18} className="text-indigo-400" /> Curriculum & Syllabus
              </h3>
              <span className="text-xs text-[var(--text-muted,#94a3b8)] font-mono">
                {curriculum.length} modules • {course.lessons_count ?? 0} total lessons
              </span>
            </div>

            <CurriculumAccordion
              modules={curriculum}
              isEnrolled={isEnrolled || isCompleted}
              onSelectLesson={(lesson) => {
                navigate(`/courses/${course.slug || course.id}/learn?lesson=${lesson.id}`);
              }}
            />
          </div>

          {/* Detailed Course Description */}
          {course.description && (
            <div className="p-6 rounded-2xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-[var(--surface-color,rgba(15,23,42,0.6))]">
              <h3 className="text-base font-bold text-white mb-3">About This Course</h3>
              <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Enrollment & Summary Card */}
        <div>
          <div className="sticky top-6 p-6 rounded-3xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-slate-900/90 shadow-2xl backdrop-blur-md flex flex-col gap-6">
            {/* Thumbnail Preview */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-800 border border-white/5 flex items-center justify-center">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen size={48} className="text-indigo-400/40" />
              )}
            </div>

            {/* CTA Buttons */}
            <div>
              {isCompleted ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5 font-mono">
                      <CheckCircle2 size={16} /> Course Completed
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${course.slug || course.id}/learn`)}
                    className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={16} /> Review Lessons
                  </button>
                </div>
              ) : isEnrolled ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-300 font-semibold">Your Progress</span>
                      <span className="text-indigo-400 font-mono font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${course.slug || course.id}/learn`)}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={16} /> Continue Learning
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={enrolling || course.status !== 'PUBLISHED'}
                  onClick={handleEnroll}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'} <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Course Information Meta */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Pace</span>
                <span className="text-white font-medium">Self-Paced Learning</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Total Duration</span>
                <span className="text-white font-mono font-medium">
                  {formatDuration(course.estimated_duration_minutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Curriculum</span>
                <span className="text-white font-medium">
                  {course.modules_count ?? 0} Modules, {course.lessons_count ?? 0} Lessons
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Access</span>
                <span className="text-white font-medium">Full Lifetime Access</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Language</span>
                <span className="text-white font-medium">{course.language || 'English'}</span>
              </div>
            </div>

            {/* Technologies */}
            {course.technologies && course.technologies.length > 0 && (
              <div className="pt-4 border-t border-white/10">
                <span className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                  Technologies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {course.technologies.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[11px] text-gray-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
