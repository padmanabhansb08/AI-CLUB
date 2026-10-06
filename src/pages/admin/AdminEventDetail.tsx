import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  AlertCircle 
} from 'lucide-react';
import { eventsApi } from '../../api/events.api';
import type { EventItem, AttendanceStatus } from '../../types/events';
import { useEventAttendance } from '../../hooks/useEventAttendance';
import { EventStatusBadge } from '../../components/events/EventStatusBadge';
import { EventTypeBadge } from '../../components/events/EventTypeBadge';
import { RegistrationStats } from '../../components/events/RegistrationStats';
import { AttendeeTable } from '../../components/events/AttendeeTable';
import { EventForm } from '../../components/events/EventForm';

export function AdminEventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState<string | null>(null);

  // Form modal
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    attendanceData,
    loading: attendanceLoading,
    fetchAttendance,
    markAttendance,
    bulkMarkAttendance,
  } = useEventAttendance(id);

  const loadEvent = async (eventId: string) => {
    try {
      setEventLoading(true);
      setEventError(null);
      const data = await eventsApi.getAdminEventById(eventId);
      setEvent(data);
    } catch (err: any) {
      setEventError(err.message || 'Failed to load event');
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadEvent(id);
      fetchAttendance(id);
    }
  }, [id, fetchAttendance]);

  const handleEditSubmit = async (data: any) => {
    if (!id) return;
    await eventsApi.updateEvent(id, data);
    await loadEvent(id);
  };

  const handlePublish = async () => {
    if (!id) return;
    try {
      await eventsApi.publishEvent(id);
      await loadEvent(id);
      await fetchAttendance(id);
    } catch (err: any) {
      alert(err.message || 'Failed to publish event');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    const reason = prompt('Reason for cancelling this event:');
    if (!reason || !reason.trim()) return;
    try {
      await eventsApi.cancelEvent(id, reason.trim());
      await loadEvent(id);
      await fetchAttendance(id);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel event');
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    if (!confirm('Mark this event as COMPLETED?')) return;
    try {
      await eventsApi.completeEvent(id, true);
      await loadEvent(id);
      await fetchAttendance(id);
    } catch (err: any) {
      alert(err.message || 'Failed to complete event');
    }
  };

  const handleMarkSingle = async (memberId: string, status: AttendanceStatus) => {
    if (!id) return;
    await markAttendance([{ memberId, status: status as 'PRESENT' | 'ABSENT' | 'LATE' }]);
  };

  const handleMarkBulk = async (memberIds: string[], status: AttendanceStatus) => {
    if (!id) return;
    await bulkMarkAttendance(memberIds, status as 'PRESENT' | 'ABSENT' | 'LATE');
  };

  if (eventLoading && !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-96 rounded-3xl bg-zinc-900/40 border border-zinc-800 animate-pulse" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle size={40} className="mx-auto text-rose-500" />
        <h2 className="text-xl font-bold text-zinc-100">Event Not Found</h2>
        <p className="text-sm text-zinc-400">{eventError || 'The requested event does not exist.'}</p>
        <Link
          to="/admin/events"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-200"
        >
          <ArrowLeft size={14} /> Back to Admin Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_at);
  const endDate = new Date(event.end_at);
  const dateStr = startDate.toLocaleDateString('en-IN', {
    weekday: 'short',
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Top Nav & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/admin/events')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-emerald-400 transition-colors mb-2"
          >
            <ArrowLeft size={14} /> Back to Events List
          </button>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100">{event.title}</h1>
            <EventStatusBadge status={event.status} />
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <Edit3 size={14} />
            <span>Edit Event</span>
          </button>

          {event.status === 'draft' && (
            <button
              onClick={handlePublish}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <CheckCircle size={14} />
              <span>Publish Event</span>
            </button>
          )}

          {event.status === 'published' && (
            <>
              <button
                onClick={handleComplete}
                className="px-3.5 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-600/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Clock size={14} />
                <span>Mark Completed</span>
              </button>

              <button
                onClick={handleCancel}
                className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-600/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <XCircle size={14} />
                <span>Cancel Event</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Cancellation Notice if cancelled */}
      {event.status === 'cancelled' && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 text-xs text-rose-300 space-y-1">
          <div className="font-bold text-rose-400 flex items-center gap-1.5">
            <AlertCircle size={15} />
            <span>Event Cancelled</span>
          </div>
          {event.cancellation_reason && (
            <p className="text-zinc-300 pl-5">
              Reason: <em>{event.cancellation_reason}</em>
            </p>
          )}
        </div>
      )}

      {/* Event Overview Info Card */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <EventTypeBadge type={event.event_type} />
          {event.organizer && (
            <span className="text-zinc-400">
              Organizer: <strong className="text-zinc-200">{event.organizer}</strong>
            </span>
          )}
        </div>

        <p className="text-xs md:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {event.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-zinc-800/80 text-xs text-zinc-300">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-emerald-400 shrink-0" />
            <span>{dateStr}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock size={15} className="text-emerald-400 shrink-0" />
            <span>{timeStr}</span>
          </div>

          <div className="flex items-center gap-2">
            {event.location ? (
              <>
                <MapPin size={15} className="text-emerald-400 shrink-0" />
                <span className="truncate">{event.location}</span>
              </>
            ) : event.meeting_url ? (
              <>
                <Globe size={15} className="text-cyan-400 shrink-0" />
                <a
                  href={event.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline truncate"
                >
                  Virtual Link
                </a>
              </>
            ) : (
              <span className="text-zinc-500 italic">Venue TBA</span>
            )}
          </div>
        </div>
      </div>

      {/* Live Registration & Attendance Statistics */}
      {attendanceData && <RegistrationStats stats={attendanceData.stats} />}

      {/* Attendance & Registration Management Section */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-100">
              Attendees & Attendance Tracking
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Review registered students, record check-ins, and bulk-mark attendance.
            </p>
          </div>

          {event.status === 'draft' && (
            <span className="text-xs text-amber-400 font-medium">
              Publish event to begin recording attendance
            </span>
          )}
        </div>

        {attendanceData && (
          <AttendeeTable
            attendees={attendanceData.attendees}
            onMarkSingle={handleMarkSingle}
            onMarkBulk={handleMarkBulk}
            loading={attendanceLoading}
          />
        )}
      </div>

      {/* Edit Event Form Modal */}
      {isEditOpen && (
        <EventForm
          isOpen={isEditOpen}
          initialData={event}
          title="Edit Event"
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
}
