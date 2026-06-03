import { useState, useEffect, useCallback } from 'react';
import { useFamily } from '../family/FamilyContext';
import { getTasks } from '../../services/tasksService';
import type { TaskRow } from '../../types/database';
import type { TaskFilters } from '../../services/tasksService';

export function useTasks(filters: TaskFilters = {}) {
  const { activeFamily } = useFamily();
  const [tasks, setTasks]     = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);

  const load = useCallback(async () => {
    if (!activeFamily) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await getTasks(activeFamily.id, filters);
    setTasks(data);
    setError(err);
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFamily, filtersKey]);

  useEffect(() => { void load(); }, [load]);

  return { tasks, loading, error, refresh: load };
}
