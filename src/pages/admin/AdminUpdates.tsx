import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { updateService } from '../../services/content/updateService';
import { useRepository } from '../../services/content/useRepository';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import type { Update } from '../../data/updates';
import { StateView } from '../../components/common/StateView';

export const AdminUpdates: React.FC = () => {
  const { data: updates, loading: loadingupdates, error: errorupdates, retry: retryupdates } = useRepository(updateService);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Update>>({
    title: '', summary: '', category: 'AI News', source: '',
    publishedAt: '', readingTime: '', content: '', featured: false, tags: []
  });

  const filtered = updates.filter(u => 
    u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setFormData({
      title: '', summary: '', category: 'AI News', source: '',
      publishedAt: '', readingTime: '', content: '', featured: false, tags: []
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (upd: Update) => {
    setFormData({ ...upd });
    setEditingId(upd.id);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete this update?\nThis will remove "${title}".`)) {
      updateService.remove(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary || !formData.category) return;
    
    if (editingId) {
      updateService.update(editingId, formData);
    } else {
      updateService.create(formData as Omit<Update, 'id'>);
    }
    setIsFormOpen(false);
  };

  return (
    <AdminLayout pageTitle="AI & Tech Updates">
      <div className="admin-section">
        <div className="admin-section-header">
          <p className="text-secondary">Manage news, articles, and technology updates.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} className="mr-2" /> Add Update
          </button>
        </div>

        <div className="courses-filter-bar mb-6">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search updates..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <StateView loading={loadingupdates} error={errorupdates} retry={retryupdates} empty={filtered.length === 0} emptyMessage="No updates match your filters.">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Published Date</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(upd => (
                  <tr key={upd.id}>
                    <td><strong>{upd.title}</strong></td>
                    <td>{upd.category}</td>
                    <td>{upd.source}</td>
                    <td>{upd.publishedAt}</td>
                    <td>{upd.featured ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="flex gap-3">
                        <button className="icon-btn text-accent" onClick={() => handleEdit(upd)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn" style={{color: 'var(--danger-color, #ef4444)'}} onClick={() => handleDelete(upd.id, upd.title)}>
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
            <h3 className="mb-4">{editingId ? 'Edit' : 'Create'} Update</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="info-label">Title *</label>
                <input type="text" className="search-input w-full mt-1" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="info-label">Summary *</label>
                <textarea className="search-input w-full mt-1" rows={2} required value={formData.summary} onChange={e => setFormData({...formData, summary: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="info-label">Category *</label>
                  <select className="filter-select w-full mt-1" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="AI News">AI News</option>
                    <option value="Research">Research</option>
                    <option value="Developer Tools">Developer Tools</option>
                  </select>
                </div>
                <div>
                  <label className="info-label">Source *</label>
                  <input type="text" className="search-input w-full mt-1" required value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="info-label">Published Date *</label>
                  <input type="date" className="search-input w-full mt-1" required value={formData.publishedAt} onChange={e => setFormData({...formData, publishedAt: e.target.value})} />
                </div>
                <div>
                  <label className="info-label">Reading Time</label>
                  <input type="text" className="search-input w-full mt-1" placeholder="e.g. 5 min read" value={formData.readingTime || ''} onChange={e => setFormData({...formData, readingTime: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="info-label">Main Content</label>
                <textarea className="search-input w-full mt-1" rows={8} value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="featured" checked={!!formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                <label htmlFor="featured">Featured Update</label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Update</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
