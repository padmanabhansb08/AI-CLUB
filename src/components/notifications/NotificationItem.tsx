import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Calendar,
  BookOpen,
  FolderGit2,
  Users,
  Megaphone,
  Check,
  Clock,
} from 'lucide-react';
import type { NotificationItem as NotificationItemType } from '../../types/notifications';

interface NotificationItemProps {
  notification: NotificationItemType;
  onMarkAsRead?: (id: string) => void;
  onCloseDropdown?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onCloseDropdown,
}) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (notification.type) {
      case 'ACHIEVEMENT_EARNED':
        return <Trophy size={18} className="text-amber-400" />;
      case 'EVENT_REGISTRATION_CONFIRMED':
      case 'EVENT_CANCELLED':
      case 'EVENT_REMINDER':
      case 'EVENT_COMPLETED':
        return <Calendar size={18} className="text-cyan-400" />;
      case 'COURSE_ENROLLED':
      case 'COURSE_COMPLETED':
      case 'COURSE_MILESTONE':
        return <BookOpen size={18} className="text-emerald-400" />;
      case 'PROJECT_JOIN_REQUEST':
      case 'PROJECT_JOIN_APPROVED':
      case 'PROJECT_JOIN_REJECTED':
      case 'PROJECT_INVITATION':
        return <FolderGit2 size={18} className="text-indigo-400" />;
      case 'TEAM_INVITATION':
      case 'TEAM_INVITATION_ACCEPTED':
      case 'TEAM_MEMBER_ADDED':
      case 'TEAM_MEMBER_REMOVED':
        return <Users size={18} className="text-purple-400" />;
      case 'SYSTEM_ANNOUNCEMENT':
      default:
        return <Megaphone size={18} className="text-blue-400" />;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If clicking the check button, don't navigate
    if ((e.target as HTMLElement).closest('.mark-read-btn')) return;

    if (!notification.read_at && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    if (onCloseDropdown) {
      onCloseDropdown();
    }

    // Determine target URL from notification data
    const d = notification.data || {};
    if (d.achievementId || notification.type === 'ACHIEVEMENT_EARNED') {
      navigate(d.achievementId ? `/achievements/${d.achievementId}` : '/achievements');
    } else if (d.eventId) {
      navigate(`/events/${d.eventId}`);
    } else if (d.courseId || d.courseSlug) {
      navigate(`/courses/${d.courseSlug || d.courseId}`);
    } else if (d.projectId || d.projectSlug) {
      navigate(`/projects/${d.projectSlug || d.projectId}`);
    } else if (notification.type === 'SYSTEM_ANNOUNCEMENT') {
      navigate('/notifications');
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const isUnread = !notification.read_at;

  return (
    <div
      onClick={handleClick}
      className={`notification-item-card flex items-start gap-3 p-3.5 rounded-xl cursor-pointer transition-all duration-200 border ${
        isUnread
          ? 'bg-[var(--bg-card)]/90 border-cyan-500/30 hover:border-cyan-500/60 shadow-sm'
          : 'bg-black/20 border-white/5 opacity-80 hover:opacity-100 hover:bg-white/[0.03]'
      }`}
      style={{
        margin: '6px 0',
      }}
    >
      <div className="notification-icon-wrapper p-2 rounded-lg bg-white/5 border border-white/10 shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-white truncate flex items-center gap-1.5">
            {notification.title}
            {isUnread && (
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 shrink-0" />
            )}
          </h4>
          <span className="text-[11px] text-gray-400 whitespace-nowrap flex items-center gap-1">
            <Clock size={11} />
            {formatTime(notification.created_at)}
          </span>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed break-words">
          {notification.message}
        </p>

        {notification.priority && notification.priority !== 'NORMAL' && (
          <div className="mt-1.5 flex items-center gap-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                notification.priority === 'CRITICAL'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {notification.priority}
            </span>
          </div>
        )}
      </div>

      {isUnread && onMarkAsRead && (
        <button
          className="mark-read-btn p-1.5 rounded-lg text-gray-400 hover:text-cyan-400 hover:bg-white/10 transition-colors shrink-0 ml-1"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          title="Mark as read"
        >
          <Check size={14} />
        </button>
      )}
    </div>
  );
};
