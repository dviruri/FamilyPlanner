import { useState, useEffect } from 'react';
import { useFamily } from '../family/FamilyContext';
import { getTasks } from '../../services/tasksService';
import type { TaskRow } from '../../types/database';
import type { TaskFilters } from '../../services/tasksService';

export function useTasks(filters: TaskFilters = {}) {
  const { activeFamily } = useFamily();
  const [tasks, setTasks]     = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = () => setRefreshToken((t) => t + 1);

  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    if (!activeFamily) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    getTasks(activeFamily.id, filters)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        setTasks(data);
        setError(err);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFamily, filtersKey, refreshToken]);

  return { tasks, loading, error, refresh };
}
