import { useState, useEffect } from 'react';
import { 
  Bot, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  User as UserIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../components/layout/AdminLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { PasswordSettings } from '../components/PasswordSettings';
import { useAuth } from '../context/AuthContext';
import { aiApi } from '../api/ai.api';
import type { AIPreferences } from '../types/ai';

export function Settings({ admin = false }: { admin?: boolean }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [preferences, setPreferences] = useState<AIPreferences>({
    memberId: '',
    recommendationsEnabled: true,
    assistantEnabled: true,
    learningInsightsEnabled: true,
    weeklySummaryEnabled: true,
    updatedAt: '',
  });
  const [loadingAI, setLoadingAI] = useState(true);
  const [savingAI, setSavingAI] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    if (!admin) {
      aiApi.getPreferences()
        .then(prefs => {
          setPreferences(prefs);
          setLoadingAI(false);
        })
        .catch(err => {
          console.error('Failed to load AI preferences:', err);
          setLoadingAI(false);
        });
    }
  }, [admin]);

  const handleToggle = (key: keyof AIPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveAI = async () => {
    setSavingAI(true);
    setAiMessage(null);
    setAiError(null);
    try {
      const updated = await aiApi.updatePreferences({
        recommendationsEnabled: preferences.recommendationsEnabled,
        assistantEnabled: preferences.assistantEnabled,
        learningInsightsEnabled: preferences.learningInsightsEnabled,
        weeklySummaryEnabled: preferences.weeklySummaryEnabled,
      });
      setPreferences(updated);
      setAiMessage('AI preferences successfully updated.');
    } catch (err: any) {
      setAiError(err.response?.data?.error?.message || err.message || 'Failed to update preferences.');
    } finally {
      setSavingAI(false);
    }
  };

  const content = (
    <div className="settings-page max-w-4xl mx-auto space-y-8 pb-12">
      {/* Account Info Section */}
      <section className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-[20px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-black/5 text-[#111111]">
            <UserIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#111111]">Account Profile</h2>
            <p className="text-xs text-[#66645F]">Your authentication and club membership credentials</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.04)]">
            <span className="text-xs text-[#92908A] block uppercase font-mono tracking-wider mb-1">Signed in as</span>
            <span className="font-medium text-[#111111]">{user?.email || user?.collegeEmail || "Member"}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.04)]">
            <span className="text-xs text-[#92908A] block uppercase font-mono tracking-wider mb-1">Role / Access</span>
            <span className="font-medium text-[#111111]">{admin ? "Club Administrator" : "Student Member"}</span>
          </div>
        </div>

        {!admin && (
          <div className="mt-4 pt-4 border-t border-[rgba(17,17,17,0.06)] flex justify-between items-center">
            <span className="text-xs text-[#66645F]">Looking to edit skills or department details?</span>
            <Link to="/profile" className="text-xs font-semibold text-[#111111] hover:underline">
              Edit your member profile &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Password & Security Section */}
      <PasswordSettings />

      {/* AI Privacy & Personalization Settings (Students only) */}
      {!admin && (
        <section className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-[20px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-black/5 text-[#111111]">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#111111]">AI Intelligence &amp; Personalization</h2>
                <p className="text-xs text-[#66645F]">Control AI recommendations, personalized insight generation, and privacy</p>
              </div>
            </div>
            <button
              onClick={handleSaveAI}
              disabled={savingAI || loadingAI}
              className="px-4 py-2 rounded-full bg-[#050505] text-[#FFFFFF] text-xs font-semibold hover:bg-black/80 transition-all disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Save size={14} />
              {savingAI ? 'Saving...' : 'Save AI Settings'}
            </button>
          </div>

          {aiMessage && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{aiMessage}</span>
            </div>
          )}

          {aiError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{aiError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.04)]">
              <div>
                <h4 className="text-sm font-semibold text-[#111111]">Course &amp; Project Recommendations</h4>
                <p className="text-xs text-[#66645F]">Allow AI to recommend tailored workshops, events, and peers based on your technical interests.</p>
              </div>
              <input 
                type="checkbox"
                checked={preferences.recommendationsEnabled}
                onChange={() => handleToggle('recommendationsEnabled')}
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.04)]">
              <div>
                <h4 className="text-sm font-semibold text-[#111111]">AI Coding &amp; Learning Assistant</h4>
                <p className="text-xs text-[#66645F]">Enable interactive natural language assistant for queries, explanations, and learning tracks.</p>
              </div>
              <input 
                type="checkbox"
                checked={preferences.assistantEnabled}
                onChange={() => handleToggle('assistantEnabled')}
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.04)]">
              <div>
                <h4 className="text-sm font-semibold text-[#111111]">Skill Gap Analysis</h4>
                <p className="text-xs text-[#66645F]">Permit automatic analysis of target roles to discover missing skills and prerequisites.</p>
              </div>
              <input 
                type="checkbox"
                checked={preferences.learningInsightsEnabled}
                onChange={() => handleToggle('learningInsightsEnabled')}
                className="w-4 h-4 rounded text-black cursor-pointer"
              />
            </div>
          </div>
        </section>
      )}

      {/* Session Management */}
      <section className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-[20px] p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <h2 className="text-lg font-semibold text-[#111111] mb-1">Session Management</h2>
        <p className="text-xs text-[#66645F] mb-4">Sign out when you finish using a shared device or computer.</p>
        <button
          className="px-5 py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
          onClick={async () => {
            await logout();
            navigate(admin ? "/admin/login" : "/login", { replace: true });
          }}
        >
          Sign out of this session
        </button>
      </section>
    </div>
  );

  return admin ? (
    <AdminLayout pageTitle="Settings">{content}</AdminLayout>
  ) : (
    <DashboardLayout pageTitle="Settings">{content}</DashboardLayout>
  );
}

export default Settings;
