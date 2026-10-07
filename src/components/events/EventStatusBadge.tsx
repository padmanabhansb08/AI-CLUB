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
  let bg = 'bg-[#FAF9F6] text-[#111111] border-[rgba(17,17,17,0.1)]';
  let Icon = FileText;

  switch (norm) {
    case 'draft':
      label = 'Draft';
      bg = 'bg-stone-100 text-stone-700 border-stone-200';
      Icon = FileText;
      break;
    case 'published':
      label = 'Published';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'cancelled':
      label = 'Cancelled';
      bg = 'bg-rose-50 text-rose-800 border-rose-200';
      Icon = XCircle;
      break;
    case 'completed':
      label = 'Completed';
      bg = 'bg-blue-50 text-blue-800 border-blue-200';
      Icon = CheckCircle2;
      break;
    case 'open':
      label = 'Registration Open';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      Icon = Unlock;
      break;
    case 'closed':
      label = 'Registration Closed';
      bg = 'bg-[#FAF9F6] text-[#66645F] border-[rgba(17,17,17,0.1)]';
      Icon = Lock;
      break;
    case 'full':
      label = 'Event Full';
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      Icon = Users;
      break;
    case 'registered':
      label = 'Registered';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'attended':
      label = 'Attended';
      bg = 'bg-indigo-50 text-indigo-800 border-indigo-200';
      Icon = CheckCircle2;
      break;
    case 'no_show':
      label = 'No Show';
      bg = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = XCircle;
      break;
    case 'waitlisted':
      label = 'Waitlisted';
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
      Icon = Clock;
      break;
    case 'present':
      label = 'Present';
      bg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      Icon = CheckCircle2;
      break;
    case 'absent':
      label = 'Absent';
      bg = 'bg-rose-50 text-rose-800 border-rose-200';
      Icon = XCircle;
      break;
    case 'late':
      label = 'Late';
      bg = 'bg-amber-50 text-amber-800 border-amber-200';
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
