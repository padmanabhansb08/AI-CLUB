import { useState, useEffect, useCallback } from 'react';
import { applicationApi, type MembershipApplication } from '../api/application.api';

export function useApplication() {
  const [application, setApplication] = useState<MembershipApplication | null>(null);
  const [latestAttempt, setLatestAttempt] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await applicationApi.getMyApplication();
      setApplication(res.application);
      setLatestAttempt(res.latestAttempt);
      return res;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const updateProfile = async (profileData: any) => {
    try {
      const res = await applicationApi.updateProfile(profileData);
      setApplication(res.application);
      return { success: true, data: res };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to update profile' };
    }
  };

  return {
    application,
    latestAttempt,
    loading,
    error,
    refresh: fetchApplication,
    updateProfile,
    isApproved: application?.status === 'APPROVED',
    isUnderReview: application?.status === 'UNDER_REVIEW',
    isTestRequired: application?.status === 'TEST_REQUIRED',
    isTestInProgress: application?.status === 'TEST_IN_PROGRESS',
  };
}
