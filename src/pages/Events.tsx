import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../services/content/eventService';
import type { EventType } from '../services/content/eventService';
import { StateView } from '../components/common/StateView';
import { Calendar, MapPin, Clock } from 'lucide-react';
import '../projects.css'; // Reuse some CSS if possible, but we can just use inline classes

export default function Events() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await eventService.getEvents(1, 50, { upcoming: true });
      setEvents(data.data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="content-container">
      <header className="page-header">
        <div>
          <h1>Upcoming Events</h1>
          <p>Join workshops, hackathons, and club meetups.</p>
        </div>
      </header>

      <StateView
        loading={loading}
        error={error}
        empty={events.length === 0}
        emptyMessage="No upcoming events found."
        retry={loadEvents}
      >
        <div className="grid" style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {events.map((event) => {
            const dateStr = new Date(event.start_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = new Date(event.start_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
            
            return (
              <Link to={`/events/${event.id}`} key={event.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', background: 'var(--primary)', color: 'var(--bg)', borderRadius: '999px' }}>
                      {event.event_type}
                    </span>
                    {event.status === 'cancelled' && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--error)' }}>CANCELLED</span>
                    )}
                  </div>
                  
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{event.title}</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={16} />
                      <span>{dateStr}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} />
                      <span>{timeStr}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={16} />
                      <span>{event.location || event.meeting_url || 'TBA'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </StateView>
    </div>
  );
}
