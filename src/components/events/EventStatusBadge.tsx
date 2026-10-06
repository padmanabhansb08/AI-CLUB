import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  Unlock, 
  Users 
} from 'lucide-react';
import type { EventStatus, RegistrationStatus } from '../../types/events';

interface EventStatusBadgeProps {
  status: EventStatus | RegistrationStatus | string;
  size?: 'sm' | 'md';
}

export const EventStatusBadge: React.FC<EventStatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = (status || '').toLowerCase();

  let label = status.toUpperCase();
  let bg = 'bg-gray-800 text-gray-300 border-gray-700';
  let Icon = FileText;

  switch (norm) {
    case 'draft':
      label = 'Draft';
      bg = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
      Icon = FileText;
      break;
    case 'published':
      label = 'Published';
      bg = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      Icon = CheckCircle2;
      break;
    case 'cancelled':
      label = 'Cancelled';
      bg = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
      Icon = XCircle;
      break;
    case 'completed':
      label = 'Completed';
      bg = 'bg-blue-950/60 text-blue-400 border-blue-800/60';
      Icon = CheckCircle2;
      break;
    case 'open':
      label = 'Registration Open';
      bg = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60';
      Icon = Unlock;
      break;
    case 'closed':
      label = 'Registration Closed';
      bg = 'bg-gray-800/80 text-gray-400 border-gray-700/60';
      Icon = Lock;
      break;
    case 'full':
      label = 'Event Full';
      bg = 'bg-amber-950/60 text-amber-400 border-amber-800/60';
      Icon = Users;
      break;
    case 'registered':
      label = 'Registered';
      bg = 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60';
      Icon = CheckCircle2;
      break;
    case 'attended':
      label = 'Attended';
      bg = 'bg-indigo-950/60 text-indigo-300 border-indigo-700/60';
      Icon = CheckCircle2;
      break;
    case 'no_show':
      label = 'No Show';
      bg = 'bg-rose-950/40 text-rose-400 border-rose-800/40';
      Icon = XCircle;
      break;
    case 'waitlisted':
      label = 'Waitlisted';
      bg = 'bg-amber-950/40 text-amber-300 border-amber-700/40';
      Icon = Clock;
      break;
    case 'present':
      label = 'Present';
      bg = 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60';
      Icon = CheckCircle2;
      break;
    case 'absent':
      label = 'Absent';
      bg = 'bg-rose-950/60 text-rose-400 border-rose-800/60';
      Icon = XCircle;
      break;
    case 'late':
      label = 'Late';
      bg = 'bg-amber-950/60 text-amber-300 border-amber-700/60';
      Icon = Clock;
      break;
    default:
      label = status;
      break;
  }

  const paddingClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${paddingClass} ${bg}`}
      title={label}
    >
      <Icon size={iconSize} className="shrink-0" />
      <span>{label}</span>
    </span>
  );
};
