import { useState, useEffect, useCallback } from 'react';
import { eventsApi, type EventFilterParams } from '../api/events.api';
import type { EventItem } from '../types/events';

interface UseEventsOptions extends EventFilterParams {
  isAdmin?: boolean;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pagination, setPagination] = useState({
    page: options.page || 1,
    limit: options.limit || 12,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const apiCall = options.isAdmin ? eventsApi.getAdminEvents : eventsApi.getEvents;
      const res = await apiCall(options);
      setEvents(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
      setError(null);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err.message || 'Failed to load events'));
    } finally {
      setLoading(false);
    }
  }, [
    options.isAdmin,
    options.page,
    options.limit,
    options.eventType,
    options.status,
    options.search,
    options.upcoming,
    options.past,
    options.from,
    options.to,
    options.sortBy,
    options.sortOrder,
  ]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    pagination,
    loading,
    error,
    refetch: fetchEvents,
  };
}
