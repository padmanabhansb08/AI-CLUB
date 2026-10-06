import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Video,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Eye,
} from 'lucide-react';
import type {
  CourseItem,
  CourseModuleItem,
  CourseLessonItem,
  LessonContentType,
} from '../../types/courses';
import { coursesApi } from '../../api/courses.api';

interface Props {
  course: CourseItem;
  onClose: () => void;
  onUpdated?: () => void;
  onCurriculumUpdated?: () => void;
}

export const CurriculumBuilderModal: React.FC<Props> = ({
  course,
  onClose,
  onUpdated,
  onCurriculumUpdated,
}) => {
  const notifyUpdated = () => {
    if (onUpdated) onUpdated();
    if (onCurriculumUpdated) onCurriculumUpdated();
  };
  const [modules, setModules] = useState<CourseModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Module creation/edit state
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModuleItem | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDesc, setModuleDesc] = useState('');

  // Lesson creation/edit state
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLessonItem | null>(null);
  const [lessonData, setLessonData] = useState({
    title: '',
    content_type: 'ARTICLE' as LessonContentType,
    content: '',
    video_url: '',
    external_url: '',
    description: '',
    duration_minutes: 20,
    is_preview: false,
  });

  const [openModuleIds, setOpenModuleIds] = useState<Record<string, boolean>>({});

  const fetchCurriculum = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await coursesApi.getCurriculum(course.id);
      setModules(data);
      // Open all modules by default
      const openMap: Record<string, boolean> = {};
      data.forEach((m) => {
        openMap[m.id] = true;
      });
      setOpenModuleIds(openMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load curriculum');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, [course.id]);

  const toggleModule = (id: string) => {
    setOpenModuleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // -------------------------------------------------------------
  // Module Handlers
  // -------------------------------------------------------------
  const handleOpenModuleModal = (mod?: CourseModuleItem) => {
    if (mod) {
      setEditingModule(mod);
      setModuleTitle(mod.title);
      setModuleDesc(mod.description || '');
    } else {
      setEditingModule(null);
      setModuleTitle('');
      setModuleDesc('');
    }
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingModule) {
        await coursesApi.updateModule(editingModule.id, {
          title: moduleTitle.trim(),
          description: moduleDesc.trim() || undefined,
        });
      } else {
        await coursesApi.createModule(course.id, {
          title: moduleTitle.trim(),
          description: moduleDesc.trim() || undefined,
        });
      }
      setIsModuleModalOpen(false);
      await fetchCurriculum();
      notifyUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to save module');
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!window.confirm('Delete this module and all contained lessons?')) return;
    try {
      await coursesApi.deleteModule(moduleId);
      await fetchCurriculum();
      notifyUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete module');
    }
  };

  // -------------------------------------------------------------
  // Lesson Handlers
  // -------------------------------------------------------------
  const handleOpenLessonModal = (moduleId: string, lesson?: CourseLessonItem) => {
    setTargetModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonData({
        title: lesson.title,
        content_type: lesson.content_type,
        content: lesson.content || '',
        video_url: lesson.video_url || '',
        external_url: lesson.external_url || '',
        description: lesson.description || '',
        duration_minutes: lesson.duration_minutes || 20,
        is_preview: !!lesson.is_preview,
      });
    } else {
      setEditingLesson(null);
      setLessonData({
        title: '',
        content_type: 'ARTICLE',
        content: '',
        video_url: '',
        external_url: '',
        description: '',
        duration_minutes: 20,
        is_preview: false,
      });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingLesson) {
        await coursesApi.updateLesson(editingLesson.id, {
          ...lessonData,
          video_url: lessonData.video_url.trim() || null,
          external_url: lessonData.external_url.trim() || null,
          content: lessonData.content.trim() || null,
          description: lessonData.description.trim() || null,
          duration_minutes: Number(lessonData.duration_minutes) || 0,
        });
      } else if (targetModuleId) {
        await coursesApi.createLesson(targetModuleId, {
          ...lessonData,
          video_url: lessonData.video_url.trim() || null,
          external_url: lessonData.external_url.trim() || null,
          content: lessonData.content.trim() || null,
          description: lessonData.description.trim() || null,
          duration_minutes: Number(lessonData.duration_minutes) || 0,
        });
      }
      setIsLessonModalOpen(false);
      await fetchCurriculum();
      notifyUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await coursesApi.deleteLesson(lessonId);
      await fetchCurriculum();
      notifyUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to delete lesson');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-slate-900 shadow-2xl p-6 my-8 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              Curriculum Builder
            </h3>
            <p className="text-xs text-[var(--text-muted,#94a3b8)] mt-0.5 truncate max-w-lg">
              {course.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenModuleModal()}
              className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Module
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 my-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs shrink-0">
            {error}
          </div>
        )}

        {/* Modules & Lessons List */}
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 pr-1">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading curriculum...</div>
          ) : modules.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-white/10 text-xs text-gray-400">
              No modules created yet. Click "Add Module" to start structuring your course curriculum.
            </div>
          ) : (
            modules.map((mod, modIdx) => {
              const isOpen = !!openModuleIds[mod.id];
              const lessons = mod.lessons || [];

              return (
                <div
                  key={mod.id}
                  className="rounded-2xl border border-white/10 bg-slate-800/50 overflow-hidden"
                >
                  {/* Module Header Bar */}
                  <div className="px-4 py-3 flex items-center justify-between bg-slate-800/80">
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className="flex items-center gap-2.5 text-left flex-1 min-w-0 pr-2"
                    >
                      {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {modIdx + 1}
                      </span>
                      <span className="text-sm font-semibold text-white truncate">{mod.title}</span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        ({lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'})
                      </span>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenLessonModal(mod.id)}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-1 transition-colors"
                      >
                        <Plus size={13} /> Lesson
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenModuleModal(mod)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        title="Edit Module"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(mod.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                        title="Delete Module"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Lessons in Module */}
                  {isOpen && (
                    <div className="p-3 flex flex-col gap-2 border-t border-white/5 bg-slate-900/40">
                      {lessons.length === 0 ? (
                        <p className="text-xs text-gray-500 py-1 pl-4 italic">
                          No lessons added. Click "+ Lesson" to add content.
                        </p>
                      ) : (
                        lessons.map((lesson, lIdx) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-slate-800/40 hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <span className="text-xs font-mono text-gray-500 w-4 text-right">
                                {lIdx + 1}.
                              </span>
                              {lesson.content_type === 'VIDEO' ? (
                                <Video size={14} className="text-purple-400 shrink-0" />
                              ) : lesson.content_type === 'LINK' ? (
                                <ExternalLink size={14} className="text-cyan-400 shrink-0" />
                              ) : (
                                <FileText size={14} className="text-indigo-400 shrink-0" />
                              )}
                              <span className="text-xs font-medium text-gray-200 truncate">
                                {lesson.title}
                              </span>
                              {lesson.is_preview && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  <Eye size={9} /> Preview
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] font-mono text-gray-500">
                                {lesson.duration_minutes}m
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenLessonModal(mod.id, lesson)}
                                className="p-1 rounded text-gray-400 hover:text-white"
                                title="Edit Lesson"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1 rounded text-gray-400 hover:text-red-400"
                                title="Delete Lesson"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary text-xs py-2 px-6"
          >
            Done
          </button>
        </div>

        {/* Submodal: Add / Edit Module */}
        {isModuleModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h4 className="text-base font-bold text-white">
                  {editingModule ? 'Edit Module' : 'Add New Module'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveModule} className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Module Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="e.g. Module 1: Foundations"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={moduleDesc}
                    onChange={(e) => setModuleDesc(e.target.value)}
                    placeholder="Core topics covered in this module"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsModuleModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Save Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Submodal: Add / Edit Lesson */}
        {isLessonModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl my-8">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h4 className="text-base font-bold text-white">
                  {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonData.title}
                    onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
                    placeholder="e.g. Introduction to Policy Gradients"
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Content Type
                    </label>
                    <select
                      value={lessonData.content_type}
                      onChange={(e) =>
                        setLessonData({ ...lessonData, content_type: e.target.value as any })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="ARTICLE">Article / Text</option>
                      <option value="VIDEO">Video Embed</option>
                      <option value="DOCUMENT">Document / PDF</option>
                      <option value="LINK">External Resource</option>
                      <option value="QUIZ">Quiz</option>
                      <option value="ASSIGNMENT">Assignment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={lessonData.duration_minutes}
                      onChange={(e) =>
                        setLessonData({ ...lessonData, duration_minutes: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {lessonData.content_type === 'VIDEO' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      Video URL (YouTube or direct stream)
                    </label>
                    <input
                      type="url"
                      value={lessonData.video_url}
                      onChange={(e) => setLessonData({ ...lessonData, video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {lessonData.content_type === 'LINK' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                      External Resource URL
                    </label>
                    <input
                      type="url"
                      value={lessonData.external_url}
                      onChange={(e) => setLessonData({ ...lessonData, external_url: e.target.value })}
                      placeholder="https://arxiv.org/abs/..."
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                    Lesson Content / Article Notes
                  </label>
                  <textarea
                    rows={5}
                    value={lessonData.content}
                    onChange={(e) => setLessonData({ ...lessonData, content: e.target.value })}
                    placeholder="Rich text / markdown notes and lecture guide..."
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="previewCheck"
                    checked={lessonData.is_preview}
                    onChange={(e) => setLessonData({ ...lessonData, is_preview: e.target.checked })}
                    className="rounded border-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="previewCheck" className="text-xs text-gray-300 cursor-pointer">
                    Enable Free Preview (accessible without enrollment)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsLessonModalOpen(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Save Lesson
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
