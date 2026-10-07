import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../api/profile.api';
import { useAuth } from '../context/AuthContext';
import type {
  MemberProfile,
  ProfileUpdatePayload,
  SkillItem,
  InterestItem,
} from '../types/profile';

export function useMemberProfile() {
  const { refreshUser } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [catalogSkills, setCatalogSkills] = useState<SkillItem[]>([]);
  const [catalogInterests, setCatalogInterests] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchProfileAndCatalogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prof, skills, interests] = await Promise.all([
        profileApi.getMyProfile(),
        profileApi.getCatalogSkills().catch(() => []),
        profileApi.getCatalogInterests().catch(() => []),
      ]);
      setProfile(prof);
      setCatalogSkills(skills);
      setCatalogInterests(interests);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndCatalogs();
  }, [fetchProfileAndCatalogs]);

  const updateProfile = async (payload: ProfileUpdatePayload): Promise<MemberProfile> => {
    try {
      setSaving(true);
      setSaveError(null);
      const updated = await profileApi.updateProfile(payload);
      setProfile(updated);
      await refreshUser();
      return updated;
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save profile changes');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    catalogSkills,
    catalogInterests,
    loading,
    error,
    saving,
    saveError,
    setSaveError,
    updateProfile,
    refresh: fetchProfileAndCatalogs,
  };
}
