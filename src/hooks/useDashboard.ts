import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/dashboard.api';
import type { DashboardData } from '../types/dashboard';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getDashboardData();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    retry: fetchDashboard,
  };
}
