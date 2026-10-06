import { useState, useEffect, useCallback } from 'react';
import { eventsApi } from '../api/events.api';
import type { EventItem } from '../types/events';

export function useEvent(id?: string, isAdmin = false) {
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const apiCall = isAdmin ? eventsApi.getAdminEventById : eventsApi.getEventById;
      const data = await apiCall(id);
      setEvent(data);
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to load event'));
    } finally {
      setLoading(false);
    }
  }, [id, isAdmin]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
  };
}
