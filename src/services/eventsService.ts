import { supabase } from './supabase/client';
import { expandEvents } from '../utils/recurrence';
import type { EventRow, EventInsert, EventUpdate } from '../types/database';

// ---------------------------------------------------------------------------
// Enriched type: event + participant IDs
// ---------------------------------------------------------------------------
export interface EventWithParticipants extends EventRow {
  participantIds: string[];
}

// ---------------------------------------------------------------------------
// Hebrew error helper
// ---------------------------------------------------------------------------
function dbError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('permission') || m.includes('policy')) return 'אין הרשאה לבצע פעולה זו';
  if (m.includes('network') || m.includes('fetch'))     return 'בעיית חיבור — נסה שוב';
  return 'אירעה שגיאה. נסה שוב';
}

// ---------------------------------------------------------------------------
// getEventsForRange
// Fetches all family events whose start_time falls in [startISO, endISO]
// and resolves participant IDs.
// ---------------------------------------------------------------------------
export async function getEventsForRange(
  familyId: string,
  startISO: string,
  endISO: string,
): Promise<{ data: EventWithParticipants[]; error: string | null }> {
  // Fetch in two passes:
  // 1. One-time events that fall within the range.
  // 2. All recurring events whose series start ≤ rangeEnd (expanded client-side).
  const [onetimeResult, recurringResult] = await Promise.all([
    supabase
      .from('events')
      .select('*, event_participants(family_member_id)')
      .eq('family_id', familyId)
      .is('recurrence_rule', null)
      .gte('start_time', startISO)
      .lte('start_time', endISO),
    supabase
      .from('events')
      .select('*, event_participants(family_member_id)')
      .eq('family_id', familyId)
      .not('recurrence_rule', 'is', null)
      .lte('start_time', endISO), // series must have started before range end
  ]);

  if (onetimeResult.error) {
    console.error('[eventsService] getEventsForRange (one-time):', onetimeResult.error);
    return { data: [], error: dbError(onetimeResult.error.message) };
  }
  if (recurringResult.error) {
    console.error('[eventsService] getEventsForRange (recurring):', recurringResult.error);
    return { data: [], error: dbError(recurringResult.error.message) };
  }

  function enrich(rows: unknown[]): EventWithParticipants[] {
    return (rows ?? []).map((e) => {
      const raw = e as EventRow & { event_participants?: { family_member_id: string }[] };
      return { ...raw, participantIds: (raw.event_participants ?? []).map((p) => p.family_member_id) };
    });
  }

  const oneTime  = enrich(onetimeResult.data ?? []);
  const recurring = enrich(recurringResult.data ?? []);

  // Expand recurring events into occurrences within range, then merge
  const expanded = expandEvents(recurring, startISO, endISO);
  const all = [...oneTime, ...expanded].sort((a, b) => a.start_time.localeCompare(b.start_time));

  return { data: all, error: null };
}

// ---------------------------------------------------------------------------
// createEvent
// ---------------------------------------------------------------------------
export async function createEvent(
  insert: EventInsert,
  participantIds: string[],
): Promise<{ data: EventWithParticipants | null; error: string | null }> {
  // 1. Insert event
  const { data: eventRow, error: eventErr } = await supabase
    .from('events')
    .insert(insert as never)
    .select()
    .single();

  if (eventErr || !eventRow) {
    console.error('[eventsService] createEvent:', eventErr);
    return { data: null, error: dbError(eventErr?.message ?? 'שגיאה') };
  }

  const row = eventRow as unknown as EventRow;

  // 2. Insert participants
  if (participantIds.length > 0) {
    const participantRows = participantIds.map((id) => ({
      event_id: row.id,
      family_member_id: id,
    }));
    const { error: partErr } = await supabase
      .from('event_participants')
      .insert(participantRows as never);

    if (partErr) {
      console.warn('[eventsService] createEvent participants:', partErr.message);
    }
  }

  return { data: { ...row, participantIds }, error: null };
}

// ---------------------------------------------------------------------------
// updateEvent
// ---------------------------------------------------------------------------
export async function updateEvent(
  eventId: string,
  updates: EventUpdate,
  participantIds: string[],
): Promise<{ data: EventWithParticipants | null; error: string | null }> {
  // 1. Update event row
  const { data: eventRow, error: eventErr } = await supabase
    .from('events')
    .update(updates as never)
    .eq('id', eventId)
    .select()
    .single();

  if (eventErr || !eventRow) {
    console.error('[eventsService] updateEvent:', eventErr);
    return { data: null, error: dbError(eventErr?.message ?? 'שגיאה') };
  }

  const row = eventRow as unknown as EventRow;

  // 2. Replace participants: delete old, insert new
  await supabase.from('event_participants').delete().eq('event_id', eventId);

  if (participantIds.length > 0) {
    const participantRows = participantIds.map((id) => ({
      event_id: eventId,
      family_member_id: id,
    }));
    await supabase.from('event_participants').insert(participantRows as never);
  }

  return { data: { ...row, participantIds }, error: null };
}

// ---------------------------------------------------------------------------
// deleteEvent
// ---------------------------------------------------------------------------
export async function deleteEvent(
  eventId: string,
): Promise<{ error: string | null }> {
  // Participants are cascade-deleted by FK
  const { error } = await supabase.from('events').delete().eq('id', eventId);

  if (error) {
    console.error('[eventsService] deleteEvent:', error);
    return { error: dbError(error.message) };
  }
  return { error: null };
}
