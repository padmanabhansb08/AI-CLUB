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
        <div className="p-20 text-center text-sm text-[#66645F]">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#111111] mb-3"></div>
          <p>Loading course information & curriculum...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout pageTitle="Course Not Found">
        <div className="p-16 text-center rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] my-8 shadow-sm">
          <GraduationCap size={48} className="mx-auto mb-3 text-[#92908A]" />
          <h3 className="text-xl font-bold text-[#111111] mb-2">Course Unavailable</h3>
          <p className="text-xs text-[#66645F] max-w-md mx-auto mb-6">
            {error || "The requested course could not be found or you don't have access permissions."}
          </p>
          <button
            type="button"
            onClick={() => navigate('/courses')}
            className="pill-btn text-xs py-2 px-5 inline-flex items-center gap-2"
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
        className="inline-flex items-center gap-2 text-xs font-medium text-[#66645F] hover:text-[#111111] transition-colors mb-6"
      >
        <ArrowLeft size={16} /> Back to Catalog
      </button>

      {/* Main Grid: Left details + Right sticky enrollment card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 cols): Hero, Outcomes, Syllabus */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Hero Banner */}
          <div className="p-6 sm:p-8 rounded-3xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <CourseCategoryBadge category={course.category} />
              <CourseDifficultyBadge difficulty={course.difficulty} />
              <CourseStatusBadge status={course.status} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight leading-snug mb-3">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-[#66645F] leading-relaxed mb-6">
              {course.short_description || course.description}
            </p>

            {/* Quick stats row */}
            <div className="flex items-center gap-6 text-xs text-[#66645F] pt-4 border-t border-[rgba(17,17,17,0.08)] flex-wrap">
              <span className="flex items-center gap-2 font-mono">
                <Clock size={16} className="text-[#111111]" />
                {formatDuration(course.estimated_duration_minutes)}
              </span>
              <span className="flex items-center gap-2 font-mono">
                <BookOpen size={16} className="text-[#111111]" />
                {course.lessons_count ?? 0} Lessons ({course.modules_count ?? 0} Modules)
              </span>
              <span className="flex items-center gap-2">
                <User size={16} className="text-[#111111]" />
                Instructor: <strong className="text-[#111111]">{course.instructor_name || 'AI Club Faculty'}</strong>
              </span>
            </div>
          </div>

          {/* Learning Objectives */}
          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <div className="p-6 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
              <h3 className="text-base font-bold text-[#111111] mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#111111]" /> What You Will Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.learning_objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-[#66645F]">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course Syllabus & Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#111111] flex items-center gap-2">
                <Layers size={18} className="text-[#111111]" /> Curriculum & Syllabus
              </h3>
              <span className="text-xs text-[#92908A] font-mono">
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
            <div className="p-6 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
              <h3 className="text-base font-bold text-[#111111] mb-3">About This Course</h3>
              <div className="text-xs text-[#66645F] leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Enrollment & Summary Card */}
        <div>
          <div className="sticky top-6 p-6 rounded-3xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-md flex flex-col gap-6">
            {/* Thumbnail Preview */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] flex items-center justify-center">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen size={48} className="text-[#92908A]/40" />
              )}
            </div>

            {/* CTA Buttons */}
            <div>
              {isCompleted ? (
                <div className="flex flex-col gap-3">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 font-mono">
                      <CheckCircle2 size={16} /> Course Completed
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${course.slug || course.id}/learn`)}
                    className="w-full py-3 px-4 rounded-full bg-[#050505] hover:bg-[#222222] text-[#FFFFFF] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={16} /> Review Lessons
                  </button>
                </div>
              ) : isEnrolled ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#66645F] font-semibold">Your Progress</span>
                      <span className="text-[#111111] font-mono font-bold">{progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-[#EBE9E3] overflow-hidden">
                      <div
                        className="h-full bg-[#050505] transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${course.slug || course.id}/learn`)}
                    className="w-full py-3 px-4 rounded-full bg-[#050505] hover:bg-[#222222] text-[#FFFFFF] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <PlayCircle size={16} /> Continue Learning
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={enrolling || course.status !== 'PUBLISHED'}
                  onClick={handleEnroll}
                  className="w-full py-3.5 px-4 rounded-full bg-[#050505] hover:bg-[#222222] text-[#FFFFFF] text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Course'} <ChevronRight size={18} />
                </button>
              )}
            </div>

            {/* Course Information Meta */}
            <div className="flex flex-col gap-3 pt-4 border-t border-[rgba(17,17,17,0.08)] text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#66645F]">Pace</span>
                <span className="text-[#111111] font-medium">Self-Paced Learning</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#66645F]">Total Duration</span>
                <span className="text-[#111111] font-mono font-medium">
                  {formatDuration(course.estimated_duration_minutes)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#66645F]">Curriculum</span>
                <span className="text-[#111111] font-medium">
                  {course.modules_count ?? 0} Modules, {course.lessons_count ?? 0} Lessons
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#66645F]">Access</span>
                <span className="text-[#111111] font-medium">Full Lifetime Access</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#66645F]">Language</span>
                <span className="text-[#111111] font-medium">{course.language || 'English'}</span>
              </div>
            </div>

            {/* Technologies */}
            {course.technologies && course.technologies.length > 0 && (
              <div className="pt-4 border-t border-[rgba(17,17,17,0.08)]">
                <span className="block text-xs font-semibold text-[#66645F] uppercase mb-2">
                  Technologies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {course.technologies.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[11px] font-medium text-[#111111]"
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
export default CourseDetail;
