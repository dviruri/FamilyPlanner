/**
 * Simple recurrence expansion utilities.
 *
 * Supported rules (stored as text in DB):
 *   FREQ=DAILY
 *   FREQ=WEEKLY
 *   FREQ=MONTHLY
 *
 * Design intent: values are intentionally compatible with RRULE syntax
 * so they can be upgraded to full RFC-5545 later without a DB migration.
 *
 * What this intentionally does NOT support yet:
 *   - UNTIL / COUNT (end date / max occurrences)
 *   - BYDAY weekday lists
 *   - Exceptions (single-occurrence edits / deletions)
 *   - INTERVAL > 1
 */

import type { EventWithParticipants } from '../services/eventsService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecurrenceFreq = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface RecurrenceRule {
  freq: RecurrenceFreq;
}

export const RECURRENCE_OPTIONS: { value: string; label: string }[] = [
  { value: '',             label: 'ללא חזרה'  },
  { value: 'FREQ=DAILY',  label: 'כל יום'    },
  { value: 'FREQ=WEEKLY', label: 'כל שבוע'   },
  { value: 'FREQ=MONTHLY',label: 'כל חודש'   },
];

export const RECURRENCE_LABELS: Record<string, string> = {
  'FREQ=DAILY':  'כל יום',
  'FREQ=WEEKLY': 'כל שבוע',
  'FREQ=MONTHLY':'כל חודש',
};

// ---------------------------------------------------------------------------
// parseRule
// ---------------------------------------------------------------------------
export function parseRule(rule: string | null | undefined): RecurrenceRule | null {
  if (!rule) return null;
  const parts = rule.toUpperCase().split(';');
  const freqPart = parts.find((p) => p.startsWith('FREQ='));
  if (!freqPart) return null;
  const freq = freqPart.split('=')[1] as RecurrenceFreq;
  if (!['DAILY', 'WEEKLY', 'MONTHLY'].includes(freq)) return null;
  return { freq };
}

// ---------------------------------------------------------------------------
// advanceDate — advance a UTC ISO string by one period
// ---------------------------------------------------------------------------
function advanceDate(isoStr: string, freq: RecurrenceFreq): string {
  const d = new Date(isoStr);
  switch (freq) {
    case 'DAILY':   d.setUTCDate(d.getUTCDate() + 1);   break;
    case 'WEEKLY':  d.setUTCDate(d.getUTCDate() + 7);   break;
    case 'MONTHLY': d.setUTCMonth(d.getUTCMonth() + 1); break;
  }
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// expandRecurringEvent
// Given a single recurring EventRow, produce virtual occurrences that fall
// within [rangeStartISO, rangeEndISO].
// Virtual events share the same `id` as the original (for CRUD), but have
// a unique `_occurrenceKey` property for React rendering.
// ---------------------------------------------------------------------------
export function expandRecurringEvent(
  event: EventWithParticipants,
  rangeStartISO: string,
  rangeEndISO: string,
): EventWithParticipants[] {
  const rule = parseRule(event.recurrence_rule);
  if (!rule) return [];

  const occurrences: EventWithParticipants[] = [];
  const durationMs =
    new Date(event.end_time).getTime() - new Date(event.start_time).getTime();

  // Start iterating from the event's own start_time
  let cursor = event.start_time;
  const rangeEnd = new Date(rangeEndISO).getTime();
  const rangeStart = new Date(rangeStartISO).getTime();

  // Safety guard: never iterate more than 366 times
  let guard = 0;
  while (guard++ < 366) {
    const cursorMs = new Date(cursor).getTime();
    if (cursorMs > rangeEnd) break;

    if (cursorMs >= rangeStart) {
      const occEnd = new Date(cursorMs + durationMs).toISOString();
      occurrences.push({
        ...event,
        start_time: cursor,
        end_time: occEnd,
        // Unique key for React; CRUD still uses event.id
        _occurrenceKey: `${event.id}_${cursor}`,
      } as EventWithParticipants & { _occurrenceKey: string });
    }

    cursor = advanceDate(cursor, rule.freq);
  }

  return occurrences;
}

// ---------------------------------------------------------------------------
// expandEvents
// Given a list of events (mix of one-time and recurring),
// return the flat list of visible occurrences within the range.
// One-time events are returned as-is; recurring events are expanded.
// ---------------------------------------------------------------------------
export function expandEvents(
  events: EventWithParticipants[],
  rangeStartISO: string,
  rangeEndISO: string,
): EventWithParticipants[] {
  const result: EventWithParticipants[] = [];

  for (const event of events) {
    if (!event.recurrence_rule) {
      result.push(event);
    } else {
      const expanded = expandRecurringEvent(event, rangeStartISO, rangeEndISO);
      result.push(...expanded);
    }
  }

  // Sort by start_time
  return result.sort((a, b) => a.start_time.localeCompare(b.start_time));
}
