import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, Share2 } from 'lucide-react';
import { shareLink } from '../lib/share';
import { useEventDays, useEventRanges } from '../api/useDirectory';
import { getEventsCalendarDay, getLocalDateString, myanmarMonthsOf } from '../lib/eventsCalendar';
import { EventCardSkeleton } from '../components/Skeleton';
import FestivalMarks from '../components/FestivalMarks';
import MonthSheet from '../components/MonthSheet';
import MoonPhase from '../components/MoonPhase';
import { eventDayLabel, formatMyanmarDate, toMyanmarDigits } from '../lib/myanmar';
import { DAY_LABELS, MONTH_NAMES, daysFrom, eventsOn, festivalTone, toDateStr } from '../lib/festivals';
import { isPagodaFestival } from '../services/directory';
import type { EventDayView, EventRangeView } from '../types';

type EventStatus = 'previous' | 'current' | 'upcoming';

/** Spoken by screen readers; sighted users read the state from the chip's date line. */
const STATUS_LABELS: Record<EventStatus, string> = {
  previous: 'ပြီးခဲ့သောပွဲ',
  current: 'ယခုကျင်းပဆဲပွဲ',
  upcoming: 'လာမည့်ပွဲ',
};

/** Previous and upcoming chips only count events within this many days of today. */
const CHIP_WINDOW_DAYS = 30;

/**
 * Up to three chips, left to right: the last event that ended, the one running
 * today, and the next one to start. Slots without an event are left out.
 */
function eventStatusChips(events: EventRangeView[], today: string): [EventStatus, EventRangeView][] {
  const previous = events
    .filter((event) => event.endDate < today && daysFrom(event.endDate, today) <= CHIP_WINDOW_DAYS)
    .sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
  const current = events.find((event) => event.startDate <= today && today <= event.endDate);
  const upcoming = events
    .filter((event) => event.startDate > today && daysFrom(today, event.startDate) <= CHIP_WINDOW_DAYS)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const chips: [EventStatus, EventRangeView | undefined][] = [
    ['previous', previous],
    ['current', current],
    ['upcoming', upcoming],
  ];
  return chips.filter((chip): chip is [EventStatus, EventRangeView] => !!chip[1]);
}

function dateRangeLabel(event: EventRangeView): string {
  if (event.startDate === event.endDate) return formatMyanmarDate(event.startDate);
  return `${formatMyanmarDate(event.startDate)} – ${formatMyanmarDate(event.endDate)}`;
}

/** "in N days" in Myanmar. */
function inDaysLabel(days: number): string {
  return days === 1 ? 'မနက်ဖြန်' : `${toMyanmarDigits(days)} ရက်အကြာ`;
}

/** Second line of a chip: today, how soon, or when it ran. */
function chipDateLine(status: EventStatus, event: EventRangeView, today: string): string {
  if (status === 'current') {
    const total = daysFrom(event.startDate, event.endDate) + 1;
    if (total === 1) return 'ယနေ့';
    return `ယနေ့ · ${toMyanmarDigits(daysFrom(event.startDate, today) + 1)} / ${toMyanmarDigits(total)}`;
  }
  if (status === 'upcoming') return inDaysLabel(daysFrom(today, event.startDate));
  return dateRangeLabel(event);
}

/** Waxing/waning day in Myanmar digits; full and new moon by name. */
function moonLabel(phase: string, dayMy: string): string {
  if (phase === 'Full Moon') return 'လပြည့်';
  if (phase === 'New Moon') return 'လကွယ်';
  return dayMy;
}

/** Every day of a month, as YYYY-MM-DD (0-based month). */
function monthDates(year: number, month: number): string[] {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, index) => toDateStr(year, month, index + 1));
}

function monthOf(date: string) {
  return { year: Number(date.slice(0, 4)), month: Number(date.slice(5, 7)) - 1 };
}

export default function EventsPage() {
  const todayStr = getLocalDateString(new Date());
  // ?date=YYYY-MM-DD opens a given day (shareable links, ticker taps).
  const [searchParams] = useSearchParams();
  const linkedDate = searchParams.get('date');
  const initialDate =
    linkedDate && /^\d{4}-\d{2}-\d{2}$/.test(linkedDate) && !Number.isNaN(Date.parse(linkedDate))
      ? linkedDate
      : todayStr;
  // The selected day loads its schedule; the viewed month only changes the row.
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [view, setView] = useState(() => monthOf(initialDate));
  const [showMarketDayChips, setShowMarketDayChips] = useState(false);
  const [monthOpen, setMonthOpen] = useState(false);
  // Event cards opened by the user (collapsed by default, like the market day row).
  const [openCards, setOpenCards] = useState<Set<string>>(() => new Set());
  const {
    data: selectedEventDays = [],
    isLoading: isLoadingEventDays,
    isError: isEventDaysError,
    isPlaceholderData: scheduleIsStale,
    refetch: refetchEventDays,
  } = useEventDays(selectedDate);
  const sortedEventDays = [
    ...selectedEventDays.filter((day) => isPagodaFestival(day.eventName)),
    ...selectedEventDays.filter((day) => !isPagodaFestival(day.eventName)),
  ];

  const { data: eventRanges = [] } = useEventRanges();
  const statusChips = eventStatusChips(eventRanges, todayStr);
  const rowDates = monthDates(view.year, view.month);
  const { marketDay: selectedMarketDay } = getEventsCalendarDay(selectedDate);
  const selectedMarketTown = selectedMarketDay.markets[0]?.name.my;

  // Empty day: what runs today without a schedule, and the next festival after it.
  const runningWithoutSchedule = eventsOn(eventRanges, selectedDate);
  const nextFestival = eventRanges
    .filter((event) => event.startDate > selectedDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const showEmptyDay =
    !isLoadingEventDays && !isEventDaysError && !scheduleIsStale && selectedEventDays.length === 0;

  /** Select a day (this loads its schedule) and show its month in the row. */
  const selectDate = useCallback((dateStr: string) => {
    setSelectedDate(dateStr);
    setView(monthOf(dateStr));
  }, []);

  const stepMonth = (offset: number) =>
    setView(({ year, month }) => {
      const next = new Date(year, month + offset, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });

  const closeMonth = useCallback(() => setMonthOpen(false), []);

  const toggleCard = (key: string) =>
    setOpenCards((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // Centre the selected day in the row (or today, or the 1st) whenever the
  // row's month or the selection changes. Scrolling the row by hand loads nothing.
  const rowRef = useRef<HTMLDivElement>(null);
  const firstScroll = useRef(true);
  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    const target =
      row.querySelector<HTMLElement>('[aria-pressed="true"]') ?? row.querySelector<HTMLElement>('.today');
    const left = target ? target.offsetLeft - (row.clientWidth - target.offsetWidth) / 2 : 0;
    const instant = firstScroll.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({ left, behavior: instant ? 'auto' : 'smooth' });
    firstScroll.current = false;
  }, [view.year, view.month, selectedDate]);

  return (
    <div>
      <div className="page-head events-page-head">
        {/* Shares the selected day: its date and any festivals on it. */}
        <button
          className="icon-btn events-share-button"
          type="button"
          aria-label="Share this day"
          title="Share this day"
          onClick={() =>
            void shareLink({
              title: `Events · ${formatMyanmarDate(selectedDate)}`,
              text: [formatMyanmarDate(selectedDate), ...eventsOn(eventRanges, selectedDate).map((event) => event.name)].join(' · '),
              path: `/events?date=${selectedDate}`,
            })
          }
        >
          <Share2 size={19} />
        </button>
        <h1>Events</h1>
        <button
          className="calendar-today-button"
          onClick={() => selectDate(todayStr)}
          aria-current={selectedDate === todayStr ? 'date' : undefined}
          type="button"
        >
          Today
        </button>
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <div className="calendar-card">
          <div className="calendar-nav">
            <button onClick={() => stepMonth(-1)} aria-label="Previous month" type="button">
              <ChevronLeft size={20} />
            </button>
            {/* Opens the month calendar (TGI-64). */}
            <button
              className="calendar-month-button"
              onClick={() => setMonthOpen(true)}
              aria-haspopup="dialog"
              aria-label={`${MONTH_NAMES[view.month]} ${view.year}, open month calendar`}
              type="button"
            >
              <span className="calendar-month-myanmar">{myanmarMonthsOf(view.year, view.month)}</span>
              <span className="calendar-month">
                {MONTH_NAMES[view.month]} {view.year}
              </span>
              <ChevronDown size={14} aria-hidden="true" />
            </button>
            <button onClick={() => stepMonth(1)} aria-label="Next month" type="button">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Every day of the month; scroll freely, tap a day to load its schedule. */}
          <div className="calendar-day-strip" ref={rowRef}>
            {rowDates.map((dateStr) => {
              const date = new Date(`${dateStr}T12:00:00Z`);
              const { myanmarDate, marketDay } = getEventsCalendarDay(dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const phase = myanmarDate.day.mp.en;
              const dayEvents = eventsOn(eventRanges, dateStr);
              return (
                <button
                  key={dateStr}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`${isToday ? 'Today, ' : ''}${dateStr}: ${marketDay.markets[0]?.town.my} ဈေးနေ့၊ ${myanmarDate.month.my} ${myanmarDate.day.mp.my} ${myanmarDate.day.fd.my} ရက်${dayEvents.length ? `၊ ${dayEvents.map((event) => event.name).join('၊ ')}` : ''}`}
                  className={`calendar-strip-day${isSelected ? ' focused' : ''}${isToday ? ' today' : ''}${phase === 'Full Moon' ? ' full-moon' : ''}`}
                  onClick={() => selectDate(dateStr)}
                >
                  <span className="calendar-strip-weekday">{DAY_LABELS[date.getUTCDay()]}</span>
                  <strong className="calendar-strip-date">{date.getUTCDate()}</strong>
                  <MoonPhase phase={phase} day={Number(myanmarDate.day.fd.en)} size={18} />
                  <span className="calendar-strip-myanmar">{moonLabel(phase, myanmarDate.day.fd.my)}</span>
                  <FestivalMarks events={dayEvents} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Previous | current | upcoming event: tap to jump there. */}
        {statusChips.length > 0 && (
          <ul className="event-status-chips" aria-label="ပွဲများ">
            {statusChips.map(([status, event]) => (
              <li key={status}>
                <button
                  className={`event-status-chip ${status} tone-${festivalTone(event.name)}`}
                  onClick={() => selectDate(status === 'current' ? todayStr : event.startDate)}
                  type="button"
                >
                  <span className="visually-hidden">{STATUS_LABELS[status]}: </span>
                  <span className="event-status-name">{event.name}</span>
                  <span className="event-status-when">{chipDateLine(status, event, todayStr)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Market Day Info Card */}
        <section className="market-day" aria-live="polite">
          {/* One slim row: label, today's market, and a chevron for the full list. */}
          <button
            className="market-day-row"
            type="button"
            aria-expanded={showMarketDayChips}
            onClick={() => setShowMarketDayChips((isVisible) => !isVisible)}
          >
            <strong>{selectedMarketTown}</strong>
            <ChevronDown
              size={16}
              className={`market-day-toggle${showMarketDayChips ? ' open' : ''}`}
              aria-hidden="true"
            />
          </button>
          {showMarketDayChips && (
            <div className="market-day-chips" aria-label="ဈေးနေ့များ">
              {selectedMarketDay.markets.map((market) => (
                <span className="market-day-chip" key={market.id}>
                  {market.name.my}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Festival days on the selected date */}
        {(isLoadingEventDays || isEventDaysError || selectedEventDays.length > 0) && (
          <section
            className={`tazaungdaing-events${scheduleIsStale ? ' stale' : ''}`}
            aria-live="polite"
            aria-busy={scheduleIsStale}
          >
            {isLoadingEventDays && <EventCardSkeleton />}
            {isEventDaysError && (
              <div className="data-error" role="alert">
                <span>အချက်အလက်များကို ရယူ၍ မရပါ။</span>
                <button className="link-btn" onClick={() => void refetchEventDays()} type="button">
                  ပြန်ကြိုးစားရန်
                </button>
              </div>
            )}
            {sortedEventDays.map((day) => (
              <EventCard key={day.key} day={day} open={openCards.has(day.key)} onToggle={() => toggleCard(day.key)} />
            ))}
          </section>
        )}

        {/* No schedule on this day: say so, and point to the next festival. */}
        {showEmptyDay && (
          <section className="event-empty-day" aria-live="polite">
            {runningWithoutSchedule.length > 0 ? (
              <>
                <h3>{runningWithoutSchedule.map((event) => event.name).join('၊ ')}</h3>
                <p>ဤနေ့အတွက် အစီအစဉ် မထည့်ရသေးပါ။</p>
              </>
            ) : (
              <h3>ဤနေ့ ပွဲမရှိပါ</h3>
            )}
            {nextFestival && (
              <button
                className={`event-next tone-${festivalTone(nextFestival.name)}`}
                onClick={() => selectDate(nextFestival.startDate)}
                type="button"
              >
                <span className="event-next-text">
                  <span className="event-next-label">နောက်ပွဲ</span>
                  <strong>{nextFestival.name}</strong>
                  <span>
                    {formatMyanmarDate(nextFestival.startDate)} · {inDaysLabel(daysFrom(selectedDate, nextFestival.startDate))}
                  </span>
                </span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            )}
          </section>
        )}
      </div>

      {monthOpen && (
        <MonthSheet
          selectedDate={selectedDate}
          today={todayStr}
          events={eventRanges}
          onSelect={(date) => {
            selectDate(date);
            setMonthOpen(false);
          }}
          onClose={closeMonth}
        />
      )}
    </div>
  );
}

/** One festival day: tap the title row to show or hide its schedule. */
function EventCard({ day, open, onToggle }: { day: EventDayView; open: boolean; onToggle: () => void }) {
  const listId = `event-${day.key}`;
  return (
    <article className={`event-card tone-${festivalTone(day.eventName)}`}>
      <h3 className="event-card-title">
        <button
          className="event-card-head"
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={onToggle}
        >
          <span className="event-card-name">{day.title}</span>
          {day.dayNumber && day.dayCount && (
            <span className="event-progress">
              <span className="event-progress-track" aria-hidden="true">
                <span style={{ width: `${(day.dayNumber / day.dayCount) * 100}%` }} />
              </span>
              <span className="event-progress-count" aria-hidden="true">
                {toMyanmarDigits(day.dayNumber)} / {toMyanmarDigits(day.dayCount)}
              </span>
              <span className="visually-hidden">{eventDayLabel(day.dayNumber, day.dayCount)}</span>
            </span>
          )}
          <ChevronDown size={16} className={`market-day-toggle${open ? ' open' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      {open && day.entries.length === 0 && (
        <p className="event-card-empty" id={listId}>
          ဤနေ့အတွက် အစီအစဉ် မထည့်ရသေးပါ။
        </p>
      )}
      {open && day.entries.length > 0 && (
        <ul className="event-card-list" id={listId}>
          {day.entries.map((entry) => {
            // With a ward: "role · ward" under the name. Without: the role sits on the right.
            const body = (
              <>
                <span className="event-row-text">
                  <strong>{entry.name}</strong>
                  {entry.ward && <span>{[entry.role, entry.ward].filter(Boolean).join(' · ')}</span>}
                </span>
                {!entry.ward && entry.role && <span className="event-row-role">{entry.role}</span>}
                {entry.href && <ChevronRight size={16} className="event-row-arrow" aria-hidden="true" />}
              </>
            );
            return (
              <li key={entry.key}>
                {entry.href ? (
                  <Link className="event-row" to={entry.href}>
                    {body}
                  </Link>
                ) : (
                  // No profile to open: still list the participant.
                  <div className="event-row">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
