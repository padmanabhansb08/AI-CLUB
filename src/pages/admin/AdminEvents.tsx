import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/content/eventService';
import type { EventType } from '../../services/content/eventService';
import { StateView } from '../../components/common/StateView';
import { Button } from '../../components/ui/Button';

export function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await eventService.getAdminEvents(1, 100);
      setEvents(data.data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    try {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const newEvent = await eventService.createEvent({
        title: 'New Event',
        description: 'New event description',
        event_type: 'Workshop',
        start_at: d.toISOString(),
        end_at: new Date(d.getTime() + 2 * 60 * 60 * 1000).toISOString(),
        status: 'draft',
      });
      navigate(`/admin/events/${newEvent.data.id}`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Events Management</h1>
        <Button onClick={handleCreate}>Create Event</Button>
      </div>

      <StateView
        loading={loading}
        error={error}
        empty={events.length === 0}
        emptyMessage="No events found."
        retry={loadEvents}
      >
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Registrations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td>{e.event_type}</td>
                  <td>{new Date(e.start_at).toLocaleDateString()}</td>
                  <td>
                    <span style={{ 
                      padding: '2px 8px', borderRadius: '4px', fontSize: '12px',
                      background: e.status === 'published' ? 'var(--primary)' : 'var(--surface-hover)',
                      color: e.status === 'published' ? 'var(--bg)' : 'var(--text)'
                    }}>
                      {e.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{e.registration_count || 0} {e.capacity ? `/ ${e.capacity}` : ''}</td>
                  <td>
                    <Link to={`/admin/events/${e.id}`}>
                      <Button variant="secondary">Manage</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StateView>
    </div>
  );
}
