import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { courseService } from '../../services/content/courseService';
import { useRepository } from '../../services/content/useRepository';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import type { ExternalCourse, TrackingMethod, TrackingStatus } from '../../data/courses';
import { StateView } from '../../components/common/StateView';

export const AdminCourses: React.FC = () => {
  const { data: courses, loading: loadingcourses, error: errorcourses, retry: retrycourses } = useRepository(courseService);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ExternalCourse>>({
    title: '', provider: '', description: '', category: 'AI Basics', difficulty: 'Beginner',
    duration: '', courseUrl: '', featured: false,
    tracking: { method: 'none', status: 'unsupported', provider: '' }
  });

  const filtered = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setFormData({
      title: '', provider: '', description: '', category: 'AI Basics', difficulty: 'Beginner',
      duration: '', courseUrl: '', featured: false,
      tracking: { method: 'none', status: 'unsupported', provider: '' }
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (course: ExternalCourse) => {
    setFormData({ ...course });
    setEditingId(course.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete this course?\nThis will remove "${title}" from the club course directory.`)) {
      courseService.remove(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.provider || !formData.category) return;
    
    if (editingId) {
      courseService.update(editingId, formData);
    } else {
      courseService.create(formData as Omit<ExternalCourse, 'id'>);
    }
    setIsFormOpen(false);
  };

  return (
    <AdminLayout pageTitle="External Courses">
      <div className="admin-section">
        <div className="admin-section-header">
          <p className="text-secondary">Manage recommended courses and tracking integrations.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} className="mr-2" /> Add Course
          </button>
        </div>

        <div className="courses-filter-bar mb-6">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <StateView loading={loadingcourses} error={errorcourses} retry={retrycourses} empty={filtered.length === 0} emptyMessage="No courses match your filters.">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Provider</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Tracking Method</th>
                  <th>Tracking Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(course => (
                  <tr key={course.id}>
                    <td><strong>{course.title}</strong></td>
                    <td>{course.provider}</td>
                    <td>{course.category}</td>
                    <td>{course.difficulty}</td>
                    <td><span style={{textTransform: 'uppercase'}}>{course.tracking.method}</span></td>
                    <td>
                      <span className={`status-badge ${course.tracking.status === 'available' ? 'status-open' : 'status-completed'}`}>
                        {course.tracking.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-3">
                        <button className="icon-btn text-accent" onClick={() => handleEdit(course)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn" style={{color: 'var(--danger-color, #ef4444)'}} onClick={() => handleDelete(course.id, course.title)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                </tbody>
            </table>
          </div>
        </StateView>
      </div>

      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '800px', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto'}}>
            <h3 className="mb-4">{editingId ? 'Edit' : 'Create'} Course</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="info-label">Title *</label>
                  <input type="text" className="search-input w-full mt-1" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="info-label">Provider *</label>
                  <input type="text" className="search-input w-full mt-1" required value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="info-label">Description *</label>
                <textarea className="search-input w-full mt-1" rows={2} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="info-label">Category *</label>
                  <select className="filter-select w-full mt-1" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="AI Basics">AI Basics</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Deep Learning">Deep Learning</option>
                    <option value="Data Science">Data Science</option>
                  </select>
                </div>
                <div>
                  <label className="info-label">Difficulty *</label>
                  <select className="filter-select w-full mt-1" required value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value as any})}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="info-label">Duration</label>
                  <input type="text" className="search-input w-full mt-1" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                </div>
                <div>
                  <label className="info-label">Course URL</label>
                  <input type="url" className="search-input w-full mt-1" value={formData.courseUrl || ''} onChange={e => setFormData({...formData, courseUrl: e.target.value})} />
                </div>
              </div>

              {/* Tracking Configuration */}
              <div className="detail-card mt-4">
                <h4 className="mb-3 text-accent">Tracking Configuration</h4>
                <p className="text-secondary text-sm mb-4">
                  Note: Configured integrations only signal capability to students. Actual API credentials are NOT collected here and must be securely managed on the backend.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="info-label">Tracking Method *</label>
                    <select 
                      className="filter-select w-full mt-1" 
                      required 
                      value={formData.tracking?.method} 
                      onChange={e => setFormData({
                        ...formData, 
                        tracking: { ...formData.tracking!, method: e.target.value as TrackingMethod }
                      })}
                    >
                      <option value="none">None</option>
                      <option value="api">API</option>
                      <option value="oauth">OAuth</option>
                      <option value="webhook">Webhook</option>
                      <option value="lti">LTI</option>
                      <option value="certificate">Certificate Upload</option>
                      <option value="manual">Manual Entry</option>
                    </select>
                  </div>
                  <div>
                    <label className="info-label">Tracking Status *</label>
                    <select 
                      className="filter-select w-full mt-1" 
                      required 
                      value={formData.tracking?.status} 
                      onChange={e => setFormData({
                        ...formData, 
                        tracking: { ...formData.tracking!, status: e.target.value as TrackingStatus }
                      })}
                    >
                      <option value="unsupported">Unsupported</option>
                      <option value="available">Integration Available</option>
                      <option value="beta">Beta</option>
                      <option value="deprecated">Deprecated</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="featured" checked={!!formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                <label htmlFor="featured">Featured Course</label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
