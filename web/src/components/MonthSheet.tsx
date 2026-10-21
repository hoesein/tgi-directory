import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import FestivalBands from './FestivalBands';
import MoonPhase from './MoonPhase';
import { getEventsCalendarDay } from '../lib/eventsCalendar';
import { DAY_LABELS, MONTH_NAMES, eventsOn, toDateStr } from '../lib/festivals';
import type { EventRangeView } from '../types';

/** Weeks of the month, Sunday first; null pads the first and last week. */
function monthWeeks(year: number, month: number): (string | null)[][] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array.from({ length: firstDay }, () => null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(toDateStr(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

/** Myanmar months a Gregorian month spans, e.g. "သီတင်းကျွတ် – တန်ဆောင်မုန်း". */
function myanmarMonths(year: number, month: number): string {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const names: string[] = [];
  for (let day = 1; day <= daysInMonth; day++) {
    const name = getEventsCalendarDay(toDateStr(year, month, day)).myanmarDate.month.my;
    if (!names.includes(name)) names.push(name);
  }
  return names.join(' – ');
}

interface MonthSheetProps {
  selectedDate: string;
  today: string;
  events: EventRangeView[];
  onSelect: (date: string) => void;
  onClose: () => void;
}

/**
 * Month calendar in a bottom sheet (TGI-64): moons, festival bands per week,
 * tap a day to jump the Events strip there.
 */
export default function MonthSheet({ selectedDate, today, events, onSelect, onClose }: MonthSheetProps) {
  const [view, setView] = useState(() => ({
    year: Number(selectedDate.slice(0, 4)),
    month: Number(selectedDate.slice(5, 7)) - 1,
  }));
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    sheetRef.current?.querySelector<HTMLElement>('[aria-pressed="true"], .month-sheet-close')?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  const step = (offset: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const title = `${MONTH_NAMES[view.month]} ${view.year}`;

  return createPortal(
    <div className="month-sheet-backdrop" onClick={onClose} role="presentation">
      <div
        ref={sheetRef}
        className="month-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`${title} calendar`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="month-sheet-head">
          <button className="month-sheet-step" onClick={() => step(-1)} aria-label="Previous month" type="button">
            <ChevronLeft size={20} />
          </button>
          <div className="month-sheet-title">
            <strong>{title}</strong>
            <span>{myanmarMonths(view.year, view.month)}</span>
          </div>
          <button className="month-sheet-step" onClick={() => step(1)} aria-label="Next month" type="button">
            <ChevronRight size={20} />
          </button>
          <button className="month-sheet-close" onClick={onClose} aria-label="Close calendar" type="button">
            <X size={20} />
          </button>
        </div>

        <div className="month-sheet-dow" aria-hidden="true">
          {DAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>

        {monthWeeks(view.year, view.month).map((week) => (
          <div className="month-week" key={week.find(Boolean)}>
            <div className="month-week-days">
              {week.map((date, index) => {
                if (!date) return <span key={`pad-${index}`} />;
                const { myanmarDate } = getEventsCalendarDay(date);
                const festivals = eventsOn(events, date);
                const phase = myanmarDate.day.mp.en;
                return (
                  <button
                    key={date}
                    type="button"
                    className={`month-day${date === today ? ' today' : ''}`}
                    aria-pressed={date === selectedDate}
                    aria-label={`${date}, ${myanmarDate.month.my} ${myanmarDate.day.mp.my} ${myanmarDate.day.fd.my}${festivals.length ? `, ${festivals.map((event) => event.name).join(', ')}` : ''}`}
                    onClick={() => onSelect(date)}
                  >
                    <span className="month-day-number">{Number(date.slice(8))}</span>
                    <MoonPhase phase={phase} day={Number(myanmarDate.day.fd.en)} size={12} />
                  </button>
                );
              })}
            </div>
            <FestivalBands dates={week} events={events} />
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}
