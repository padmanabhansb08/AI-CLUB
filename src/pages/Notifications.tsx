import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { notificationsApi } from '../api/notifications.api';
import { NotificationItem } from '../components/notifications/NotificationItem';
import { NotificationPreferencesModal } from '../components/notifications/NotificationPreferencesModal';
import {
  Bell,
  CheckCheck,
  Sliders,
  Clock,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
  Sparkles,
} from 'lucide-react';
import type { NotificationItem as NotificationItemType, MemberActivityItem } from '../types/notifications';

type TabMode = 'ALL' | 'UNREAD' | 'ACTIVITY';

export const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabMode>('ALL');
  const [notifications, setNotifications] = useState<NotificationItemType[]>([]);
  const [activities, setActivities] = useState<MemberActivityItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [preferencesOpen, setPreferencesOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'ACTIVITY') {
        const actRes = await notificationsApi.getActivity(30);
        setActivities(actRes);
      } else {
        const res = await notificationsApi.getNotifications({
          page,
          limit: 15,
          unreadOnly: activeTab === 'UNREAD',
        });
        setNotifications(res.items);
        setTotalPages(res.pagination.totalPages || 1);
        setUnreadCount(res.pagination.unreadCount ?? 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: now })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#121624] via-[#161c2e] to-[#121624] border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bell size={26} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <span>Notification Center</span>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {unreadCount} unread
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Stay informed on event updates, course progress, team invitations, and achievements.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && activeTab !== 'ACTIVITY' && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-cyan-300 border border-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-1.5"
              >
                <CheckCheck size={15} />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={() => setPreferencesOpen(true)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5"
              title="Notification Preferences"
            >
              <Sliders size={16} />
              <span className="hidden sm:inline">Preferences</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#121624] border border-white/10 w-fit">
          <button
            onClick={() => {
              setActiveTab('ALL');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={14} />
            <span>All Notifications</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('UNREAD');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'UNREAD'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Inbox size={14} />
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('ACTIVITY');
              setPage(1);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ACTIVITY'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={14} />
            <span>Activity Feed</span>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-[#121624]/40 rounded-3xl border border-white/5">
            <Loader2 size={32} className="animate-spin text-cyan-400 mb-2" />
            <span className="text-xs">Loading updates...</span>
          </div>
        ) : activeTab === 'ACTIVITY' ? (
          /* Activity Feed View */
          activities.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#121624]/60 border border-white/10 p-8">
              <Activity size={40} className="mx-auto text-gray-600 mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-white">No recent activity logged</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                Participate in events, courses, or projects to begin building your activity timeline.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#121624] border border-white/10 p-6 space-y-4">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Clock size={16} className="text-cyan-400" />
                <span>Your Platform Timeline</span>
              </h3>
              <div className="divide-y divide-white/5">
                {activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          {act.activity_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {new Date(act.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {act.metadata?.message ||
                          `Logged action on ${act.entity_type.toLowerCase()} record.`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : notifications.length === 0 ? (
          /* Notifications Empty State */
          <div className="py-20 text-center rounded-3xl bg-[#121624]/60 border border-white/10 p-8">
            <Inbox size={42} className="mx-auto text-gray-600 mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-white">
              {activeTab === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
              {activeTab === 'UNREAD'
                ? "You're all caught up! Switch to 'All Notifications' to view past history."
                : 'Important platform updates and achievements will appear here.'}
            </p>
          </div>
        ) : (
          /* Notification List */
          <div className="space-y-2">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <span className="text-xs text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preferences Modal */}
        <NotificationPreferencesModal
          isOpen={preferencesOpen}
          onClose={() => setPreferencesOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
};
