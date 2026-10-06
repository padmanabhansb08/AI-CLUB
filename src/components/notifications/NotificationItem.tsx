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

  const getIconContainerStyle = () => {
    switch (notification.type) {
      case 'ACHIEVEMENT_EARNED':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'EVENT_REGISTRATION_CONFIRMED':
      case 'EVENT_CANCELLED':
      case 'EVENT_REMINDER':
      case 'EVENT_COMPLETED':
        return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
      case 'COURSE_ENROLLED':
      case 'COURSE_COMPLETED':
      case 'COURSE_MILESTONE':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'PROJECT_JOIN_REQUEST':
      case 'PROJECT_JOIN_APPROVED':
      case 'PROJECT_JOIN_REJECTED':
      case 'PROJECT_INVITATION':
        return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400';
      case 'TEAM_INVITATION':
      case 'TEAM_INVITATION_ACCEPTED':
      case 'TEAM_MEMBER_ADDED':
      case 'TEAM_MEMBER_REMOVED':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'SYSTEM_ANNOUNCEMENT':
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`notification-item-card flex items-start gap-3.5 p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
        isUnread
          ? 'bg-[#121927] border-white/10 border-l-4 border-l-blue-500 hover:border-white/20 shadow-sm'
          : 'bg-[#0d131f] border-white/5 opacity-85 hover:opacity-100 hover:bg-[#121927]/60'
      }`}
      style={{
        margin: '6px 0',
      }}
    >
      <div className={`notification-icon-wrapper p-2.5 rounded-xl border shrink-0 mt-0.5 ${getIconContainerStyle()}`}>
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
          <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center gap-2">
            <span className="truncate">{notification.title}</span>
            {isUnread && (
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 shrink-0" title="Unread" />
            )}
          </h4>
          <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
            <Clock size={11} />
            {formatTime(notification.created_at)}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed break-words">
          {notification.message}
        </p>

        {notification.priority && notification.priority !== 'NORMAL' && (
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium uppercase tracking-wider ${
                notification.priority === 'CRITICAL'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {notification.priority}
            </span>
          </div>
        )}
      </div>

      {isUnread && onMarkAsRead && (
        <button
          className="mark-read-btn w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-white/10 transition-colors shrink-0 ml-1"
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
          title="Mark as read"
          aria-label="Mark notification as read"
        >
          <Check size={15} />
        </button>
      )}
    </div>
  );
};
