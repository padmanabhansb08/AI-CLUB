import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, BookOpen, User, PlayCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import type { CourseItem } from '../../types/courses';
import { CourseCategoryBadge } from './CourseCategoryBadge';
import { CourseDifficultyBadge } from './CourseDifficultyBadge';
import { CourseStatusBadge } from './CourseStatusBadge';

interface Props {
  course: CourseItem;
  onEnrollClick?: (course: CourseItem) => void;
  showStatus?: boolean;
}

export const CourseCard: React.FC<Props> = ({ course, onEnrollClick, showStatus = false }) => {
  const navigate = useNavigate();

  const isEnrolled = course.current_enrollment_status === 'ENROLLED';
  const isCompleted = course.current_enrollment_status === 'COMPLETED';
  const progress = course.current_progress_percentage || 0;

  const formatDuration = (mins: number) => {
    if (!mins || mins <= 0) return 'Self-paced';
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    if (hrs === 0) return `${rem}m`;
    if (rem === 0) return `${hrs}h`;
    return `${hrs}h ${rem}m`;
  };

  return (
    <div
      onClick={() => navigate(`/courses/${course.slug || course.id}`)}
      className="group flex flex-col justify-between rounded-2xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-[var(--surface-color,rgba(15,23,42,0.6))] backdrop-blur-md overflow-hidden hover:border-[var(--accent-color,#6366f1)] hover:shadow-xl hover:shadow-[var(--accent-color,rgba(99,102,241,0.12))] transition-all duration-300 cursor-pointer"
    >
      {/* Top Banner / Image */}
      <div className="relative aspect-video w-full bg-gradient-to-br from-indigo-950/40 via-purple-950/20 to-slate-900 border-b border-white/5 overflow-hidden flex items-center justify-center">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-indigo-400/40 group-hover:scale-110 group-hover:text-indigo-400 transition-all duration-500">
            <BookOpen size={48} strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
          <CourseCategoryBadge category={course.category} />
          <CourseDifficultyBadge difficulty={course.difficulty} />
        </div>

        {showStatus && (
          <div className="absolute top-3 right-3">
            <CourseStatusBadge status={course.status} />
          </div>
        )}

        {/* Progress overlay for enrolled learners */}
        {isEnrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted,#94a3b8)] mb-2">
            <span className="flex items-center gap-1 font-mono">
              <Clock size={13} className="text-indigo-400" />
              {formatDuration(course.estimated_duration_minutes)}
            </span>
            <span className="flex items-center gap-1 font-mono">
              <BookOpen size={13} className="text-purple-400" />
              {course.lessons_count ?? 0} lessons
            </span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-1.5 leading-snug">
            {course.title}
          </h3>

          <p className="text-xs text-[var(--text-muted,#94a3b8)] line-clamp-2 leading-relaxed mb-4">
            {course.short_description || course.description}
          </p>
        </div>

        {/* Bottom meta & CTA */}
        <div>
          {/* Instructor & Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5 mb-4 text-xs text-[var(--text-muted,#94a3b8)]">
            <span className="flex items-center gap-1.5 truncate max-w-[140px]">
              <User size={13} className="text-gray-400 shrink-0" />
              <span className="truncate">{course.instructor_name || 'AI Club Faculty'}</span>
            </span>

            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-xs font-mono">
                <CheckCircle2 size={13} /> Completed
              </span>
            ) : isEnrolled ? (
              <span className="text-indigo-400 font-mono font-semibold text-xs">
                {progress}% done
              </span>
            ) : (
              <span className="text-[11px] text-gray-500 font-mono">
                {course.enrollments_count ?? 0} students
              </span>
            )}
          </div>

          {/* Action CTA */}
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/courses/${course.slug || course.id}/learn`);
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 size={14} /> Review Course
              </button>
            ) : isEnrolled ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/courses/${course.slug || course.id}/learn`);
                }}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all"
              >
                <PlayCircle size={14} /> Continue Learning
              </button>
            ) : course.status === 'PUBLISHED' && onEnrollClick ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEnrollClick(course);
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-colors"
              >
                Enroll Now <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/courses/${course.slug || course.id}`);
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                View Syllabus <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
