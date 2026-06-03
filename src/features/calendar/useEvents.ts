import { useState, useEffect, useCallback } from 'react';
import { useFamily } from '../family/FamilyContext';
import { getEventsForRange } from '../../services/eventsService';
import type { EventWithParticipants } from '../../services/eventsService';

/** Returns ISO strings for start of day and end of day N days ahead */
function rangeFor(daysBack: number, daysAhead: number): { start: string; end: string } {
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setDate(end.getDate() + daysAhead);
  end.setHours(23, 59, 59, 999);

  return { start: start.toISOString(), end: end.toISOString() };
}

export function useEvents(daysBack = 0, daysAhead = 30) {
  const { activeFamily } = useFamily();
  const [events, setEvents]   = useState<EventWithParticipants[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeFamily) return;
    setLoading(true);
    setError(null);

    const { start, end } = rangeFor(daysBack, daysAhead);
    const { data, error: err } = await getEventsForRange(activeFamily.id, start, end);

    setEvents(data);
    setError(err);
    setLoading(false);
  }, [activeFamily, daysBack, daysAhead]);

  useEffect(() => { void load(); }, [load]);

  return { events, loading, error, refresh: load };
}
