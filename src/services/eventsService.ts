import { supabase } from './supabase/client';
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
  const { data: events, error } = await supabase
    .from('events')
    .select('*, event_participants(family_member_id)')
    .eq('family_id', familyId)
    .gte('start_time', startISO)
    .lte('start_time', endISO)
    .order('start_time');

  if (error) {
    console.error('[eventsService] getEventsForRange:', error);
    return { data: [], error: dbError(error.message) };
  }

  const enriched: EventWithParticipants[] = (events ?? []).map((e) => {
    const raw = e as unknown as EventRow & { event_participants?: { family_member_id: string }[] };
    const participants = raw.event_participants ?? [];
    return {
      ...raw,
      participantIds: participants.map((p) => p.family_member_id),
    };
  });

  return { data: enriched, error: null };
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
