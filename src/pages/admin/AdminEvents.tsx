import { confirmAction } from '../../services/confirmation';
import { notifyError } from '../../services/actionFeedback';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Clock, 
  Edit3, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { eventsApi, type EventFilterParams } from '../../api/events.api';
import type { EventItem } from '../../types/events';
import { EventStatusBadge } from '../../components/events/EventStatusBadge';
import { EventTypeBadge } from '../../components/events/EventTypeBadge';
import { EventForm } from '../../components/events/EventForm';

export function AdminEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: EventFilterParams = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        status: selectedStatus || undefined,
        sortBy: 'start_at',
        sortOrder: 'asc',
      };
      const res = await eventsApi.getAdminEvents(params);
      setEvents(res.data);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages);
        setTotalCount(res.pagination.total);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, search, selectedStatus]);

  const handleCreateSubmit = async (data: any, shouldPublish = false) => {
    if (editingEvent) {
      await eventsApi.updateEvent(editingEvent.id, data);
      if (shouldPublish && editingEvent.status === 'draft') {
        await eventsApi.publishEvent(editingEvent.id);
      }
    } else {
      const created = await eventsApi.createEvent(data);
      if (shouldPublish) {
        await eventsApi.publishEvent(created.id);
      }
    }
    await fetchEvents();
  };

  const handlePublish = async (id: string) => {
    try {
      await eventsApi.publishEvent(id);
      await fetchEvents();
    } catch (err: any) {
      notifyError(err.message || 'Failed to publish event');
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Please provide a reason for cancelling this event:');
    if (!reason || !reason.trim()) return;
    try {
      await eventsApi.cancelEvent(id, reason.trim());
      await fetchEvents();
    } catch (err: any) {
      notifyError(err.message || 'Failed to cancel event');
    }
  };

  const handleComplete = async (id: string) => {
    if (!await confirmAction('Mark this event as COMPLETED?')) return;
    try {
      await eventsApi.completeEvent(id, true);
      await fetchEvents();
    } catch (err: any) {
      notifyError(err.message || 'Failed to mark event as completed');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-1">
            <Sparkles size={12} />
            <span>Admin Event Operations</span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100">Events Management</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create, schedule, publish, track registrations, and record attendance for club events.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-emerald-950/40"
        >
          <Plus size={16} />
          <span>Create Event</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search events by title, description..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
            <Filter size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Events Table */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse" />
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-zinc-800 bg-zinc-900/30 text-zinc-400">
          <Calendar size={32} className="mx-auto text-zinc-600 mb-2" />
          <p className="text-sm font-semibold text-zinc-300">No events found</p>
          <p className="text-xs text-zinc-500 mt-1">Click "Create Event" to schedule a new club session.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-800/50 text-zinc-400 uppercase text-[11px] font-semibold tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-4">Event</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Registrations</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {events.map((event) => {
                  const startDate = new Date(event.start_at);
                  const dateStr = startDate.toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });
                  const timeStr = startDate.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  const regCount = Number(event.registration_count || 0);
                  const capacity = event.capacity;

                  return (
                    <tr key={event.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="p-4">
                        <Link
                          to={`/admin/events/${event.id}`}
                          className="font-semibold text-zinc-100 hover:text-emerald-400 transition-colors text-sm block"
                        >
                          {event.title}
                        </Link>
                        <span className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {event.location || event.meeting_url || 'Online/TBA'}
                        </span>
                      </td>

                      <td className="p-4">
                        <EventTypeBadge type={event.event_type} />
                      </td>

                      <td className="p-4">
                        <div className="text-zinc-200 font-medium">{dateStr}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{timeStr}</div>
                      </td>

                      <td className="p-4">
                        <EventStatusBadge status={event.status} />
                      </td>

                      <td className="p-4">
                        <span className="font-mono font-semibold text-zinc-200">{regCount}</span>
                        {capacity ? (
                          <span className="text-zinc-500 font-mono"> / {capacity}</span>
                        ) : (
                          <span className="text-zinc-500 text-[11px]"> (unlimited)</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Manage link */}
                          <Link
                            to={`/admin/events/${event.id}`}
                            className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Manage Attendees & Attendance"
                          >
                            <span>Manage</span>
                            <ExternalLink size={12} />
                          </Link>

                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setEditingEvent(event);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
                            title="Edit Event"
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* Publish button if draft */}
                          {event.status === 'draft' && (
                            <button
                              onClick={() => handlePublish(event.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-600/40 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Publish Event"
                            >
                              <CheckCircle size={12} />
                              <span>Publish</span>
                            </button>
                          )}

                          {/* Cancel button if published */}
                          {event.status === 'published' && (
                            <button
                              onClick={() => handleCancel(event.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-600/40 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Cancel Event"
                            >
                              <XCircle size={12} />
                              <span>Cancel</span>
                            </button>
                          )}

                          {/* Complete button if published */}
                          {event.status === 'published' && (
                            <button
                              onClick={() => handleComplete(event.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-600/40 text-xs font-semibold transition-colors flex items-center gap-1"
                              title="Complete Event"
                            >
                              <Clock size={12} />
                              <span>Complete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800 text-xs text-zinc-400">
              <span>Total {totalCount} events</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Form Modal */}
      {isFormOpen && (
        <EventForm
          isOpen={isFormOpen}
          initialData={editingEvent || undefined}
          title={editingEvent ? 'Edit Event' : 'Create New Event'}
          onClose={() => {
            setIsFormOpen(false);
            setEditingEvent(null);
          }}
          onSubmit={handleCreateSubmit}
        />
      )}
    </div>
  );
}
