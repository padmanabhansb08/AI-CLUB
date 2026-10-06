import React, { useState, useEffect } from 'react';
import { X, Check, Bell, Loader2, ShieldCheck } from 'lucide-react';
import { notificationsApi } from '../../api/notifications.api';
import type { NotificationPreferences } from '../../types/notifications';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const NotificationPreferencesModal: React.FC<NotificationPreferencesModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    event_notifications: true,
    project_notifications: true,
    team_notifications: true,
    course_notifications: true,
    achievement_notifications: true,
    system_notifications: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      notificationsApi
        .getPreferences()
        .then((data) => {
          if (data) {
            setPreferences({
              event_notifications: data.event_notifications ?? true,
              project_notifications: data.project_notifications ?? true,
              team_notifications: data.team_notifications ?? true,
              course_notifications: data.course_notifications ?? true,
              achievement_notifications: data.achievement_notifications ?? true,
              system_notifications: data.system_notifications ?? true,
            });
          }
        })
        .catch((err) => console.error('Failed to load preferences:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await notificationsApi.updatePreferences(preferences);
      setSuccessMsg('Preferences saved successfully!');
      if (onSaved) onSaved();
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const prefOptions: Array<{
    key: keyof NotificationPreferences;
    title: string;
    description: string;
  }> = [
    {
      key: 'achievement_notifications',
      title: 'Achievement Recognition',
      description: 'Receive notifications when you unlock achievements and earn club points.',
    },
    {
      key: 'event_notifications',
      title: 'Events & Attendance',
      description: 'Get confirmation when registered, check-in updates, and schedule changes.',
    },
    {
      key: 'course_notifications',
      title: 'Courses & Learning',
      description: 'Notifications on enrollment, completed lessons, and course certifications.',
    },
    {
      key: 'project_notifications',
      title: 'Projects & Milestones',
      description: 'Updates when your join requests are approved and milestones are hit.',
    },
    {
      key: 'team_notifications',
      title: 'Teams & Invitations',
      description: 'Alerts when invited to a team or when colleagues accept your invites.',
    },
    {
      key: 'system_notifications',
      title: 'Platform Announcements',
      description: 'Club-wide broadcasts and administrative announcements.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div
        className="w-full max-w-lg rounded-2xl border border-white/10 p-6 flex flex-col shadow-2xl relative"
        style={{ backgroundColor: '#121624' }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bell size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Notification Preferences</h3>
            <p className="text-xs text-gray-400">
              Customize which notifications you receive across AI CLUB.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400">
            <Loader2 size={28} className="animate-spin text-cyan-400 mb-2" />
            <span className="text-sm">Loading preferences...</span>
          </div>
        ) : (
          <div className="space-y-4 my-2 max-h-[60vh] overflow-y-auto pr-1">
            {prefOptions.map((opt) => {
              const checked = !!preferences[opt.key];
              return (
                <div
                  key={opt.key}
                  onClick={() => handleToggle(opt.key)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 cursor-pointer transition-all"
                >
                  <div className="pr-4">
                    <h4 className="text-sm font-semibold text-white">{opt.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.description}</p>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 ${
                      checked ? 'bg-cyan-500' : 'bg-white/10'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        checked ? 'transform translate-x-5' : ''
                      }`}
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mt-3">
              <ShieldCheck size={16} className="shrink-0" />
              <span>
                Account security and critical administrative notices will always be delivered regardless of preferences.
              </span>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="my-2 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:opacity-95 shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};
