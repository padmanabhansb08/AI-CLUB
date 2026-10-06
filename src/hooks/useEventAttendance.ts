import { useState, useCallback } from 'react';
import { eventsApi } from '../api/events.api';
import type { EventAttendanceData, AttendanceStatus } from '../types/events';

export function useEventAttendance(eventId?: string) {
  const [attendanceData, setAttendanceData] = useState<EventAttendanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async (id?: string) => {
    const targetId = id || eventId;
    if (!targetId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getAttendance(targetId);
      setAttendanceData(data);
      return data;
    } catch (err: any) {
      const msg = err.message || 'Failed to load attendance';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const markAttendance = useCallback(
    async (records: Array<{ memberId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' }>, id?: string) => {
      const targetId = id || eventId;
      if (!targetId) return;
      try {
        setLoading(true);
        setError(null);
        await eventsApi.markAttendance(targetId, records);
        await fetchAttendance(targetId);
      } catch (err: any) {
        const msg = err.message || 'Failed to mark attendance';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [eventId, fetchAttendance]
  );

  const bulkMarkAttendance = useCallback(
    async (memberIds: string[], status: 'PRESENT' | 'ABSENT' | 'LATE', id?: string) => {
      const targetId = id || eventId;
      if (!targetId) return;
      try {
        setLoading(true);
        setError(null);
        await eventsApi.bulkMarkAttendance(targetId, memberIds, status);
        await fetchAttendance(targetId);
      } catch (err: any) {
        const msg = err.message || 'Failed to bulk mark attendance';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [eventId, fetchAttendance]
  );

  const checkIn = useCallback(
    async (memberId: string, status: AttendanceStatus = 'PRESENT', id?: string) => {
      const targetId = id || eventId;
      if (!targetId) return;
      try {
        setLoading(true);
        setError(null);
        await eventsApi.checkIn(targetId, memberId, status as any);
        await fetchAttendance(targetId);
      } catch (err: any) {
        const msg = err.message || 'Check-in failed';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [eventId, fetchAttendance]
  );

  return {
    attendanceData,
    loading,
    error,
    fetchAttendance,
    markAttendance,
    bulkMarkAttendance,
    checkIn,
  };
}
