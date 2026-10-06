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
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-color, #38bdf8)' }}>
            <SettingsIcon size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
              Account & AI Privacy Settings
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.85rem' }}>
              Manage your AI intelligence preferences, recommendation filters, and data transparency controls.
            </p>
          </div>
        </div>

        {message && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.85rem 1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* AI Preferences Card */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, #334155)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Bot size={20} color="var(--accent-color, #38bdf8)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              AI Intelligence Layer Controls
            </h2>
          </div>

          {loading ? (
            <div style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>Loading settings...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Recommendations Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '0.95rem' }}>Personalized Recommendations</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
                    Generate course, event, and project suggestions matched to your recorded skills and learning progress.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={preferences.recommendationsEnabled}
                  onChange={() => handleToggle('recommendationsEnabled')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color, #38bdf8)' }}
                />
              </div>

              {/* Assistant Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '0.95rem' }}>AI Club Assistant</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
                    Enable interactive chat assistant assistance on courses, curriculum roadmaps, and club resources.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={preferences.assistantEnabled}
                  onChange={() => handleToggle('assistantEnabled')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color, #38bdf8)' }}
                />
              </div>

              {/* Learning Insights Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '0.95rem' }}>Dashboard Next Best Action & Insights</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
                    Show computed next best learning step and progression commentary on your student dashboard.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={preferences.learningInsightsEnabled}
                  onChange={() => handleToggle('learningInsightsEnabled')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color, #38bdf8)' }}
                />
              </div>

              {/* Weekly Highlights Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', color: '#f8fafc', fontSize: '0.95rem' }}>Weekly Activity Highlights</h4>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem' }}>
                    Synthesize weekly milestone completions, badges earned, and workshop attendance.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={preferences.weeklySummaryEnabled}
                  onChange={() => handleToggle('weeklySummaryEnabled')}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-color, #38bdf8)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.65rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent-color, #38bdf8)',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Save size={16} />
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>

            </div>
          )}
        </div>

        {/* AI Privacy & Data Minimization Disclosure */}
        <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '12px', border: '1px solid var(--border-color, #334155)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <ShieldCheck size={20} color="#4ade80" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
              AI Privacy & Data Governance Model
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <Eye size={16} />
                <span>What AI Accesses:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                <li>Your chosen technical skills and interests</li>
                <li>Completed course titles and learning counts</li>
                <li>Attended workshop and event records</li>
                <li>Enrolled project pods and badges earned</li>
              </ul>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <Lock size={16} />
                <span>Strict Security Exclusions:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
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
