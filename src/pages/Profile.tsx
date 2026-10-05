import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import type { Member } from '../data/members';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { YEAR_OPTIONS, DEPARTMENT_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions';
import { User, Link as LinkIcon, Terminal, CheckCircle, AlertCircle, Edit2, X, Save } from 'lucide-react';

export const Profile: React.FC = () => {
  const user = authService.getCurrentUser();
  const [profile, setProfile] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Member>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await profileService.getProfile();
      setProfile(data);
      setEditForm(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleEditChange = (field: keyof Member, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'skills' | 'technicalInterests', value: string) => {
    const array = value.split(',').map(s => s.trim()).filter(s => s !== '');
    setEditForm(prev => ({ ...prev, [field]: array }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError('');
      setSaveSuccess('');
      
      const updateData = {
        fullName: editForm.fullName,
        department: editForm.department,
        classSection: editForm.classSection,
        year: editForm.year ? Number(editForm.year) : undefined,
        phone: editForm.phone,
        bio: editForm.bio,
        githubUrl: editForm.githubUrl,
        linkedinUrl: editForm.linkedinUrl,
        portfolioUrl: editForm.portfolioUrl,
        skills: editForm.skills,
        technicalInterests: editForm.technicalInterests
      };

      const updated = await profileService.updateProfile(updateData);
      setProfile(updated);
      setEditForm(updated);
      setIsEditing(false);
      setSaveSuccess('Profile updated successfully.');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditForm(profile || {});
    setIsEditing(false);
    setSaveError('');
  };

  if (loading) {
    return <div className="page-container flex-center min-h-[50vh]"><div className="loading-spinner" /></div>;
  }

  if (error || !profile) {
    return (
      <div className="page-container">
        <div className="error-state">
          <AlertCircle size={48} />
          <h2 className="text-xl font-bold mt-4 mb-2">Error Loading Profile</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Button onClick={loadProfile}>Try Again</Button>
        </div>
      </div>
    );
  }

  const completionPct = profile.profileCompletion || 0;
  
  const missingItems = [];
  if (!profile.bio) missingItems.push('Short Bio');
  if (!profile.githubUrl) missingItems.push('GitHub');
  if (!profile.linkedinUrl) missingItems.push('LinkedIn');
  if (!profile.portfolioUrl) missingItems.push('Portfolio');
  if (!profile.skills || profile.skills.length === 0) missingItems.push('Skills / Technologies');
  if (!profile.technicalInterests || profile.technicalInterests.length === 0) missingItems.push('Technical Interests');

  return (
    <div className="page-container max-w-4xl mx-auto pb-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="page-title mb-2">Member Profile</h1>
          <p className="text-gray-400">Manage your club identity and professional details.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 bg-dark-bg p-3 rounded-lg border border-gray-800">
            <div className="text-sm text-gray-400">Completion</div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-500" 
                  style={{ width: completionPct + '%' }}
                />
              </div>
              <span className="text-sm font-mono text-accent">{completionPct}%</span>
            </div>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Edit2 size={16} /> Edit Profile</div>
            </Button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-3 rounded-lg">
          <CheckCircle size={18} />
          {saveSuccess}
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 rounded-lg">
          <AlertCircle size={18} />
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          <div className="content-card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <User size={18} className="text-accent" /> Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={isEditing ? editForm.fullName || '' : profile.fullName} 
                onChange={e => handleEditChange('fullName', e.target.value)}
                disabled={!isEditing} 
              />
              <div>
                <Input 
                  label="Register Number" 
                  value={profile.registerNumber} 
                  disabled={true} 
                />
                <span className="text-xs text-gray-500">Read-only</span>
              </div>
              <Select 
                label="Department" 
                value={isEditing ? editForm.department || '' : profile.department} 
                onChange={e => handleEditChange('department', e.target.value)}
                options={DEPARTMENT_OPTIONS}
                disabled={!isEditing} 
              />
              <div className="grid grid-cols-2 gap-4">
                <Select 
                  label="Class/Section" 
                  value={isEditing ? editForm.classSection || '' : profile.classSection} 
                  onChange={e => handleEditChange('classSection', e.target.value)}
                  options={SECTION_OPTIONS}
                  disabled={!isEditing} 
                />
                <Select 
                  label="Year" 
                  value={isEditing ? String(editForm.year || '') : String(profile.year || '')} 
                  onChange={e => handleEditChange('year', e.target.value)}
                  options={YEAR_OPTIONS}
                  disabled={!isEditing} 
                />
              </div>
              <div>
                <Input 
                  label="College Email" 
                  value={profile.collegeEmail} 
                  disabled={true} 
                />
                <span className="text-xs text-gray-500">Read-only</span>
              </div>
              <Input 
                label="Phone Number" 
                value={isEditing ? editForm.phone || '' : profile.phone || ''} 
                onChange={e => handleEditChange('phone', e.target.value)}
                disabled={!isEditing} 
              />
            </div>
          </div>

          <div className="content-card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <Terminal size={18} className="text-accent" /> Club Profile
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Short Bio</label>
                {isEditing ? (
                  <textarea 
                    className="w-full bg-dark-bg border border-gray-800 rounded p-3 text-white focus:outline-none focus:border-accent min-h-[100px]"
                    value={editForm.bio || ''}
                    onChange={e => handleEditChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-300 bg-dark-bg p-4 rounded border border-gray-800 min-h-[60px]">
                    {profile.bio || <span className="text-gray-500 italic">No bio provided.</span>}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Technical Interests <span className="text-xs text-gray-500">(comma separated)</span></label>
                {isEditing ? (
                  <Input 
                    value={editForm.technicalInterests?.join(', ') || ''} 
                    onChange={e => handleArrayChange('technicalInterests', e.target.value)}
                    placeholder="e.g. Machine Learning, Web Dev, IoT"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.technicalInterests && profile.technicalInterests.length > 0 ? (
                      profile.technicalInterests.map((interest, i) => (
                        <span key={i} className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs border border-accent/20">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No technical interests listed.</span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Skills / Technologies <span className="text-xs text-gray-500">(comma separated)</span></label>
                {isEditing ? (
                  <Input 
                    value={editForm.skills?.join(', ') || ''} 
                    onChange={e => handleArrayChange('skills', e.target.value)}
                    placeholder="e.g. Python, React, PostgreSQL"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 rounded text-xs border border-gray-700">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-sm">No skills listed.</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="space-y-6">
          
          <div className="content-card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
              <LinkIcon size={18} className="text-accent" /> Professional Links
            </h2>
            <div className="space-y-4">
              <Input 
                label="GitHub" 
                placeholder="https://github.com/..."
                value={isEditing ? editForm.githubUrl || '' : profile.githubUrl || ''} 
                onChange={e => handleEditChange('githubUrl', e.target.value)}
                disabled={!isEditing} 
              />
              <Input 
                label="LinkedIn" 
                placeholder="https://linkedin.com/in/..."
                value={isEditing ? editForm.linkedinUrl || '' : profile.linkedinUrl || ''} 
                onChange={e => handleEditChange('linkedinUrl', e.target.value)}
                disabled={!isEditing} 
              />
              <Input 
                label="Portfolio" 
                placeholder="https://..."
                value={isEditing ? editForm.portfolioUrl || '' : profile.portfolioUrl || ''} 
                onChange={e => handleEditChange('portfolioUrl', e.target.value)}
                disabled={!isEditing} 
              />
            </div>
          </div>

          <div className="content-card">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-gray-800 pb-2">
              <CheckCircle size={18} className={completionPct === 100 ? "text-green-400" : "text-gray-400"} /> Completion
            </h2>
            <div className="mb-4">
              <div className="text-3xl font-mono mb-1">{completionPct}%</div>
              <div className="text-sm text-gray-400">Profile complete</div>
            </div>
            
            {missingItems.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">Missing Items:</h3>
                <ul className="space-y-1">
                  {missingItems.map((item, i) => (
                    <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span> {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 p-3 bg-accent/5 border border-accent/20 rounded text-sm text-accent">
                  Add {missingItems[0].toLowerCase()} to improve your club profile.
                </div>
              </div>
            ) : (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded text-sm text-green-400 flex items-center gap-2">
                <CheckCircle size={16} /> All fields completed!
              </div>
            )}
          </div>

        </div>
      </div>

      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-dark-card border-t border-gray-800 p-4 z-50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-400">
              You have unsaved changes.
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><X size={16} /> Cancel</div>
              </Button>
              <Button onClick={handleSave} isLoading={saving}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Save size={16} /> Save Changes</div>
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
