import { isPagodaFestival } from '../services/directory';
import type { EventRangeView } from '../types';

/**
 * One colour per festival, shared by day-strip bands, chips, month bands and
 * event cards (TGI-63): pagoda festival gold, Tazaungdaing (fire balloons)
 * ember, anything else forest green.
 */
export type FestivalTone = 'pagoda' | 'lights' | 'other';

export function festivalTone(name: string): FestivalTone {
  if (isPagodaFestival(name)) return 'pagoda';
  if (name.includes('တန်ဆောင်တိုင်')) return 'lights';
  return 'other';
}

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Year, 0-based month, day → YYYY-MM-DD. */
export function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Whole days from one YYYY-MM-DD to another. */
export function daysFrom(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

export function shiftDate(dateStr: string, offset: number): string {
  const date = new Date(`${dateStr}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return toDateStr(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function eventsOn(events: EventRangeView[], dateStr: string): EventRangeView[] {
  return events.filter((event) => event.startDate <= dateStr && dateStr <= event.endDate);
}
