import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/content/eventService';
import type { EventType } from '../../services/content/eventService';
import { StateView } from '../../components/common/StateView';
import { Button } from '../../components/ui/Button';

export function AdminEventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventType | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id) loadData(id);
  }, [id]);

  async function loadData(eventId: string) {
    try {
      setLoading(true);
      const ev = await eventService.getAdminEventById(eventId);
      setEvent(ev);
      const regs = await eventService.getRegistrations(eventId);
      setRegistrations(regs);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (status: string) => {
    if (!event) return;
    try {
      await eventService.updateEvent(event.id, { status: status as any });
      await loadData(event.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(event.id);
      navigate('/admin/events');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!event && loading) return <StateView loading={true} error={null}><div/></StateView>;
  if (error) return <StateView loading={false} error={error} retry={() => id && loadData(id)}><div/></StateView>;
  if (!event) return <StateView loading={false} error={null} empty={true} emptyMessage="Event not found"><div/></StateView>;

  return (
    <div className="admin-container">
      <div className="admin-header" style={{ marginBottom: '2rem' }}>
        <div>
          <button onClick={() => navigate('/admin/events')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1rem' }}>
            ← Back to Events
          </button>
          <h1>{event.title}</h1>
          <p>Status: {event.status.toUpperCase()} | Registrations: {event.registration_count || 0}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {event.status === 'draft' && <Button onClick={() => handleUpdateStatus('published')}>Publish</Button>}
          {event.status === 'published' && <Button onClick={() => handleUpdateStatus('cancelled')} variant="secondary">Cancel Event</Button>}
          <Button onClick={handleDelete} variant="secondary" style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>Delete</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="admin-card">
          <h2>Event Details</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <strong>Type:</strong> {event.event_type}
            </div>
            <div>
              <strong>Start:</strong> {new Date(event.start_at).toLocaleString()}
            </div>
            <div>
              <strong>End:</strong> {new Date(event.end_at).toLocaleString()}
            </div>
            <div>
              <strong>Location:</strong> {event.location || event.meeting_url || 'N/A'}
            </div>
            <div>
              <strong>Description:</strong> 
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{event.description}</p>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2>Registrations ({registrations.length})</h2>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {registrations.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No registrations yet.</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Reg. No</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.full_name}</td>
                      <td>{r.register_number}</td>
                      <td>{new Date(r.registered_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
