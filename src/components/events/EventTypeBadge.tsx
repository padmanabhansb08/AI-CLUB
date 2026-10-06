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

  let colorClass = 'bg-gray-800 text-gray-300 border-gray-700';
  let Icon = Tag;

  switch (norm) {
    case 'WORKSHOP':
      colorClass = 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      Icon = Laptop;
      break;
    case 'WEBINAR':
      colorClass = 'bg-sky-950/60 text-sky-300 border-sky-800/60';
      Icon = Video;
      break;
    case 'HACKATHON':
      colorClass = 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      Icon = Code2;
      break;
    case 'COMPETITION':
      colorClass = 'bg-rose-950/60 text-rose-300 border-rose-800/60';
      Icon = Trophy;
      break;
    case 'MEETUP':
      colorClass = 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60';
      Icon = Users;
      break;
    case 'BOOTCAMP':
      colorClass = 'bg-fuchsia-950/60 text-fuchsia-300 border-fuchsia-800/60';
      Icon = Flame;
      break;
    case 'SEMINAR':
      colorClass = 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      Icon = GraduationCap;
      break;
    case 'GUEST_LECTURE':
      colorClass = 'bg-teal-950/60 text-teal-300 border-teal-800/60';
      Icon = Mic2;
      break;
    case 'CLUB_MEETING':
      colorClass = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
      Icon = Compass;
      break;
    default:
      colorClass = 'bg-zinc-800/80 text-zinc-300 border-zinc-700/60';
      Icon = Tag;
      break;
  }

  const paddingClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tracking-wide uppercase rounded-md border ${paddingClass} ${colorClass}`}
    >
      <Icon size={iconSize} className="shrink-0" />
      <span>{type}</span>
    </span>
  );
};
