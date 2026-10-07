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
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm hover:shadow-md hover:-translate-y-0.5 p-6 transition-all duration-300">
      <div>
        {/* Badges Header */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <EventTypeBadge type={event.event_type} />
          <div className="flex items-center gap-1.5">
            {event.currentStudentRegistrationStatus === 'REGISTERED' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Registered
              </span>
            )}
            {event.currentStudentRegistrationStatus === 'ATTENDED' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                Attended
              </span>
            )}
            {event.status !== 'published' && <EventStatusBadge status={event.status} />}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-lg md:text-xl font-bold text-[#111111] group-hover:text-black transition-colors line-clamp-2 mb-2">
          {event.title}
        </h3>

        <p className="text-xs md:text-sm text-[#66645F] line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>

        {/* Details List */}
        <div className="space-y-2 text-xs md:text-sm text-[#66645F] pt-3 border-t border-[rgba(17,17,17,0.06)]">
          <div className="flex items-center gap-2 text-[#111111]">
            <Calendar size={15} className="text-[#111111] shrink-0" />
            <span className="font-medium">{dateStr}</span>
          </div>

          <div className="flex items-center gap-2 text-[#66645F]">
            <Clock size={15} className="text-[#92908A] shrink-0" />
            <span>{timeStr}</span>
          </div>

          <div className="flex items-center gap-2 text-[#66645F]">
            {event.location ? (
              <>
                <MapPin size={15} className="text-[#92908A] shrink-0" />
                <span className="truncate">{event.location}</span>
              </>
            ) : event.meeting_url ? (
              <>
                <Globe size={15} className="text-[#111111] shrink-0" />
                <span className="truncate font-mono text-xs">Online Virtual Meeting</span>
              </>
            ) : (
              <>
                <MapPin size={15} className="text-[#92908A] shrink-0" />
                <span className="text-[#92908A] italic">Venue TBA</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Capacity + Action */}
      <div className="mt-5 pt-4 border-t border-[rgba(17,17,17,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          {capacity ? (
            <div>
              <div className="flex items-center gap-1.5 text-xs text-[#66645F] font-medium mb-1.5">
                <Users size={13} className="text-[#92908A]" />
                <span>
                  <strong className="text-[#111111]">{regCount}</strong> / {capacity} registered
                </span>
              </div>
              <div className="w-28 md:w-32 h-1.5 rounded-full bg-[#EBE9E3] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#050505] transition-all duration-500"
                  style={{ width: `${percentFull}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-[#66645F]">
              <Users size={13} className="text-[#92908A]" />
              <span>{regCount} registered</span>
            </div>
          )}
        </div>

        <Link
          to={`/events/${event.id}`}
          className="pill-btn inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold"
        >
          <span>View Details</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
