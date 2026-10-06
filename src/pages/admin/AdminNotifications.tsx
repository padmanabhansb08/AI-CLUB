import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { notificationsApi } from '../../api/notifications.api';
import {
  Bell,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  History,
  TrendingUp,
  Loader2,
  Check,
} from 'lucide-react';
import type {
  AnnouncementAudience,
  NotificationPriority,
  AnnouncementHistoryItem,
} from '../../types/notifications';

const AUDIENCES: Array<{ id: AnnouncementAudience; label: string; desc: string }> = [
  { id: 'ALL_MEMBERS', label: 'All Members', desc: 'Broadcast to every registered student and admin' },
  { id: 'STUDENTS', label: 'Students Only', desc: 'Deliver only to active club student members' },
  { id: 'ADMINS', label: 'Admins & Staff', desc: 'Internal notice for club administrators' },
  { id: 'COURSE_MEMBERS', label: 'Course Enrollees', desc: 'Members enrolled in a specific course' },
  { id: 'PROJECT_MEMBERS', label: 'Project Collaborators', desc: 'Members active on a specific project' },
  { id: 'EVENT_REGISTRANTS', label: 'Event Attendees', desc: 'Students registered for a specific event' },
];

export const AdminNotifications: React.FC = () => {
  const [history, setHistory] = useState<AnnouncementHistoryItem[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    uniqueRecipients: 0,
    readCount: 0,
    readRate: 0,
  });
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<AnnouncementAudience>('ALL_MEMBERS');
  const [targetId, setTargetId] = useState('');
  const [priority, setPriority] = useState<NotificationPriority>('NORMAL');
  const [expiresInDays, setExpiresInDays] = useState(30);

  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getAdminHistory({ page: 1, limit: 30 });
      setHistory(res.items);
      if (res.pagination?.stats) {
        setStats(res.pagination.stats);
      }
    } catch (err) {
      console.error('Failed to load announcement history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    setFeedback(null);
    try {
      const res = await notificationsApi.sendAnnouncement({
        title: title.trim(),
        message: message.trim(),
        audience,
        audience_target_id: targetId.trim() || undefined,
        priority,
        expires_in_days: Number(expiresInDays) || 30,
      });

      setFeedback({
        type: 'success',
        message: `Announcement successfully broadcasted to ${res.recipientCount} recipient(s)!`,
      });
      setTitle('');
      setMessage('');
      setTargetId('');
      await fetchHistory();
    } catch (err: any) {
      console.error('Failed to send announcement:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to dispatch announcement. Check audience configuration.',
      });
    } finally {
      setSending(false);
    }
  };

  const needsTargetId = ['COURSE_MEMBERS', 'PROJECT_MEMBERS', 'EVENT_REGISTRANTS'].includes(
    audience
  );

  return (
    <AdminLayout pageTitle="Announcements & Notifications">
      <div className="space-y-8 pb-16">
        {/* Header Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#121624] border border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Send size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats.totalSent}</div>
              <div className="text-xs text-gray-400">Total Notifications Sent</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121624] border border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats.uniqueRecipients}</div>
              <div className="text-xs text-gray-400">Total Reachable Members</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121624] border border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats.readCount}</div>
              <div className="text-xs text-gray-400">Read Receipts Confirmed</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#121624] border border-white/10 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="text-2xl font-black text-white">{stats.readRate}%</div>
              <div className="text-xs text-gray-400">Overall Engagement Rate</div>
            </div>
          </div>
        </div>

        {/* Create Announcement Form */}
        <div className="rounded-3xl bg-[#121624] border border-white/10 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Bell size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Broadcast Platform Announcement</h2>
              <p className="text-xs text-gray-400">
                Send targeted announcements directly to members' persistent notification centers.
              </p>
            </div>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-2xl mb-6 text-xs flex items-center gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSendAnnouncement} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Club Hackathon 2026 Registration Open"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Target Audience *
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as AnnouncementAudience)}
                  className="w-full bg-[#161c2e] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                >
                  {AUDIENCES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label} — {a.desc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {needsTargetId && (
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Specific Entity Target ID (Course, Project, or Event ID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Course ID, Project ID, or Event ID"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                Announcement Message *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Write your announcement message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                  className="w-full bg-[#161c2e] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High (Urgent)</option>
                  <option value="CRITICAL">Critical (Immediate alert)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Expires in (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value, 10) || 30)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                <span>{sending ? 'Broadcasting...' : 'Broadcast Announcement'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Announcement History & Delivery Logs */}
        <div className="rounded-3xl bg-[#121624] border border-white/10 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <History size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Broadcast History & Delivery Stats</h2>
              <p className="text-xs text-gray-400">
                Audit past announcements, audience reach, and member read receipts.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-bold text-gray-400 uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-3 px-4">Title & Message</th>
                  <th className="py-3 px-4 text-center">Priority</th>
                  <th className="py-3 px-4 text-center">Sent Date</th>
                  <th className="py-3 px-4 text-center">Recipients</th>
                  <th className="py-3 px-4 text-center">Read Count</th>
                  <th className="py-3 px-4 text-right">Read Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      <Loader2 size={24} className="animate-spin text-cyan-400 mx-auto mb-2" />
                      <span>Loading delivery logs...</span>
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No broadcast history found.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => {
                    const rate =
                      item.recipient_count > 0
                        ? Math.round((item.read_count / item.recipient_count) * 100)
                        : 0;
                    return (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 max-w-sm">
                          <div className="font-bold text-white truncate">{item.title}</div>
                          <div className="text-[11px] text-gray-400 truncate mt-0.5">
                            {item.message}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              item.priority === 'CRITICAL'
                                ? 'bg-rose-500/20 text-rose-300'
                                : item.priority === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-white/10 text-gray-400'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center text-gray-400 text-[11px]">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-3 px-4 text-center font-bold text-white">
                          {item.recipient_count}
                        </td>

                        <td className="py-3 px-4 text-center text-cyan-300">
                          {item.read_count}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-emerald-400">{rate}%</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
