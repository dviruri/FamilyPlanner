/** Convert a local date string (YYYY-MM-DD) + time (HH:MM) → ISO timestamptz string */
export function toTimestamp(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

/** Extract YYYY-MM-DD from an ISO timestamp string */
export function toDateInput(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA'); // YYYY-MM-DD
}

/** Extract HH:MM from an ISO timestamp string */
export function toTimeInput(iso: string): string {
  return new Date(iso).toLocaleTimeString('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Format a timestamp for display in Hebrew */
export function formatEventTime(startISO: string, endISO: string, allDay: boolean): string {
  if (allDay) return 'כל היום';
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${fmt(startISO)} – ${fmt(endISO)}`;
}

/** Format a date for display in Hebrew */
export function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/** Group events by local date string */
export function groupByDate<T extends { start_time: string }>(
  events: T[],
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const e of events) {
    const key = toDateInput(e.start_time);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return map;
}
