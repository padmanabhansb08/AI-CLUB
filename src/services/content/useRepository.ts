import { useEffect, useState } from 'react';
import { Repository } from './repository';
import { ApiError } from '../apiError';

export function useRepository<T extends { id: string }>(repo: Repository<T>) {
  const [data, setData] = useState<T[]>(repo.getAll());
  const [loading, setLoading] = useState<boolean>(repo.isLoading());
  const [error, setError] = useState<ApiError | null>(repo.getError());

  useEffect(() => {
    const unsubscribe = repo.subscribe(() => {
      setData([...repo.getAll()]);
      setLoading(repo.isLoading());
      setError(repo.getError());
    });
    repo.fetchData();
    return () => { unsubscribe(); };
  }, [repo]);

  return { data, loading, error, retry: repo.retry };
}
