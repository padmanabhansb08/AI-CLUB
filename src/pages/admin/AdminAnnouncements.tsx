import React, { useEffect, useState } from 'react';
import { StateView } from '../../components/common/StateView';
import { announcementService } from '../../services/content/announcementService';
import type { Announcement } from '../../services/content/announcementService';
import { Plus, Edit2, Trash2 } from 'lucide-react';

export const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: '',
    body: '',
    category: 'general',
    priority: 'normal',
    status: 'draft',
    publishedAt: '',
    expiresAt: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getAllAdmin();
      setAnnouncements(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      title: '',
      body: '',
      category: 'general',
      priority: 'normal',
      status: 'draft',
      publishedAt: '',
      expiresAt: ''
    });
    setEditingId(null);
    setIsEditing(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      body: announcement.body,
      category: announcement.category,
      priority: announcement.priority,
      status: announcement.status,
      publishedAt: announcement.publishedAt ? new Date(announcement.publishedAt).toISOString().slice(0, 16) : '',
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : ''
    });
    setEditingId(announcement.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement? This will also delete all read-state records.')) {
      return;
    }
    try {
      await announcementService.delete(id);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Announcement> = { ...formData };
      if (!payload.publishedAt) payload.publishedAt = null;
      else payload.publishedAt = new Date(payload.publishedAt).toISOString();
      
      if (!payload.expiresAt) payload.expiresAt = null;
      else payload.expiresAt = new Date(payload.expiresAt).toISOString();

      if (editingId) {
        await announcementService.update(editingId, payload);
      } else {
        await announcementService.create(payload);
      }
      setIsEditing(false);
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to save announcement');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Announcements</h1>
          <p className="text-gray-400">Manage club announcements</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18} />
          New Announcement
        </button>
      </div>

      {isEditing && (
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">{editingId ? 'Edit Announcement' : 'New Announcement'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
              <input
                type="text"
                required
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Body</label>
              <textarea
                required
                rows={5}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100"
                value={formData.body}
                onChange={e => setFormData({...formData, body: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="general">General</option>
                  <option value="event">Event</option>
                  <option value="project">Project</option>
                  <option value="workshop">Workshop</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="recruitment">Recruitment</option>
                  <option value="deadline">Deadline</option>
                  <option value="achievement">Achievement</option>
                  <option value="important">Important</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value})}
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Published At (UTC)</label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100"
                  value={formData.publishedAt as string}
                  onChange={e => setFormData({...formData, publishedAt: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Expires At (UTC)</label>
                <input
                  type="datetime-local"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-gray-100"
                  value={formData.expiresAt as string}
                  onChange={e => setFormData({...formData, expiresAt: e.target.value})}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Save Announcement
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <StateView loading={loading} error={error as any} empty={announcements.length === 0} emptyMessage="No announcements found.">
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-gray-800/50 text-gray-400 uppercase font-mono text-xs">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status / Priority</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {announcements.map((a) => (
                <tr key={a.id} className="hover:bg-gray-800/50">
                  <td className="px-6 py-4 font-medium text-gray-200">
                    {a.title}
                  </td>
                  <td className="px-6 py-4 uppercase tracking-wider text-xs">
                    {a.category}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block px-2 py-1 rounded text-xs border ${
                        a.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        a.status === 'draft' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {a.status}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded text-xs border ${
                        a.priority === 'urgent' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        a.priority === 'important' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {a.priority}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">
                    <div>P: {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString() : 'N/A'}</div>
                    <div>E: {a.expiresAt ? new Date(a.expiresAt).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(a)}
                        className="p-2 text-gray-400 hover:text-blue-400 bg-gray-800 hover:bg-gray-700 rounded"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="p-2 text-gray-400 hover:text-red-400 bg-gray-800 hover:bg-gray-700 rounded"
                      >
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
  );
};
