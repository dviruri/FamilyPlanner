import { useState, useEffect, useCallback } from 'react';
import { useFamily } from '../family/FamilyContext';
import { getEventsForRange } from '../../services/eventsService';
import { startOfDayISO, endOfDayISO } from '../../utils/calendarDates';
import type { EventWithParticipants } from '../../services/eventsService';

/**
 * Fetch events for an explicit date range.
 * startKey and endKey are YYYY-MM-DD strings.
 */
export function useEventsForRange(startKey: string, endKey: string) {
  const { activeFamily } = useFamily();
  const [events, setEvents]   = useState<EventWithParticipants[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!activeFamily) return;
    setLoading(true);
    setError(null);

    const { data, error: err } = await getEventsForRange(
      activeFamily.id,
      startOfDayISO(startKey),
      endOfDayISO(endKey),
    );

    setEvents(data);
    setError(err);
    setLoading(false);
  }, [activeFamily, startKey, endKey]);

  useEffect(() => { void load(); }, [load]);

  return { events, loading, error, refresh: load };
}
