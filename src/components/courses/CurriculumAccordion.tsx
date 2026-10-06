import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  FileQuestion,
  ExternalLink,
  Lock,
  Eye,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import type { CourseModuleItem, CourseLessonItem, LessonContentType } from '../../types/courses';

interface Props {
  modules: CourseModuleItem[];
  isEnrolled?: boolean;
  onSelectLesson?: (lesson: CourseLessonItem) => void;
  activeLessonId?: string;
}

export const CurriculumAccordion: React.FC<Props> = ({
  modules,
  isEnrolled = false,
  onSelectLesson,
  activeLessonId,
}) => {
  // Start with first module open by default
  const [openModuleIds, setOpenModuleIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (modules.length > 0) {
      initial[modules[0].id] = true;
    }
    return initial;
  });

  const toggleModule = (id: string) => {
    setOpenModuleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderIcon = (type: LessonContentType) => {
    switch (type) {
      case 'VIDEO':
        return <Video size={15} className="text-purple-400 shrink-0" />;
      case 'QUIZ':
      case 'ASSIGNMENT':
        return <FileQuestion size={15} className="text-amber-400 shrink-0" />;
      case 'LINK':
        return <ExternalLink size={15} className="text-cyan-400 shrink-0" />;
      case 'ARTICLE':
      case 'DOCUMENT':
      default:
        return <FileText size={15} className="text-indigo-400 shrink-0" />;
    }
  };

  const formatDuration = (mins: number) => {
    if (!mins || mins <= 0) return '';
    return `${mins}m`;
  };

  if (!modules || modules.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border-color,rgba(255,255,255,0.08))] text-sm text-[var(--text-muted,#94a3b8)]">
        Curriculum will be announced shortly.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {modules.map((mod, modIdx) => {
        const isOpen = !!openModuleIds[mod.id];
        const lessons = mod.lessons || [];
        const completedCount = lessons.filter((l) => l.progress_status === 'COMPLETED').length;
        const totalDuration = lessons.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);

        return (
          <div
            key={mod.id}
            className="rounded-2xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-[var(--surface-color,rgba(15,23,42,0.6))] backdrop-blur-md overflow-hidden transition-all duration-200"
          >
            {/* Module Header */}
            <button
              type="button"
              onClick={() => toggleModule(mod.id)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-mono font-bold text-indigo-400 shrink-0">
                  {modIdx + 1}
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-bold text-white truncate">{mod.title}</h4>
                  {mod.description && (
                    <p className="text-xs text-[var(--text-muted,#94a3b8)] truncate">
                      {mod.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 text-xs text-[var(--text-muted,#94a3b8)]">
                <span className="font-mono">
                  {completedCount > 0 && isEnrolled ? `${completedCount}/` : ''}
                  {lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}
                  {totalDuration > 0 ? ` • ${totalDuration}m` : ''}
                </span>
                {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </div>
            </button>

            {/* Collapsible Lessons */}
            {isOpen && (
              <div className="px-5 pb-4 pt-1 flex flex-col gap-1.5 border-t border-white/5">
                {lessons.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted,#94a3b8)] py-2 italic pl-10">
                    No lessons published in this module yet.
                  </p>
                ) : (
                  lessons.map((lesson) => {
                    const isCompleted = lesson.progress_status === 'COMPLETED';
                    const isActive = lesson.id === activeLessonId;
                    const canAccess = isEnrolled || lesson.is_preview;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (canAccess && onSelectLesson) {
                            onSelectLesson(lesson);
                          }
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-indigo-600/20 border border-indigo-500/30'
                            : canAccess
                            ? 'hover:bg-white/5 cursor-pointer'
                            : 'opacity-70 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          {isCompleted ? (
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          ) : isActive ? (
                            <PlayCircle size={16} className="text-indigo-400 shrink-0 animate-pulse" />
                          ) : (
                            renderIcon(lesson.content_type)
                          )}

                          <span
                            className={`text-xs font-medium truncate ${
                              isActive
                                ? 'text-indigo-300 font-semibold'
                                : isCompleted
                                ? 'text-gray-300'
                                : 'text-gray-200'
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-xs">
                          {lesson.is_preview && !isEnrolled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Eye size={10} /> Free Preview
                            </span>
                          )}

                          {!canAccess && (
                            <span className="text-gray-500">
                              <Lock size={13} />
                            </span>
                          )}

                          {lesson.duration_minutes > 0 && (
                            <span className="text-gray-500 font-mono text-[11px]">
                              {formatDuration(lesson.duration_minutes)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
