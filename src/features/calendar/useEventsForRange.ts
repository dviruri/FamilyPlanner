import { useState, useEffect } from 'react';
import { useFamily } from '../family/FamilyContext';
import { getEventsForRange } from '../../services/eventsService';
import { startOfDayISO, endOfDayISO } from '../../utils/calendarDates';
import type { EventWithParticipants } from '../../services/eventsService';

/**
 * Fetch events for an explicit date range.
 * startKey and endKey are YYYY-MM-DD strings.
 * Uses a ref-based refresh token to trigger reloads without re-subscribing.
 */
export function useEventsForRange(startKey: string, endKey: string) {
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

    getEventsForRange(
      activeFamily.id,
      startOfDayISO(startKey),
      endOfDayISO(endKey),
    ).then(({ data, error: err }) => {
      if (cancelled) return;
      setEvents(data);
      setError(err);
      setLoading(false);
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [activeFamily, startKey, endKey, refreshToken]);

  return { events, loading, error, refresh };
}
