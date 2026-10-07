import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { notificationsApi } from '../api/notifications.api';
import { notifyError } from '../services/actionFeedback';
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
      notifyError(err instanceof Error ? err.message : 'Notifications could not be loaded. Please refresh to retry.');
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
      notifyError(err instanceof Error ? err.message : 'This notification was not marked as read.');
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
      notifyError(err instanceof Error ? err.message : 'Notifications were not marked as read.');
    }
  };

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] shadow-sm">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-3 rounded-2xl bg-[#050505] text-[#FFFFFF] shrink-0">
              <Bell size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-[#111111] tracking-tight">Notification Center</h1>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FAF9F6] border border-[rgba(17,17,17,0.1)] text-[#111111] font-mono">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-[#66645F] mt-1 line-clamp-1 sm:line-clamp-none">
                Stay informed on events, learning milestones, team invitations, and recognition.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
            {unreadCount > 0 && activeTab !== 'ACTIVITY' && (
              <button
                onClick={handleMarkAllAsRead}
                className="pill-outline text-xs py-1.5 px-4 flex items-center gap-1.5"
              >
                <CheckCheck size={14} />
                <span>Mark All Read</span>
              </button>
            )}

            <button
              onClick={() => setPreferencesOpen(true)}
              className="pill-outline text-xs py-1.5 px-4 flex items-center gap-1.5"
              title="Notification Preferences"
              aria-label="Notification Preferences"
            >
              <Sliders size={14} />
              <span>Preferences</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] w-full sm:w-fit overflow-x-auto shadow-sm">
          <button
            aria-pressed={activeTab === 'ALL'}
              onClick={() => {
              setActiveTab('ALL');
              setPage(1);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'ALL'
                ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
                : 'text-[#66645F] hover:text-[#111111]'
            }`}
          >
            <Layers size={13} />
            <span>All</span>
          </button>

          <button
            aria-pressed={activeTab === 'UNREAD'}
              onClick={() => {
              setActiveTab('UNREAD');
              setPage(1);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'UNREAD'
                ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
                : 'text-[#66645F] hover:text-[#111111]'
            }`}
          >
            <Inbox size={13} />
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            aria-pressed={activeTab === 'ACTIVITY'}
              onClick={() => {
              setActiveTab('ACTIVITY');
              setPage(1);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'ACTIVITY'
                ? 'bg-[#050505] text-[#FFFFFF] shadow-sm'
                : 'text-[#66645F] hover:text-[#111111]'
            }`}
          >
            <Activity size={13} />
            <span>Activity Feed</span>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66645F] bg-[#FFFFFF] rounded-3xl border border-[rgba(17,17,17,0.08)] shadow-sm">
            <Loader2 size={32} className="animate-spin text-[#111111] mb-2" />
            <span className="text-xs">Loading updates...</span>
          </div>
        ) : activeTab === 'ACTIVITY' ? (
          /* Activity Feed View */
          activities.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] p-8 shadow-sm">
              <Activity size={40} className="mx-auto text-[#92908A] mb-2 opacity-50" />
              <h3 className="text-sm font-bold text-[#111111]">No recent activity logged</h3>
              <p className="text-xs text-[#66645F] max-w-sm mx-auto mt-1">
                Participate in events, courses, or projects to begin building your activity timeline.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-[#111111] mb-2 flex items-center gap-2">
                <Clock size={16} className="text-[#111111]" />
                <span>Your Platform Timeline</span>
              </h3>
              <div className="divide-y divide-[rgba(17,17,17,0.06)]">
                {activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-start gap-3">
                    <div className="p-2 rounded-full bg-[#FAF9F6] text-[#111111] border border-[rgba(17,17,17,0.08)] shrink-0 mt-0.5">
                      <Sparkles size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#111111] uppercase tracking-wider">
                          {act.activity_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[11px] text-[#92908A]">
                          {new Date(act.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-[#66645F] mt-0.5">
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
          <div className="py-20 text-center rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] p-8 shadow-sm">
            <Inbox size={42} className="mx-auto text-[#92908A] mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-[#111111]">
              {activeTab === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-xs text-[#66645F] max-w-sm mx-auto mt-1">
              {activeTab === 'UNREAD'
                ? "You're all caught up! Switch to 'All' to view past history."
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
              <div className="flex items-center justify-between pt-6 border-t border-[rgba(17,17,17,0.08)]">
                <span className="text-xs text-[#66645F]">
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-2 rounded-full border border-[rgba(17,17,17,0.1)] bg-[#FAF9F6] hover:bg-[#EBE9E3] text-[#111111] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-full border border-[rgba(17,17,17,0.1)] bg-[#FAF9F6] hover:bg-[#EBE9E3] text-[#111111] disabled:opacity-30 disabled:pointer-events-none transition-colors"
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
export default Notifications;
