import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Globe, ArrowRight, XCircle, ArrowLeft } from 'lucide-react';
import { eventsApi } from '../api/events.api';
import type { StudentRegistrationItem } from '../types/events';
import { EventStatusBadge } from '../components/events/EventStatusBadge';
import { EventTypeBadge } from '../components/events/EventTypeBadge';

export default function MyEvents() {
  const [registrations, setRegistrations] = useState<StudentRegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'ATTENDED' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getMyRegistrations();
      setRegistrations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load registered events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel your registration for this event?')) return;
    try {
      setCancellingId(eventId);
      await eventsApi.cancelRegistration(eventId, 'Student cancelled from My Events');
      await fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();

  const filtered = registrations.filter((r) => {
    const isPast = new Date(r.end_at || r.start_at) < now;
    const isCancelled = r.registration_status === 'CANCELLED';
    const isAttended =
      r.registration_status === 'ATTENDED' ||
      r.attendance_status === 'PRESENT' ||
      r.attendance_status === 'LATE';

    if (activeTab === 'UPCOMING') return !isPast && !isCancelled;
    if (activeTab === 'ATTENDED') return isAttended;
    if (activeTab === 'PAST') return isPast && !isCancelled;
    if (activeTab === 'CANCELLED') return isCancelled;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/events"
              className="text-xs font-semibold text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Events Catalog
            </Link>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100">My Registered Events</h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Track your event registrations, check-in history, and attendance records.
          </p>
        </div>

        <Link
          to="/events"
          className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white transition-all self-start sm:self-auto"
        >
          Explore All Events
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 overflow-x-auto">
        {(['UPCOMING', 'ATTENDED', 'PAST', 'CANCELLED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-950/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
            }`}
          >
            {tab === 'UPCOMING'
              ? 'Upcoming'
              : tab === 'ATTENDED'
              ? 'Attended'
              : tab === 'PAST'
              ? 'Past Events'
              : tab === 'CANCELLED'
              ? 'Cancelled'
              : 'All History'}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30 text-zinc-400 space-y-3">
          <p className="text-sm font-medium">No registrations found in this category.</p>
          <p className="text-xs text-zinc-500">
            Browse upcoming workshops and hackathons in the club calendar!
          </p>
          <Link
            to="/events"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-colors"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => {
            const startDate = new Date(r.start_at);
            const endDate = new Date(r.end_at);
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
            const isUpcoming = startDate > now;
            const canCancel = isUpcoming && r.registration_status === 'REGISTERED';

            return (
              <div
                key={r.registration_id}
                className="flex flex-col justify-between p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900/80 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <EventTypeBadge type={r.event_type} />
                    <div className="flex items-center gap-1.5">
                      <EventStatusBadge status={r.registration_status} />
                      {r.attendance_status && r.attendance_status !== 'NOT_MARKED' && (
                        <EventStatusBadge status={r.attendance_status} />
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-zinc-100 hover:text-emerald-400 transition-colors">
                    <Link to={`/events/${r.id}`}>{r.title}</Link>
                  </h3>

                  <div className="space-y-1.5 text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-800/60">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Calendar size={14} className="text-emerald-400 shrink-0" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-zinc-500 shrink-0" />
                      <span>{timeStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.location ? (
                        <>
                          <MapPin size={14} className="text-zinc-500 shrink-0" />
                          <span className="truncate">{r.location}</span>
                        </>
                      ) : r.meeting_url ? (
                        <>
                          <Globe size={14} className="text-cyan-400 shrink-0" />
                          <span className="truncate text-cyan-400 font-mono">Virtual Meeting</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={14} className="text-zinc-600 shrink-0" />
                          <span className="text-zinc-500">Venue TBA</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80 text-xs">
                  <span className="text-zinc-500">
                    Registered {new Date(r.registered_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>

                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(r.id)}
                        disabled={cancellingId === r.id}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-700/60 hover:border-rose-800/60 transition-colors flex items-center gap-1 font-medium"
                      >
                        <XCircle size={13} />
                        <span>{cancellingId === r.id ? 'Cancelling...' : 'Cancel'}</span>
                      </button>
                    )}

                    <Link
                      to={`/events/${r.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-600 hover:text-black font-semibold text-zinc-200 border border-zinc-700/60 hover:border-emerald-500 transition-all flex items-center gap-1"
                    >
                      <span>View</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
