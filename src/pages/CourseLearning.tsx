import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { coursesApi } from '../api/courses.api';
import type {
  CourseItem,
  CourseModuleItem,
  CourseLessonItem,
} from '../types/courses';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  PlayCircle,
  Video,
  ExternalLink,
  Menu,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';

export const CourseLearning: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [curriculum, setCurriculum] = useState<CourseModuleItem[]>([]);
  const [activeLesson, setActiveLesson] = useState<CourseLessonItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Flattened list of all lessons for linear navigation
  const allLessons = useMemo(() => {
    const list: CourseLessonItem[] = [];
    curriculum.forEach((mod) => {
      if (mod.lessons) {
        list.push(...mod.lessons);
      }
    });
    return list;
  }, [curriculum]);

  const currentIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return allLessons.findIndex((l) => l.id === activeLesson.id);
  }, [allLessons, activeLesson]);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const completedCount = allLessons.filter((l) => l.progress_status === 'COMPLETED').length;
  const overallPercentage =
    allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  // Load course and curriculum
  const loadData = async () => {
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

      // Determine initial lesson to display:
      // Priority: 1. URL search param 2. Resume / first incomplete lesson 3. First lesson
      const targetLessonId = searchParams.get('lesson');
      const flattened: CourseLessonItem[] = [];
      curriculumData.forEach((m) => {
        if (m.lessons) flattened.push(...m.lessons);
      });

      let selected: CourseLessonItem | undefined;
      if (targetLessonId) {
        selected = flattened.find((l) => l.id === targetLessonId);
      }

      if (!selected) {
        // Try progress summary
        try {
          const prog = await coursesApi.getCourseProgress(courseData.id);
          if (prog?.currentLesson) {
            selected = flattened.find((l) => l.id === prog.currentLesson?.id);
          }
        } catch {
          // fallback to first incomplete
          selected = flattened.find((l) => l.progress_status !== 'COMPLETED') || flattened[0];
        }
      }

      if (!selected && flattened.length > 0) {
        selected = flattened[0];
      }

      if (selected) {
        // Fetch full lesson content if needed
        const full = await coursesApi.getLesson(selected.id);
        setActiveLesson(full);
        // Start lesson in background
        coursesApi.startLesson(selected.id).catch(() => {});
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load course classroom');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Switch to a new lesson
  const handleSelectLesson = async (lesson: CourseLessonItem) => {
    try {
      setActionLoading(true);
      const full = await coursesApi.getLesson(lesson.id);
      setActiveLesson(full);
      setSearchParams({ lesson: lesson.id });
      setSidebarOpen(false); // Close mobile drawer
      // Start lesson
      await coursesApi.startLesson(lesson.id);
    } catch (err: any) {
      alert(err.message || 'Could not load lesson');
    } finally {
      setActionLoading(false);
    }
  };

  // Mark lesson as complete
  const handleCompleteCurrentLesson = async () => {
    if (!activeLesson) return;
    try {
      setActionLoading(true);
      await coursesApi.completeLesson(activeLesson.id);

      // Update local state
      setActiveLesson((prev) => (prev ? { ...prev, progress_status: 'COMPLETED', progress_percentage: 100 } : null));

      // Refresh curriculum progress status
      const updatedCurriculum = await coursesApi.getCurriculum(course!.id);
      setCurriculum(updatedCurriculum);

      // If there is a next lesson, smoothly advance
      if (nextLesson) {
        handleSelectLesson(nextLesson);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to mark lesson complete');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-3"></div>
        <p className="text-sm text-gray-400">Loading classroom...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <p className="text-red-400 text-sm mb-4">{error || 'Course not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/courses')}
          className="btn btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={16} /> Return to Courses
        </button>
      </div>
    );
  }

  const isCurrentCompleted = activeLesson?.progress_status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Classroom Navigation Bar */}
      <header className="h-16 border-b border-white/10 bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigate(`/courses/${course.slug || course.id}`)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors shrink-0"
            title="Back to Course Details"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="truncate">
            <h1 className="text-sm font-bold text-white truncate m-0">{course.title}</h1>
            {activeLesson && (
              <p className="text-xs text-indigo-400 truncate mt-0.5">
                {activeLesson.title}
              </p>
            )}
          </div>
        </div>

        {/* Center Progress Bar */}
        <div className="hidden md:flex items-center gap-3 w-64 px-4">
          <div className="flex-1">
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-gray-300">
            {overallPercentage}%
          </span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {activeLesson && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={handleCompleteCurrentLesson}
              className={`text-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all ${
                isCurrentCompleted
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              <CheckCircle2 size={16} />
              {isCurrentCompleted ? 'Completed' : 'Mark Complete'}
            </button>
          )}

          {/* Toggle Sidebar on mobile */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5"
            title="Toggle Curriculum Syllabus"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Main Split Layout: Sidebar + Lesson Viewer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Curriculum Sidebar (Desktop & Mobile Drawer) */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-30 w-80 sm:w-96 bg-slate-900 border-r border-white/10 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Curriculum Syllabus
            </span>
            <span className="text-xs font-mono text-indigo-400">
              {completedCount}/{allLessons.length} Done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
            {curriculum.map((mod, modIdx) => (
              <div key={mod.id} className="rounded-xl border border-white/5 bg-slate-800/40 p-2.5">
                <div className="text-xs font-bold text-gray-300 mb-2 px-1 flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-indigo-400">M{modIdx + 1}:</span>
                  <span className="truncate">{mod.title}</span>
                </div>

                <div className="flex flex-col gap-1">
                  {(mod.lessons || []).map((lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isDone = lesson.progress_status === 'COMPLETED';

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson)}
                        className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-all ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                            : 'text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          {isDone ? (
                            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                          ) : (
                            <PlayCircle size={14} className="text-gray-500 shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                        {lesson.duration_minutes > 0 && (
                          <span className="text-[10px] font-mono text-gray-500 shrink-0">
                            {lesson.duration_minutes}m
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Main Lesson Viewer Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col justify-between">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
              {/* Lesson Title & Metadata Header */}
              <div>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-indigo-400" />
                    {activeLesson.duration_minutes} mins
                  </span>
                  <span>•</span>
                  <span className="uppercase tracking-wider text-[11px] font-semibold text-purple-400">
                    {activeLesson.content_type}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {activeLesson.title}
                </h2>
                {activeLesson.description && (
                  <p className="text-sm text-gray-300 mt-2 leading-relaxed">
                    {activeLesson.description}
                  </p>
                )}
              </div>

              {/* Lesson Player by Content Type */}
              <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden shadow-xl">
                {activeLesson.content_type === 'VIDEO' ? (
                  <div className="relative aspect-video w-full bg-black flex items-center justify-center">
                    {activeLesson.video_url?.includes('youtube.com') || activeLesson.video_url?.includes('youtu.be') ? (
                      <iframe
                        src={activeLesson.video_url.replace('watch?v=', 'embed/')}
                        title={activeLesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full border-0"
                      />
                    ) : activeLesson.video_url ? (
                      <video
                        src={activeLesson.video_url}
                        controls
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Video size={48} />
                        <p className="text-xs">Video content pending upload</p>
                      </div>
                    )}
                  </div>
                ) : activeLesson.content_type === 'LINK' ? (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <ExternalLink size={40} className="text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">External Resource Lesson</h3>
                    <p className="text-xs text-gray-400 max-w-md">
                      This lesson utilizes an external research paper, codebase, or notebook.
                    </p>
                    {activeLesson.external_url && (
                      <a
                        href={activeLesson.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-primary text-xs py-2 px-5 inline-flex items-center gap-2 mt-2"
                      >
                        Open Resource <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                ) : (
                  /* ARTICLE / DOCUMENT */
                  <div className="p-6 sm:p-8">
                    <div className="prose prose-invert max-w-none text-sm text-gray-200 leading-relaxed space-y-4">
                      {activeLesson.content ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: activeLesson.content }}
                          className="space-y-4"
                        />
                      ) : (
                        <p className="italic text-gray-500">
                          Lecture notes and curriculum reading content will be posted soon.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Next / Prev Lesson Navigation Bar */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
                {prevLesson ? (
                  <button
                    type="button"
                    onClick={() => handleSelectLesson(prevLesson)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-slate-900 hover:bg-slate-800 text-xs text-gray-300 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={16} /> Previous Lesson
                  </button>
                ) : (
                  <div />
                )}

                {nextLesson ? (
                  <button
                    type="button"
                    onClick={() => handleSelectLesson(nextLesson)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-all shadow-md"
                  >
                    Next Lesson <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${course.slug || course.id}`)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white transition-all shadow-md"
                  >
                    Course Completed! <Sparkles size={16} />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-sm text-gray-500">
              Select a lesson from the syllabus to start learning.
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
