import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  type CourseItem,
  COURSE_CATEGORIES,
  COURSE_DIFFICULTIES,
  COURSE_STATUSES,
} from '../../types/courses';
import { coursesApi } from '../../api/courses.api';

interface Props {
  course?: CourseItem | null;
  onClose: () => void;
  onSaved: (course: CourseItem) => void;
}

export const CourseFormModal: React.FC<Props> = ({ course, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    short_description: course?.short_description || '',
    description: course?.description || '',
    category: course?.category || 'AI_ML',
    difficulty: course?.difficulty || 'BEGINNER',
    status: course?.status || 'DRAFT',
    estimated_duration_minutes: course?.estimated_duration_minutes || 120,
    thumbnail_url: course?.thumbnail_url || '',
    language: course?.language || 'English',
  });

  const [objectives, setObjectives] = useState<string[]>(
    course?.learning_objectives?.length ? course.learning_objectives : ['']
  );
  const [prerequisites, setPrerequisites] = useState<string[]>(
    course?.prerequisites?.length ? course.prerequisites : ['']
  );
  const [technologies, setTechnologies] = useState<string>(
    course?.technologies?.length ? course.technologies.join(', ') : ''
  );
  const [skills, setSkills] = useState<string>(
    course?.skills?.length ? course.skills.join(', ') : ''
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const cleanedObjectives = objectives.map((o) => o.trim()).filter(Boolean);
      const cleanedPrerequisites = prerequisites.map((p) => p.trim()).filter(Boolean);
      const cleanedTechs = technologies
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const cleanedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Partial<CourseItem> = {
        ...formData,
        learning_objectives: cleanedObjectives,
        prerequisites: cleanedPrerequisites,
        technologies: cleanedTechs,
        skills: cleanedSkills,
        estimated_duration_minutes: Number(formData.estimated_duration_minutes) || 0,
        thumbnail_url: formData.thumbnail_url.trim() || null,
        short_description: formData.short_description.trim() || null,
      };

      let result: CourseItem;
      if (course?.id) {
        result = await coursesApi.updateCourse(course.id, payload);
      } else {
        result = await coursesApi.createCourse(payload);
      }

      onSaved(result);
    } catch (err: any) {
      setError(err.message || 'Failed to save course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[var(--border-color,rgba(255,255,255,0.08))] bg-slate-900 shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <h3 className="text-xl font-bold text-white">
            {course?.id ? 'Edit Course' : 'Create New Course'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-2">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Deep Reinforcement Learning Foundations"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Short Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
              Short Summary
            </label>
            <input
              type="text"
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="Brief overview displayed on course cards (max 200 chars)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Full Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
              Detailed Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed syllabus, prerequisites overview, and expected student takeaways..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {COURSE_CATEGORIES.filter((c) => c.value !== 'All').map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                Difficulty Level *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {COURSE_DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                Course Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {COURSE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                Estimated Duration (Minutes)
              </label>
              <input
                type="number"
                min={0}
                value={formData.estimated_duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_duration_minutes: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
              Thumbnail Image URL
            </label>
            <input
              type="url"
              value={formData.thumbnail_url}
              onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
              placeholder="https://example.com/cover.jpg"
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Learning Objectives */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 uppercase">
                Learning Objectives
              </label>
              <button
                type="button"
                onClick={() => setObjectives([...objectives, ''])}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus size={14} /> Add Objective
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {objectives.map((obj, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={obj}
                    onChange={(e) => {
                      const next = [...objectives];
                      next[i] = e.target.value;
                      setObjectives(next);
                    }}
                    placeholder={`Objective ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-slate-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {objectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setObjectives(objectives.filter((_, idx) => idx !== i))}
                      className="p-2 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prerequisites */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300 uppercase">
                Prerequisites
              </label>
              <button
                type="button"
                onClick={() => setPrerequisites([...prerequisites, ''])}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus size={14} /> Add Prerequisite
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {prerequisites.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => {
                      const next = [...prerequisites];
                      next[i] = e.target.value;
                      setPrerequisites(next);
                    }}
                    placeholder={`Prerequisite ${i + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-slate-800/80 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  {prerequisites.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPrerequisites(prerequisites.filter((_, idx) => idx !== i))}
                      className="p-2 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Technologies & Skills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                Technologies (comma separated)
              </label>
              <input
                type="text"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="PyTorch, Gymnasium, Ray"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-2">
                Skills Taught (comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Reinforcement Learning, Policy Gradients"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-slate-800/80 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5 mt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : course?.id ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
