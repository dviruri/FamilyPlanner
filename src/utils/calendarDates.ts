// ---------------------------------------------------------------------------
// Israeli / Hebrew calendar date utilities
// Week starts on Sunday (day 0)
// ---------------------------------------------------------------------------

/** YYYY-MM-DD of today */
export function todayKey(): string {
  return new Date().toLocaleDateString('en-CA');
}

/** YYYY-MM-DD from any Date */
export function dateKey(d: Date): string {
  return d.toLocaleDateString('en-CA');
}

/** Add N days to a YYYY-MM-DD string */
export function addDays(key: string, n: number): string {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}

/** Add N weeks */
export function addWeeks(key: string, n: number): string {
  return addDays(key, n * 7);
}

/** Compare two YYYY-MM-DD strings */
export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/** Sunday of the week containing `key` */
export function startOfIsraeliWeek(key: string): string {
  const d = new Date(`${key}T00:00:00`);
  const day = d.getDay(); // 0=Sun
  d.setDate(d.getDate() - day);
  return dateKey(d);
}

/** Saturday of the week containing `key` */
export function endOfIsraeliWeek(key: string): string {
  return addDays(startOfIsraeliWeek(key), 6);
}

/** All 7 days of the week containing `key` (Sun→Sat) */
export function weekDays(key: string): string[] {
  const sun = startOfIsraeliWeek(key);
  return Array.from({ length: 7 }, (_, i) => addDays(sun, i));
}

/** ISO start of day (00:00:00 local) */
export function startOfDayISO(key: string): string {
  return new Date(`${key}T00:00:00`).toISOString();
}

/** ISO end of day (23:59:59 local) */
export function endOfDayISO(key: string): string {
  return new Date(`${key}T23:59:59`).toISOString();
}

/** Hebrew short date: "ראשון, 15 ביוני" */
export function formatHebrewDate(key: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    ...options,
  });
}

/** Short Hebrew: "15/6" */
export function formatShortDate(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'numeric',
  });
}

/** Month + year label: "יוני 2025" */
export function formatMonthYear(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString('he-IL', {
    month: 'long',
    year: 'numeric',
  });
}

/** Short day name: "ראשון", "שני" ... */
export function formatWeekday(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString('he-IL', { weekday: 'long' });
}

/** Day number: 1-31 */
export function dayNumber(key: string): number {
  return new Date(`${key}T00:00:00`).getDate();
}
