import { confirmAction } from '../services/confirmation';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  Users, 
  ArrowLeft, 
  AlertCircle, 
  UserCheck, 
  Sparkles 
} from 'lucide-react';
import { eventsApi } from '../api/events.api';
import type { EventItem } from '../types/events';
import { EventTypeBadge } from '../components/events/EventTypeBadge';
import { EventStatusBadge } from '../components/events/EventStatusBadge';
import { RegistrationButton } from '../components/events/RegistrationButton';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadEvent = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getEventById(eventId);
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEvent(id);
    }
  }, [id]);

  const handleRegister = async () => {
    if (!event) return;
    try {
      setActionLoading(true);
      setFeedback(null);
      await eventsApi.register(event.id);
      setFeedback({ type: 'success', message: 'Successfully registered for this event!' });
      await loadEvent(event.id);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Registration failed' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!event) return;
    if (!await confirmAction('Are you sure you want to cancel your registration?')) return;
    try {
      setActionLoading(true);
      setFeedback(null);
      await eventsApi.cancelRegistration(event.id, 'Student cancelled from event details page');
      setFeedback({ type: 'success', message: 'Registration cancelled successfully.' });
      await loadEvent(event.id);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Cancellation failed' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Loading Event...">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-96 rounded-2xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] animate-pulse" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout pageTitle="Event Not Found">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertCircle size={40} className="mx-auto text-rose-600" />
          <h2 className="text-xl font-bold text-[#111111]">Event Not Found</h2>
          <p className="text-sm text-[#66645F]">{error || 'The requested event could not be found.'}</p>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#050505] text-xs font-semibold text-[#FFFFFF] hover:bg-[#222222] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Events
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);
  const durationHours = Math.round(((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)) * 10) / 10;

  const dateStr = startDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
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
  const isRegistered = event.currentStudentRegistrationStatus === 'REGISTERED';
  const isAttended = event.currentStudentRegistrationStatus === 'ATTENDED';

  return (
    <DashboardLayout pageTitle={event.title}>
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Navigation breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#66645F] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back to Events</span>
          </button>

          <div className="flex items-center gap-2">
            {isRegistered && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Sparkles size={12} /> Registered
              </span>
            )}
            {isAttended && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <UserCheck size={12} /> Attended
              </span>
            )}
            <EventStatusBadge status={event.status} />
          </div>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <AlertCircle size={15} />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Cancelled Banner */}
        {event.status === 'cancelled' && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-rose-700">
              <AlertCircle size={15} />
              <span>This event has been cancelled by the organizers.</span>
            </div>
            {event.cancellation_reason && (
              <p className="text-rose-700/80 pl-5">
                Reason: <em>{event.cancellation_reason}</em>
              </p>
            )}
          </div>
        )}

        {/* Main Event Card */}
        <div className="rounded-3xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 space-y-6">
            {/* Top category & Organizer */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <EventTypeBadge type={event.event_type} />
              {event.organizer && (
                <span className="text-xs text-[#66645F] font-medium">
                  Organized by <strong className="text-[#111111]">{event.organizer}</strong>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#111111] tracking-tight leading-snug">
              {event.title}
            </h1>

            {/* Key metadata grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-[rgba(17,17,17,0.08)]">
              {/* Date */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)]">
                <Calendar size={18} className="text-[#111111] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#92908A] font-semibold block">
                    Date
                  </span>
                  <span className="text-xs font-semibold text-[#111111]">{dateStr}</span>
                </div>
              </div>

              {/* Time & Duration */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)]">
                <Clock size={18} className="text-[#111111] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#92908A] font-semibold block">
                    Time ({durationHours} hrs)
                  </span>
                  <span className="text-xs font-semibold text-[#111111]">{timeStr}</span>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)] sm:col-span-2 md:col-span-1">
                {event.location ? (
                  <>
                    <MapPin size={18} className="text-[#111111] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#92908A] font-semibold block">
                        Venue
                      </span>
                      <span className="text-xs font-semibold text-[#111111]">{event.location}</span>
                    </div>
                  </>
                ) : event.meeting_url ? (
                  <>
                    <Globe size={18} className="text-[#111111] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#92908A] font-semibold block">
                        Virtual Room
                      </span>
                      <a
                        href={event.meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#111111] underline truncate block"
                      >
                        Join Online Meeting
                      </a>
                    </div>
                  </>
                ) : (
                  <>
                    <MapPin size={18} className="text-[#92908A] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#92908A] font-semibold block">
                        Location
                      </span>
                      <span className="text-xs text-[#66645F] italic">Venue TBA</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="pt-4 border-t border-[rgba(17,17,17,0.08)] space-y-3">
              <h2 className="text-base font-bold text-[#111111]">About this Event</h2>
              <div className="prose max-w-none text-xs md:text-sm text-[#66645F] leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            {/* Registration Window Notice */}
            {(event.registration_open_at || event.registration_close_at) && (
              <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-xs text-[#66645F] space-y-1">
                <span className="font-semibold text-[#111111] uppercase tracking-wider text-[11px]">
                  Registration Window
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-1">
                  {event.registration_open_at && (
                    <span>
                      Opens: {new Date(event.registration_open_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  )}
                  {event.registration_close_at && (
                    <span>
                      Deadline: {new Date(event.registration_close_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Registration Status & CTA Bar */}
            <div className="pt-6 border-t border-[rgba(17,17,17,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                {capacity ? (
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-[#66645F] font-medium mb-1.5">
                      <Users size={14} className="text-[#92908A]" />
                      <span>
                        <strong className="text-[#111111]">{regCount}</strong> of {capacity} registered
                      </span>
                    </div>
                    <div className="w-48 h-2 rounded-full bg-[#EBE9E3] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          percentFull >= 100
                            ? 'bg-amber-600'
                            : percentFull >= 80
                            ? 'bg-amber-500'
                            : 'bg-[#050505]'
                        }`}
                        style={{ width: `${percentFull}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-[#66645F]">
                    <Users size={14} className="text-[#92908A]" />
                    <span>{regCount} students registered</span>
                  </div>
                )}
              </div>

              <RegistrationButton
                event={event}
                onRegister={handleRegister}
                onCancelRegistration={handleCancelRegistration}
                loading={actionLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
