import React, { useState } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { projectService } from '../../services/content/projectService';
import { useRepository } from '../../services/content/useRepository';
import { Search, Plus, Edit2, Trash2, Users } from 'lucide-react';
import type { ProjectIdea } from '../../data/projects';
import type { ProjectTeam } from '../../data/projectTeams';
import { projectTeamService } from '../../services/content/projectTeamService';
import { StateView } from '../../components/common/StateView';

export const AdminProjects: React.FC = () => {
  const { data: projects, loading: loadingprojects, error: errorprojects, retry: retryprojects } = useRepository(projectService);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [inspectingTeamsFor, setInspectingTeamsFor] = useState<ProjectIdea | null>(null);
  const [projectTeams, setProjectTeams] = useState<ProjectTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ProjectIdea>>({
    title: '', shortDescription: '', category: 'AI', difficulty: 'Beginner',
    status: 'Open', interestedCount: 0,
    description: '', problem: '', approach: '', features: [], technologies: [], expectedOutcome: '', skills: [], resources: [],
    featured: false
  });

  const filtered = projects.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setFormData({
      title: '', shortDescription: '', category: 'AI', difficulty: 'Beginner',
      status: 'Open', interestedCount: 0,
      description: '', problem: '', approach: '', features: [], technologies: [], expectedOutcome: '', skills: [], resources: [],
      featured: false
    });
    setEditingId(null);
    setIsFormOpen(true);
  };

  const handleEdit = (proj: ProjectIdea) => {
    setFormData({ ...proj });
    setEditingId(proj.id);
    setIsFormOpen(true);
  };

  const handleInspectTeams = async (proj: ProjectIdea) => {
    setInspectingTeamsFor(proj);
    setLoadingTeams(true);
    setTeamsError(null);
    try {
      const teams = await projectTeamService.getAdminProjectTeams(proj.id);
      setProjectTeams(teams);
    } catch (err: any) {
      setTeamsError(err.message || 'Failed to load teams');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Delete this project?\nThis will remove "${title}" from the club project directory.`)) {
      projectService.remove(id);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.shortDescription || !formData.category) return;
    
    if (editingId) {
      projectService.update(editingId, formData);
    } else {
      projectService.create(formData as Omit<ProjectIdea, 'id'>);
    }
    setIsFormOpen(false);
  };

  return (
    <AdminLayout pageTitle="Project Ideas">
      <div className="admin-section">
        <div className="admin-section-header">
          <p className="text-secondary">Manage club project ideas and directory.</p>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={16} className="mr-2" /> Add Project
          </button>
        </div>

        <div className="courses-filter-bar mb-6">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <StateView loading={loadingprojects} error={errorprojects} retry={retryprojects} empty={filtered.length === 0} emptyMessage="No projects match your filters.">
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Interested Students</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(proj => (
                  <tr key={proj.id}>
                    <td><strong>{proj.title}</strong></td>
                    <td>{proj.category}</td>
                    <td>{proj.difficulty}</td>
                    <td>{proj.status}</td>
                    <td>{proj.interestedCount}</td>
                    <td>{proj.updatedAt}</td>
                    <td>
                      <div className="flex gap-3">
                        <button className="icon-btn text-accent" onClick={() => handleEdit(proj)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-btn text-blue-400" onClick={() => handleInspectTeams(proj)} title="Inspect Teams">
                          <Users size={16} />
                        </button>
                        <button className="icon-btn" style={{color: 'var(--danger-color, #ef4444)'}} onClick={() => handleDelete(proj.id, proj.title)}>
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
            <h3 className="mb-4">{editingId ? 'Edit' : 'Create'} Project</h3>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div>
                <label className="info-label">Title *</label>
                <input type="text" className="search-input w-full mt-1" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="info-label">Short Description *</label>
                <textarea className="search-input w-full mt-1" rows={2} required value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="info-label">Category *</label>
                  <select className="filter-select w-full mt-1" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="AI">AI</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Generative AI">Generative AI</option>
                    <option value="Computer Vision">Computer Vision</option>
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
                  <label className="info-label">Status *</label>
                  <select className="filter-select w-full mt-1" required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="Open">Open</option>
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="info-label">Updated At *</label>
                  <input type="date" className="search-input w-full mt-1" required value={formData.updatedAt || ''} onChange={e => setFormData({...formData, updatedAt: e.target.value})} />
                </div>
              </div>
              
              <div>
                <label className="info-label">Description</label>
                <textarea className="search-input w-full mt-1" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="featured" checked={!!formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} />
                <label htmlFor="featured">Featured Project</label>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inspectingTeamsFor && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '800px', textAlign: 'left', maxHeight: '90vh', overflowY: 'auto'}}>
            <div className="flex-between mb-4">
              <h3 className="text-xl">Teams: {inspectingTeamsFor.title}</h3>
              <button className="btn btn-outline py-1" onClick={() => setInspectingTeamsFor(null)}>Close</button>
            </div>
            
            {loadingTeams ? (
              <p>Loading teams...</p>
            ) : teamsError ? (
              <p className="text-red-500">{teamsError}</p>
            ) : projectTeams.length === 0 ? (
              <p>No teams have been formed yet.</p>
            ) : (
              <div className="space-y-4">
                {projectTeams.map(team => (
                  <div key={team.id} className="border border-[var(--border-color)] p-4 rounded-lg bg-[var(--surface-color)]">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">{team.name}</h4>
                      <span className={`status-badge status-${team.status.toLowerCase()}`}>{team.status}</span>
                    </div>
                    <div className="text-sm text-[var(--text-muted)] mb-3">
                      Created: {new Date(team.created_at).toLocaleDateString()} &middot; Capacity: {team.member_count} / {team.max_members || '∞'}
                    </div>
                    
                    <div className="mt-2 border-t border-[var(--border-color)] pt-2">
                      <h5 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Members</h5>
                      {team.members && team.members.length > 0 ? (
                        <div className="space-y-1">
                          {team.members.map(m => (
                            <div key={m.member_id} className="flex justify-between text-sm">
                              <span>{m.full_name} <span className="text-xs text-[var(--text-muted)]">({m.register_number})</span></span>
                              <span className={m.role === 'leader' ? 'text-[var(--accent-color)] font-bold' : ''}>{m.role}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm">No members details available.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
