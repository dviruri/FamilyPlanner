import { useState, useEffect } from 'react';
import { useFamily } from '../family/FamilyContext';
import { getEventsForRange } from '../../services/eventsService';
import type { EventWithParticipants } from '../../services/eventsService';

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
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = () => setRefreshToken((t) => t + 1);

  useEffect(() => {
    if (!activeFamily) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    const { start, end } = rangeFor(daysBack, daysAhead);
    getEventsForRange(activeFamily.id, start, end)
      .then(({ data, error: err }) => {
        if (cancelled) return;
        setEvents(data);
        setError(err);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [activeFamily, daysBack, daysAhead, refreshToken]);

  return { events, loading, error, refresh };
}
