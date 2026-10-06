import { useState, useCallback } from 'react';
import { eventsApi } from '../api/events.api';
import type { StudentRegistrationItem } from '../types/events';

export function useEventRegistration() {
  const [registrations, setRegistrations] = useState<StudentRegistrationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getMyRegistrations();
      setRegistrations(data);
      return data;
    } catch (err: any) {
      const msg = err.message || 'Failed to load registrations';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await eventsApi.register(eventId);
      return res;
    } catch (err: any) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (eventId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await eventsApi.cancelRegistration(eventId, reason);
      return res;
    } catch (err: any) {
      const msg = err.message || 'Cancellation failed';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    registrations,
    loading,
    error,
    fetchMyRegistrations,
    register,
    cancel,
  };
}
