import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { achievementService } from '../../services/content/achievementService';
import { useRepository } from '../../services/content/useRepository';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Achievement } from '../../data/achievements';
import { StateView } from '../../components/common/StateView';

export const AdminAchievements: React.FC = () => {
  const { data: achievements, loading: loadingachievements, error: errorachievements, retry: retryachievements } = useRepository(achievementService);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Achievement>>({
    title: '', description: '', category: 'Competition', type: 'individual',
    studentName: '', date: '', featured: false
  });

  const filtered = achievements.filter(a => 
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.studentName && a.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = () => {
    setFormData({
      title: '', description: '', category: 'Competition', type: 'individual',
      studentName: '', date: '', featured: false
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (ach: Achievement) => {
    setFormData({ ...ach });
    setEditingId(ach.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete this achievement?\nThis will remove "${title}" from the club directory.`)) {
      achievementService.remove(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category || !formData.date) return;
    
    if (editingId) {
      achievementService.update(editingId, formData);
    } else {
      achievementService.create(formData as Omit<Achievement, 'id'>);
    }
    setIsFormOpen(false);
  };

  return (
    <AdminLayout pageTitle="Achievements">
      <div className="admin-section">
        <div className="admin-section-header">
          <p className="text-secondary">Manage club achievements and member accomplishments.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} className="mr-2" /> Add Achievement
          </button>
        </div>

        <div className="courses-filter-bar mb-6">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search achievements..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <StateView loading={loadingachievements} error={errorachievements} retry={retryachievements} empty={filtered.length === 0} emptyMessage="No achievements match your filters.">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Achievement</th>
                  <th>Student / Team</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(ach => (
                  <tr key={ach.id}>
                    <td><strong>{ach.title}</strong></td>
                    <td>{ach.type === 'team' ? ach.teamName : ach.studentName}</td>
                    <td>{ach.category}</td>
                    <td>{ach.date || ach.year}</td>
                    <td>{ach.featured ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="flex gap-3">
                        <button className="icon-btn text-accent" onClick={() => handleEdit(ach)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn" style={{color: 'var(--danger-color, #ef4444)'}} onClick={() => handleDelete(ach.id, ach.title)}>
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
          <div className="modal-content" style={{maxWidth: '600px', textAlign: 'left'}}>
            <h3 className="mb-4">{editingId ? 'Edit' : 'Create'} Achievement</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="info-label">Title *</label>
                <input type="text" className="search-input w-full mt-1" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="info-label">Description *</label>
                <textarea className="search-input w-full mt-1" rows={3} required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="info-label">Category *</label>
                  <select className="filter-select w-full mt-1" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Competition">Competition</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Research">Research</option>
                    <option value="Open Source">Open Source</option>
                  </select>
                </div>
                <div>
                  <label className="info-label">Date *</label>
                  <input type="date" className="search-input w-full mt-1" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="info-label">Student Name</label>
                  <input type="text" className="search-input w-full mt-1" value={formData.studentName || ''} onChange={e => setFormData({...formData, studentName: e.target.value, type: 'individual'})} />
                </div>
                <div>
                  <label className="info-label">Organization</label>
                  <input type="text" className="search-input w-full mt-1" value={formData.organization || ''} onChange={e => setFormData({...formData, organization: e.target.value})} />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="featured" checked={!!formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                <label htmlFor="featured">Featured Achievement</label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Achievement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
