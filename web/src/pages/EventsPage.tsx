import { useRef, useState, type TouchEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useEventDays, useEventRanges } from '../api/useDirectory';
import { getEventsCalendarDay, getLocalDateString } from '../lib/eventsCalendar';
import { eventDayLabel, formatMyanmarDate, toMyanmarDigits } from '../lib/myanmar';
import { isPagodaFestival } from '../services/directory';
import type { EventRangeView } from '../types';

/** A horizontal move this long (px) on the day strip changes the day. */
const SWIPE_DISTANCE = 40;
const UPCOMING_LIMIT = 3;

function daysFrom(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** Short chip status: "ယခုကျင်းပဆဲ · ၉/၁၈", "၁၈ နိုဝင်ဘာ · မနက်ဖြန်", "၁၈ နိုဝင်ဘာ · ၂၉ ရက်အကြာ" */
function upcomingStatus(event: EventRangeView, today: string): { text: string; live: boolean } {
  if (event.startDate <= today) {
    const dayCount = daysFrom(event.startDate, event.endDate) + 1;
    const dayNumber = daysFrom(event.startDate, today) + 1;
    return {
      text:
        dayCount > 1
          ? `ယခုကျင်းပဆဲ · ${toMyanmarDigits(dayNumber)}/${toMyanmarDigits(dayCount)}`
          : 'ယနေ့ကျင်းပမည်',
      live: true,
    };
  }
  const until = daysFrom(today, event.startDate);
  const when = until === 1 ? 'မနက်ဖြန်' : `${toMyanmarDigits(until)} ရက်အကြာ`;
  return { text: `${formatMyanmarDate(event.startDate)} · ${when}`, live: false };
}

function dateRangeLabel(event: EventRangeView): string {
  if (event.startDate === event.endDate) return formatMyanmarDate(event.startDate);
  return `${formatMyanmarDate(event.startDate)} – ${formatMyanmarDate(event.endDate)}`;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getMoonMarker(phase: string): string {
  if (phase === 'Full Moon') return 'full-moon';
  if (phase === 'New Moon') return 'new-moon';
  return '';
}

function shiftDate(dateStr: string, offset: number): string {
  const date = new Date(`${dateStr}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

export default function EventsPage() {
  const today = new Date();
  // ?date=YYYY-MM-DD opens a given day (shareable links, ticker taps).
  const [searchParams] = useSearchParams();
  const linkedDate = searchParams.get('date');
  const initialDate =
    linkedDate && /^\d{4}-\d{2}-\d{2}$/.test(linkedDate) && !Number.isNaN(Date.parse(linkedDate))
      ? linkedDate
      : toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
  const [viewYear, setViewYear] = useState(Number(initialDate.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(Number(initialDate.slice(5, 7)) - 1);
  const [viewMode] = useState<'month' | 'day'>('day');
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [showMarketDayChips, setShowMarketDayChips] = useState(false);
  const {
    data: selectedEventDays = [],
    isLoading: isLoadingEventDays,
    isError: isEventDaysError,
    refetch: refetchEventDays,
  } = useEventDays(selectedDate);
  const selectedPagodaFestivalEvents = selectedEventDays.filter((day) =>
    isPagodaFestival(day.eventName),
  );
  const selectedBalloonFestivalEvents = selectedEventDays.filter(
    (day) => !isPagodaFestival(day.eventName),
  );

  const { data: eventRanges = [] } = useEventRanges();
  const [slide, setSlide] = useState<'next' | 'prev' | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const cells = buildCalendarDays(viewYear, viewMonth);
  const todayStr = getLocalDateString(today);
  const eventsOn = (dateStr: string) =>
    eventRanges.filter((event) => event.startDate <= dateStr && dateStr <= event.endDate);
  const upcomingEvents = eventRanges.filter((event) => event.endDate >= todayStr).slice(0, UPCOMING_LIMIT);

  const [selectedYear, selectedMonth] = selectedDate.split('-').map(Number);
  const selectedCalendarDay = getEventsCalendarDay(selectedDate);
  const { marketDay: selectedMarketDay } = selectedCalendarDay;
  const selectedMarketTown = selectedMarketDay.markets[0]?.name.my;

  function selectDate(dateStr: string) {
    setSelectedDate(dateStr);
    const date = new Date(`${dateStr}T12:00:00Z`);
    setViewYear(date.getUTCFullYear());
    setViewMonth(date.getUTCMonth());
  }

  /** Move the strip by whole days; the slide direction drives a short animation. */
  function moveDays(offset: number) {
    if (offset === 0) return;
    setSlide(offset > 0 ? 'next' : 'prev');
    selectDate(shiftDate(selectedDate, offset));
  }

  function onStripTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }

  function onStripTouchEnd(event: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Mostly-vertical moves are page scrolls, not swipes.
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;
    moveDays(dx < 0 ? 1 : -1);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  return (
    <div>
      <div className="page-head events-page-head">
        <h1>Events</h1>
        <button
          className="calendar-today-button"
          onClick={() => moveDays(daysFrom(selectedDate, todayStr))}
          aria-current={selectedDate === todayStr ? 'date' : undefined}
          type="button"
        >
          Today
        </button>
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        {/* Day or Month Toggle */}
        {/* <div className="calendar-view-switch" role="group" aria-label="Calendar view">
          <button
            type="button"
            aria-pressed={viewMode === 'month'}
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button
            type="button"
            aria-pressed={viewMode === 'day'}
            className={viewMode === 'day' ? 'active' : ''}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
        </div> */}

        {/* Calendar Card */}
        <div className="calendar-card">
          {viewMode === 'month' ? (
            <>
              <div className="calendar-nav">
                <button onClick={prevMonth} aria-label="Previous month" type="button">‹</button>
                <span className="calendar-month">{MONTH_NAMES[viewMonth]} {viewYear}</span>
                <button onClick={nextMonth} aria-label="Next month" type="button">›</button>
              </div>

              <div className="calendar-grid calendar-dow">
                {DAY_LABELS.map((label) => (
                  <div key={label} className="calendar-dow-label">{label}</div>
                ))}
              </div>

              <div className="calendar-grid">
                {cells.map((day, idx) => {
                  if (day === null) return <div key={`empty-${idx}`} />;
                  const dateStr = toDateStr(viewYear, viewMonth, day);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === todayStr;
                  const { myanmarDate, marketDay } = getEventsCalendarDay(dateStr);
                  const moonMarker = getMoonMarker(myanmarDate.day.mp.en);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => selectDate(dateStr)}
                      className={`calendar-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                      aria-label={`${dateStr}: ${marketDay.markets[0]?.town.my} ဈေးနေ့၊ ${myanmarDate.month.my} ${myanmarDate.day.mp.my} ${myanmarDate.day.fd.my} ရက်${moonMarker ? `၊ ${moonMarker === 'full-moon' ? 'လပြည့်နေ့' : 'လကွယ်နေ့'}` : ''}`}
                      type="button"
                    >
                      <span className={`calendar-day-number ${moonMarker}`}>{day}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="calendar-nav">
                <button
                  onClick={() => moveDays(-1)}
                  aria-label="Previous day"
                  disabled={selectedDate === '0001-01-01'}
                  type="button"
                >
                  ‹
                </button>
                <div className="calendar-nav-center">
                  <span className="calendar-month">
                    {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                  </span>
                  {/* <button
                    className="calendar-today-button"
                    onClick={() => selectDate(todayStr)}
                    aria-current={selectedDate === todayStr ? 'date' : undefined}
                    type="button"
                  >
                    Today
                  </button> */}
                </div>
                <button
                  onClick={() => moveDays(1)}
                  aria-label="Next day"
                  disabled={selectedDate === '9999-12-31'}
                  type="button"
                >
                  ›
                </button>
              </div>
              <div
                key={selectedDate}
                className={`calendar-day-strip${slide ? ` slide-${slide}` : ''}`}
                onTouchStart={onStripTouchStart}
                onTouchEnd={onStripTouchEnd}
              >
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const dateStr = shiftDate(selectedDate, offset);
                  const date = new Date(`${dateStr}T12:00:00Z`);
                  const { myanmarDate, marketDay } = getEventsCalendarDay(dateStr);
                  const isToday = dateStr === todayStr;
                  const moonMarker = getMoonMarker(myanmarDate.day.mp.en);
                  const dayEvents = eventsOn(dateStr);
                  const hasPagodaFestival = dayEvents.some((event) => isPagodaFestival(event.name));

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      aria-pressed={offset === 0}
                      aria-label={`${isToday ? 'Today, ' : ''}${dateStr}: ${marketDay.markets[0]?.town.my} ဈေးနေ့၊ ${myanmarDate.month.my} ${myanmarDate.day.mp.my} ${myanmarDate.day.fd.my} ရက်${moonMarker ? `၊ ${moonMarker === 'full-moon' ? 'လပြည့်နေ့' : 'လကွယ်နေ့'}` : ''}${dayEvents.length ? `၊ ${dayEvents.map((event) => event.name).join('၊ ')}` : ''}`}
                      className={`calendar-strip-day${offset === 0 ? ' focused' : ''}${isToday ? ' today' : ''}`}
                      onClick={() => moveDays(offset)}
                    >
                      {dayEvents.length > 0 && (
                        <span
                          className={`calendar-strip-dot${hasPagodaFestival ? ' pagoda' : ''}`}
                          aria-hidden="true"
                        />
                      )}
                      <span className="calendar-strip-weekday">
                        {DAY_LABELS[date.getUTCDay()]}
                      </span>
                      <strong className={`calendar-strip-date ${moonMarker}`}>
                        {date.getUTCDate()}
                      </strong>
                      {/* <span className="calendar-strip-market">{marketDay.markets[0]?.town.my}</span> */}
                      <span className="calendar-strip-myanmar">{myanmarDate.day.mp.my} <b>{myanmarDate.day.fd.my}</b></span>
                      <span className="calendar-strip-myanmar">{myanmarDate.month.my}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Upcoming events: one compact scrolling row, so long schedules below never push it away. */}
        {upcomingEvents.length > 0 && (
          <section className="upcoming-events" aria-label="လာမည့်ပွဲများ">
            <div className="upcoming-events-row">
              {upcomingEvents.map((event) => {
                const status = upcomingStatus(event, todayStr);
                const target = event.startDate <= todayStr ? todayStr : event.startDate;
                const showing = event.startDate <= selectedDate && selectedDate <= event.endDate;
                const pagoda = isPagodaFestival(event.name);
                return (
                  <button
                    key={event.key}
                    type="button"
                    className={`upcoming-chip${showing ? ' showing' : ''}`}
                    onClick={() => moveDays(daysFrom(selectedDate, target))}
                    aria-label={`${event.name}၊ ${dateRangeLabel(event)}၊ ${status.text}`}
                    title={dateRangeLabel(event)}
                  >
                    <span className={`upcoming-chip-mark${pagoda ? ' pagoda' : ''}`} aria-hidden="true">
                      {pagoda ? '✦' : '✺'}
                    </span>
                    <span className="upcoming-chip-text">
                      <strong>{event.name}</strong>
                      <span className={status.live ? 'live' : undefined}>{status.text}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Market Day Info Card */}
        <section className="calendar-info" aria-live="polite">
          {/* <div>
            <div className="calendar-info-label">မြန်မာပြက္ခဒိန်</div>
            <strong>
              {selectedMyanmarDate.month.my} {selectedMyanmarDate.day.mp.my}{' '}
              {selectedMyanmarDate.day.fd.my} ရက်
            </strong>
          </div> */}
          <div>
            <div className="calendar-info-label">ဈေးနေ့</div>
            <button
              className="market-day-main"
              type="button"
              aria-expanded={showMarketDayChips}
              onClick={() => setShowMarketDayChips((isVisible) => !isVisible)}
            >
              <strong>{selectedMarketTown}</strong>
              <span aria-hidden="true">{showMarketDayChips ? '−' : '+'}</span>
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
            {/* <div className="calendar-holidays">
              <div className="calendar-info-label">အစိုးရရုံးပိတ်ရက်</div>
              {selectedHolidays.length > 0 ? (
                <ul>
                  {selectedHolidays.map((holiday) => (
                    <li key={holiday.id}>
                      <a href={holiday.source.url} target="_blank" rel="noreferrer">
                        {holiday.name.my}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="calendar-holiday-empty">
                  ဤရက်အတွက် မှတ်တမ်းတင်ထားသော ရုံးပိတ်ရက် မရှိပါ။
                </span>
              )}
            </div> */}
          </div>
        </section>

        {/* Festival days on the selected date */}
        {(isLoadingEventDays || isEventDaysError || selectedEventDays.length > 0) && (
          <section className="tazaungdaing-events" aria-live="polite">
            {isLoadingEventDays && <p>ပွဲအချက်အလက်များ ရယူနေသည်…</p>}
            {isEventDaysError && (
              <div className="data-error" role="alert">
                <span>အချက်အလက်များကို ရယူ၍ မရပါ။</span>
                <button
                  className="link-btn"
                  onClick={() => void refetchEventDays()}
                  type="button"
                >
                  ပြန်ကြိုးစားရန်
                </button>
              </div>
            )}
            {selectedPagodaFestivalEvents.map((day) => (
              <article className="pagoda-festival-event" key={day.key}>
                <div className="pagoda-festival-heading">
                  <span className="pagoda-festival-symbol" aria-hidden="true">✦</span>
                  <h3>{day.title}</h3>
                  {day.dayNumber && day.dayCount && (
                    <span className="event-day-count">{eventDayLabel(day.dayNumber, day.dayCount)}</span>
                  )}
                </div>
                <div className="pagoda-festival-schedule">
                  {day.entries.map((entry) => (
                    <div className="pagoda-festival-row" key={entry.key}>
                      <strong>{entry.name}</strong>
                      <span className="pagoda-festival-type">{entry.role}</span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
            {selectedBalloonFestivalEvents.map((day) => (
              <article className="tazaungdaing-event" key={day.key}>
                <div className="tazaungdaing-event-heading">
                  <h3>{day.title}</h3>
                  {day.dayNumber && day.dayCount && (
                    <span className="event-day-count">{eventDayLabel(day.dayNumber, day.dayCount)}</span>
                  )}
                </div>
                {day.entries.map((entry) =>
                  entry.href ? (
                    <Link className="tazaungdaing-participant" key={entry.key} to={entry.href}>
                      <span className="tazaungdaing-participant-main">
                        <strong>{entry.name}</strong>
                        <span className="tazaungdaing-participant-type">{entry.role}</span>
                      </span>
                      <span className="tazaungdaing-participant-ward">{entry.ward}</span>
                      <span className="tazaungdaing-participant-arrow" aria-hidden="true">›</span>
                    </Link>
                  ) : (
                    // No profile to open: still list the participant.
                    <div className="tazaungdaing-participant" key={entry.key}>
                      <span className="tazaungdaing-participant-main">
                        <strong>{entry.name}</strong>
                        <span className="tazaungdaing-participant-type">{entry.role}</span>
                      </span>
                      <span className="tazaungdaing-participant-ward">{entry.ward}</span>
                    </div>
                  ),
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
