import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventService } from '../services/content/eventService';
import type { EventType } from '../services/content/eventService';
import { StateView } from '../components/common/StateView';
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) loadEvent(id);
  }, [id]);

  async function loadEvent(eventId: string) {
    try {
      setLoading(true);
      const data = await eventService.getEventById(eventId);
      setEvent(data);
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  const handleRegister = async () => {
    if (!event) return;
    try {
      setActionLoading(true);
      await eventService.register(event.id);
      await loadEvent(event.id); // Reload to get updated state
    } catch (err: any) {
      alert(err.message || 'Failed to register');
    } finally {
      setActionLoading(false);
    }
  };

  if (!event && loading) return <StateView loading={true} error={null}><div/></StateView>;
  if (error) return <StateView loading={false} error={error} retry={() => id && loadEvent(id)}><div/></StateView>;
  if (!event) return <StateView loading={false} error={null} empty={true} emptyMessage="Event not found"><div/></StateView>;

  const dateStr = new Date(event.start_at).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = `${new Date(event.start_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.end_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;

  const isRegistered = event.currentStudentRegistrationStatus === 'registered';
  const isFull = event.capacity && parseInt(event.registration_count as string || '0') >= event.capacity;
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';
  
  let actionButton = null;

  if (isCancelled) {
    actionButton = <Button disabled>Cancelled</Button>;
  } else if (isCompleted) {
    actionButton = <Button disabled>Completed</Button>;
  } else if (isRegistered) {
    actionButton = <Button disabled variant="secondary">Registered</Button>;
  } else if (isFull) {
    actionButton = <Button disabled>Full</Button>;
  } else {
    actionButton = <Button onClick={handleRegister} isLoading={actionLoading}>Register</Button>;
  }

  return (
    <div className="content-container" style={{ maxWidth: '800px' }}>
      <button 
        onClick={() => navigate('/events')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '2rem' }}
      >
        <ArrowLeft size={16} /> Back to Events
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0.25rem 0.75rem', background: 'var(--primary)', color: 'var(--bg)', borderRadius: '999px', display: 'inline-block', marginBottom: '1rem' }}>
          {event.event_type}
        </span>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 1rem 0' }}>{event.title}</h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Calendar size={18} /> <span>{dateStr}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={18} /> <span>{timeStr}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={18} /> <span>{event.location || event.meeting_url || 'Location TBA'}</span>
          </div>
          {event.organizer && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={18} /> <span>Organizer: {event.organizer}</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '2rem' }}>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>About this Event</h2>
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text)' }}>
          {event.description}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div>
          {event.capacity ? (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Registration: {event.registration_count || 0} / {event.capacity}
            </div>
          ) : (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Registration Open
            </div>
          )}
        </div>
        <div>
          {actionButton}
        </div>
      </div>
    </div>
  );
}
