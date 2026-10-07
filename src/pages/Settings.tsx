import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Bot, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Lock
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { aiApi } from '../api/ai.api';
import type { AIPreferences } from '../types/ai';

export const Settings: React.FC = () => {
  const [preferences, setPreferences] = useState<AIPreferences>({
    memberId: '',
    recommendationsEnabled: true,
    assistantEnabled: true,
    learningInsightsEnabled: true,
    weeklySummaryEnabled: true,
    updatedAt: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    aiApi.getPreferences()
      .then(prefs => {
        setPreferences(prefs);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load AI preferences:', err);
        setLoading(false);
      });
  }, []);

  const handleToggle = (key: keyof AIPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await aiApi.updatePreferences({
        recommendationsEnabled: preferences.recommendationsEnabled,
        assistantEnabled: preferences.assistantEnabled,
        learningInsightsEnabled: preferences.learningInsightsEnabled,
        weeklySummaryEnabled: preferences.weeklySummaryEnabled,
      });
      setPreferences(updated);
      setMessage('AI preferences successfully updated.');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to update preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Settings">
      <div style={{ maxWidth: '880px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
        
        {/* Header */}
        <div 
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(17, 17, 17, 0.08)',
            borderRadius: '16px',
            padding: '1.5rem 1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div 
            style={{ 
              width: '42px', 
              height: '42px', 
              borderRadius: '10px', 
              background: '#050505', 
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <SettingsIcon size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0, color: '#111111', letterSpacing: '-0.02em' }}>
              Account & Intelligence Controls
            </h1>
            <p style={{ margin: 0, color: '#66645F', fontSize: '0.875rem' }}>
              Manage your AI assistant preferences, adaptive recommendation filters, and data transparency boundaries.
            </p>
          </div>
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'rgba(21, 128, 61, 0.08)', border: '1px solid rgba(21, 128, 61, 0.25)', color: '#15803d', fontSize: '0.875rem', fontWeight: 500 }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1.25rem', borderRadius: '10px', background: 'rgba(185, 28, 28, 0.08)', border: '1px solid rgba(185, 28, 28, 0.25)', color: '#b91c1c', fontSize: '0.875rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* AI Preferences Card */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(17, 17, 17, 0.08)', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(17, 17, 17, 0.08)' }}>
            <Bot size={20} color="#111111" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111111', margin: 0 }}>
              AI Intelligence Layer Preferences
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '1.5rem', color: '#66645F', fontSize: '0.9rem', textAlign: 'center' }}>Loading preferences...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Recommendations Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.15rem', borderBottom: '1px solid rgba(17, 17, 17, 0.06)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#111111', fontSize: '0.95rem', fontWeight: 600 }}>Personalized Recommendations</h4>
                  <p style={{ margin: 0, color: '#66645F', fontSize: '0.825rem', lineHeight: 1.5 }}>
                    Generate course, workshop, and team project suggestions matched to your recorded skills and progression.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={preferences.recommendationsEnabled}
                  onChange={() => handleToggle('recommendationsEnabled')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#050505', marginTop: '3px' }}
                />
              </div>

              {/* Assistant Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.15rem', borderBottom: '1px solid rgba(17, 17, 17, 0.06)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#111111', fontSize: '0.95rem', fontWeight: 600 }}>Interactive AI Companion</h4>
                  <p style={{ margin: 0, color: '#66645F', fontSize: '0.825rem', lineHeight: 1.5 }}>
                    Enable interactive chat guidance on courses, curriculum roadmaps, and club resources.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={preferences.assistantEnabled}
                  onChange={() => handleToggle('assistantEnabled')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#050505', marginTop: '3px' }}
                />
              </div>

              {/* Learning Insights Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1.15rem', borderBottom: '1px solid rgba(17, 17, 17, 0.06)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#111111', fontSize: '0.95rem', fontWeight: 600 }}>Next Best Action & Learning Insights</h4>
                  <p style={{ margin: 0, color: '#66645F', fontSize: '0.825rem', lineHeight: 1.5 }}>
                    Display recommended next academic milestones and progression commentary on your workspace dashboard.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={preferences.learningInsightsEnabled}
                  onChange={() => handleToggle('learningInsightsEnabled')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#050505', marginTop: '3px' }}
                />
              </div>

              {/* Weekly Highlights Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '0.5rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#111111', fontSize: '0.95rem', fontWeight: 600 }}>Weekly Activity Highlights</h4>
                  <p style={{ margin: 0, color: '#66645F', fontSize: '0.825rem', lineHeight: 1.5 }}>
                    Synthesize weekly milestone completions, badges earned, and workshop attendance.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={preferences.weeklySummaryEnabled}
                  onChange={() => handleToggle('weeklySummaryEnabled')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#050505', marginTop: '3px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(17, 17, 17, 0.08)' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.75rem 1.75rem',
                    borderRadius: '9999px',
                    border: 'none',
                    background: '#050505',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    opacity: saving ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* AI Privacy & Data Governance Model */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(17, 17, 17, 0.08)', padding: '1.75rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={20} color="#15803d" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111111', margin: 0 }}>
              Privacy & Data Transparency Framework
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: '#FAF9F6', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(17, 17, 17, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#111111', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Eye size={16} />
                <span>What AI Accesses:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#66645F', lineHeight: 1.6 }}>
                <li>Chosen technical skills and academic interests</li>
                <li>Completed course titles and learning counts</li>
                <li>Registered workshop and hackathon attendance</li>
                <li>Project pod memberships and earned credentials</li>
              </ul>
            </div>

            <div style={{ background: '#FAF9F6', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(17, 17, 17, 0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#15803d', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <Lock size={16} />
                <span>Strict Security Exclusions:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#66645F', lineHeight: 1.6 }}>
                <li>Zero access to passwords, tokens, or email hashes</li>
                <li>Zero exposure of other members' private records</li>
                <li>External LLM providers receive minimized prompts</li>
                <li>All AI conversations can be permanently deleted by you</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
export default Settings;
