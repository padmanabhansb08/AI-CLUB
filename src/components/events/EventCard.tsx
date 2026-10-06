import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Globe, ArrowRight } from 'lucide-react';
import { EventTypeBadge } from './EventTypeBadge';
import { EventStatusBadge } from './EventStatusBadge';
import type { EventItem } from '../../types/events';

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);

  const dateStr = startDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const timeStr = `${startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })} – ${endDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  const regCount = Number(event.registration_count || 0);
  const capacity = event.capacity ? Number(event.capacity) : null;
  const percentFull = capacity ? Math.min(100, Math.round((regCount / capacity) * 100)) : 0;

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900/80 p-5 md:p-6 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-black/40">
      <div>
        {/* Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <EventTypeBadge type={event.event_type} />
          <div className="flex items-center gap-1.5">
            {event.currentStudentRegistrationStatus === 'REGISTERED' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60">
                Registered
              </span>
            )}
            {event.currentStudentRegistrationStatus === 'ATTENDED' && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-700/60">
                Attended
              </span>
            )}
            {event.status !== 'published' && <EventStatusBadge status={event.status} />}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg md:text-xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
          {event.title}
        </h3>

        <p className="text-xs md:text-sm text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Details List */}
        <div className="space-y-2 text-xs md:text-sm text-zinc-300 pt-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-2 text-zinc-300">
            <Calendar size={15} className="text-emerald-400 shrink-0" />
            <span className="font-medium">{dateStr}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={15} className="text-zinc-500 shrink-0" />
            <span>{timeStr}</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-400">
            {event.location ? (
              <>
                <MapPin size={15} className="text-zinc-500 shrink-0" />
                <span className="truncate">{event.location}</span>
              </>
            ) : event.meeting_url ? (
              <>
                <Globe size={15} className="text-cyan-400 shrink-0" />
                <span className="truncate text-cyan-400/90 font-mono text-xs">Online Virtual Meeting</span>
              </>
            ) : (
              <>
                <MapPin size={15} className="text-zinc-600 shrink-0" />
                <span className="text-zinc-500 italic">Venue TBA</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Capacity + Action */}
      <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {capacity ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mb-1.5">
                <Users size={13} className="text-zinc-500" />
                <span>
                  <strong className="text-zinc-200">{regCount}</strong> / {capacity} registered
                </span>
              </div>
              <div className="w-28 md:w-32 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentFull >= 100
                      ? 'bg-amber-500'
                      : percentFull >= 80
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentFull}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Users size={13} className="text-zinc-500" />
              <span>{regCount} registered</span>
            </div>
          )}
        </div>

        <Link
          to={`/events/${event.id}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800/80 hover:bg-emerald-600 hover:text-black text-xs font-semibold text-zinc-200 border border-zinc-700/60 hover:border-emerald-500 transition-all group-hover:bg-zinc-800"
        >
          <span>View Details</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
