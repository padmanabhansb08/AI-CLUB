import React from 'react';
import { 
  Laptop, 
  Video, 
  Code2, 
  Trophy, 
  Users, 
  Flame, 
  GraduationCap, 
  Mic2, 
  Compass,
  Tag
} from 'lucide-react';

interface EventTypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export const EventTypeBadge: React.FC<EventTypeBadgeProps> = ({ type, size = 'sm' }) => {
  const norm = (type || '').toUpperCase();

  let colorClass = 'bg-[#FAF9F6] text-[#111111] border-[rgba(17,17,17,0.1)]';
  let Icon = Tag;

  switch (norm) {
    case 'WORKSHOP':
      colorClass = 'bg-purple-50 text-purple-700 border-purple-200';
      Icon = Laptop;
      break;
    case 'WEBINAR':
      colorClass = 'bg-sky-50 text-sky-700 border-sky-200';
      Icon = Video;
      break;
    case 'HACKATHON':
      colorClass = 'bg-amber-50 text-amber-800 border-amber-200';
      Icon = Code2;
      break;
    case 'COMPETITION':
      colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
      Icon = Trophy;
      break;
    case 'MEETUP':
      colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      Icon = Users;
      break;
    case 'BOOTCAMP':
      colorClass = 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
      Icon = Flame;
      break;
    case 'SEMINAR':
      colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
      Icon = GraduationCap;
      break;
    case 'GUEST_LECTURE':
      colorClass = 'bg-teal-50 text-teal-700 border-teal-200';
      Icon = Mic2;
      break;
    case 'CLUB_MEETING':
      colorClass = 'bg-stone-100 text-stone-700 border-stone-200';
      Icon = Compass;
      break;
    default:
      colorClass = 'bg-[#FAF9F6] text-[#111111] border-[rgba(17,17,17,0.1)]';
      Icon = Tag;
      break;
  }

  const paddingClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tracking-wide uppercase rounded-full border ${paddingClass} ${colorClass}`}
    >
      <Icon size={iconSize} className="shrink-0" />
      <span>{type}</span>
    </span>
  );
};
