import { useState, useEffect, useCallback } from 'react';
import { membersApi } from '../api/members.api';
import type { PublicMember, MembersPagination } from '../types/member';

export function useMembers() {
  const [members, setMembers] = useState<PublicMember[]>([]);
  const [pagination, setPagination] = useState<MembersPagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [page, setPage] = useState(1);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await membersApi.getPublicMembers(page, 12, search, department);
      setMembers(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load member directory');
    } finally {
      setLoading(false);
    }
  }, [page, search, department]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    pagination,
    loading,
    error,
    search,
    setSearch: (val: string) => {
      setSearch(val);
      setPage(1);
    },
    department,
    setDepartment: (val: string) => {
      setDepartment(val);
      setPage(1);
    },
    page,
    setPage,
    retry: fetchMembers,
  };
}
