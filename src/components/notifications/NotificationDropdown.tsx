import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Settings, ExternalLink, Loader2 } from 'lucide-react';
import { NotificationItem } from './NotificationItem';
import type { NotificationItem as NotificationItemType } from '../../types/notifications';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItemType[];
  unreadCount: number;
  loading: boolean;
  error?: string;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      role="region"
      aria-label="Recent notifications"
      className="notification-dropdown absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border border-white/10"
      style={{
        backgroundColor: '#121624',
        backdropFilter: 'blur(20px)',
        maxHeight: '520px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-cyan-400" />
          <span className="font-semibold text-sm text-white">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white/5"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span>Read all</span>
            </button>
          )}
          <button
            onClick={() => {
              onClose();
              navigate('/notifications');
            }}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
            title="Notification Center & Preferences"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto flex-1 p-2 space-y-1 divide-y divide-white/5 max-h-[380px]">
        {error ? <p className="p-4 text-sm text-red-700" role="alert">{error}</p> : loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400">
            <Loader2 size={24} className="animate-spin text-cyan-400 mb-2" />
            <span className="text-xs">Loading notifications...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-400 px-4 text-center">
            <Bell size={28} className="opacity-30 mb-2 text-cyan-400" />
            <p className="text-xs font-medium text-gray-300">All caught up!</p>
            <p className="text-[11px] text-gray-500 mt-0.5">
              You have no new notifications right now.
            </p>
          </div>
        ) : (
          notifications.slice(0, 8).map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onMarkAsRead={onMarkAsRead}
              onCloseDropdown={onClose}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-white/10 bg-white/[0.02] text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-cyan-500/10"
        >
          <span>View Notification Center</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
};
