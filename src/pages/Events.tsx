import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { eventsApi, type EventFilterParams } from '../api/events.api';
import type { EventItem, StudentRegistrationItem } from '../types/events';
import { EventCard } from '../components/events/EventCard';
import { EventFilters } from '../components/events/EventFilters';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<StudentRegistrationItem[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'all' | 'registered' | 'past'>('upcoming');
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load events based on filters and pagination
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === 'registered') {
          const myRegs = await eventsApi.getMyRegistrations();
          setRegisteredEvents(myRegs);
          setTotalEvents(myRegs.length);
          setTotalPages(1);
        } else {
          const params: EventFilterParams = {
            page,
            limit,
            search: search.trim() || undefined,
            eventType: selectedType || undefined,
          };

          if (activeTab === 'upcoming') {
            params.upcoming = true;
          } else if (activeTab === 'past') {
            params.past = true;
          }

          const res = await eventsApi.getEvents(params);
          setEvents(res.data);
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages);
            setTotalEvents(res.pagination.total);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [activeTab, search, selectedType, page, limit]);

  const handleTabChange = (tab: 'upcoming' | 'all' | 'registered' | 'past') => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleReset = () => {
    setSearch('');
    setSelectedType('');
    setPage(1);
  };

  return (
    <DashboardLayout pageTitle="Events & Gatherings">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-3xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(17,17,17,0.05)] border border-[rgba(17,17,17,0.1)] text-[#111111] text-xs font-semibold">
              <Sparkles size={13} />
              <span>AI CLUB Gatherings & Workshops</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-[#111111] tracking-tight">
              Community Seminars & Build Nights
            </h1>
            <p className="text-xs md:text-sm text-[#66645F] max-w-2xl leading-relaxed">
              Hands-on workshops, research reading groups, hackathons, and guest lectures hosted by AI CLUB members and mentors.
            </p>
          </div>

          <Link
            to="/events/my"
            className="self-start md:self-center px-5 py-2.5 rounded-full bg-[#050505] hover:bg-[#222222] text-[#FFFFFF] text-xs font-semibold transition-all flex items-center gap-2 shadow-sm"
          >
            <Bookmark size={14} className="text-[#FFFFFF]" />
            <span>My Registrations</span>
          </Link>
        </div>

        {/* Filters Bar */}
        <EventFilters
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          selectedType={selectedType}
          onTypeChange={(val) => {
            setSelectedType(val);
            setPage(1);
          }}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onReset={handleReset}
        />

        {/* Error state */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
            {error}
          </div>
        )}

        {/* Loading Grid Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-72 rounded-2xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] animate-pulse"
              />
            ))}
          </div>
        ) : activeTab === 'registered' ? (
          // Registered tab view
          registeredEvents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] text-[#66645F] space-y-3">
              <Calendar size={32} className="mx-auto text-[#92908A] mb-2" />
              <p className="text-base font-semibold text-[#111111]">No registered events yet</p>
              <p className="text-xs text-[#66645F] max-w-sm mx-auto">
                Find an upcoming event and click Register to reserve your seat!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {registeredEvents.map((item) => (
                <EventCard
                  key={item.registration_id}
                  event={{
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    event_type: item.event_type,
                    start_at: item.start_at,
                    end_at: item.end_at,
                    location: item.location,
                    meeting_url: item.meeting_url,
                    organizer: item.organizer,
                    status: item.event_status,
                    created_at: item.registered_at,
                    updated_at: item.registered_at,
                    registration_count: 0,
                    currentStudentRegistrationStatus: item.registration_status,
                    currentStudentAttendanceStatus: item.attendance_status,
                  }}
                />
              ))}
            </div>
          )
        ) : events.length === 0 ? (
          // Empty events view
          <div className="p-12 text-center rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] text-[#66645F] space-y-3">
            <Calendar size={32} className="mx-auto text-[#92908A] mb-2" />
            <p className="text-base font-semibold text-[#111111]">No events found</p>
            <p className="text-xs text-[#66645F] max-w-sm mx-auto">
              {search || selectedType
                ? 'Try modifying your search or filter criteria.'
                : 'Stay tuned! New events will be published shortly.'}
            </p>
            {(search || selectedType) && (
              <button
                onClick={handleReset}
                className="mt-2 px-4 py-2 rounded-full bg-[#050505] hover:bg-[#222222] text-xs font-semibold text-[#FFFFFF] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          // Standard Events Grid
          <>
            <div className="flex items-center justify-between text-xs text-[#66645F] px-1">
              <span>
                Showing <strong className="text-[#111111]">{events.length}</strong> of{' '}
                <strong className="text-[#111111]">{totalEvents}</strong> events
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6 border-t border-[rgba(17,17,17,0.08)]">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.2)] text-[#66645F] hover:text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-xs font-mono text-[#66645F] px-3">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.2)] text-[#66645F] hover:text-[#111111] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
