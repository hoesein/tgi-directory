import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTazaungdaingEvents } from '../api/useDirectory';
import { getEventsCalendarDay, getLocalDateString } from '../lib/eventsCalendar';

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
  const {
    data: tazaungdaingEvents,
    isLoading: isLoadingTazaungdaingEvents,
    isError: isTazaungdaingEventsError,
    refetch: refetchTazaungdaingEvents,
  } = useTazaungdaingEvents();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewMode] = useState<'month' | 'day'>('day');
  const [selectedDate, setSelectedDate] = useState(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const selectedTazaungdaingEvents =
    tazaungdaingEvents?.filter((event) => event.event_date === selectedDate) ?? [];

  const cells = buildCalendarDays(viewYear, viewMonth);
  const todayStr = getLocalDateString(today);

  const [selectedYear, selectedMonth] = selectedDate.split('-').map(Number);
  const selectedCalendarDay = getEventsCalendarDay(selectedDate);
  const { myanmarDate: selectedMyanmarDate, marketDay: selectedMarketDay } = selectedCalendarDay;
  const selectedHolidays = selectedCalendarDay.holidays;
  const selectedMarketTown = selectedMarketDay.markets[0]?.name.my;

  function selectDate(dateStr: string) {
    setSelectedDate(dateStr);
    const date = new Date(`${dateStr}T12:00:00Z`);
    setViewYear(date.getUTCFullYear());
    setViewMonth(date.getUTCMonth());
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
          onClick={() => selectDate(todayStr)}
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
                  onClick={() => selectDate(shiftDate(selectedDate, -1))}
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
                  onClick={() => selectDate(shiftDate(selectedDate, 1))}
                  aria-label="Next day"
                  disabled={selectedDate === '9999-12-31'}
                  type="button"
                >
                  ›
                </button>
              </div>
              <div className="calendar-day-strip">
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const dateStr = shiftDate(selectedDate, offset);
                  const date = new Date(`${dateStr}T12:00:00Z`);
                  const { myanmarDate, marketDay } = getEventsCalendarDay(dateStr);
                  const isToday = dateStr === todayStr;
                  const moonMarker = getMoonMarker(myanmarDate.day.mp.en);

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      aria-pressed={offset === 0}
                      aria-label={`${dateStr}: ${marketDay.markets[0]?.town.my} ဈေးနေ့၊ ${myanmarDate.month.my} ${myanmarDate.day.mp.my} ${myanmarDate.day.fd.my} ရက်${moonMarker ? `၊ ${moonMarker === 'full-moon' ? 'လပြည့်နေ့' : 'လကွယ်နေ့'}` : ''}`}
                      className={`calendar-strip-day${offset === 0 ? ' focused' : ''}${isToday ? ' today' : ''}`}
                      onClick={() => selectDate(dateStr)}
                    >
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
            <strong>{selectedMarketTown}</strong>
            <details className="market-list">
              <summary>အခြားဈေးနေ့များ</summary>
              <ul>
                {selectedMarketDay.markets.map((market) => (
                  <li key={market.id}>{market.name.my}</li>
                ))}
              </ul>
            </details>
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

        {/* Tazaungdaing Events Section */}
        {(isLoadingTazaungdaingEvents || isTazaungdaingEventsError || selectedTazaungdaingEvents.length > 0) && (
          <section className="tazaungdaing-events" aria-live="polite">
            {/* <h2>တန်ဆောင်တိုင်ပွဲများ</h2> */}
            {isLoadingTazaungdaingEvents && <p>ပွဲအချက်အလက်များ ရယူနေသည်…</p>}
            {isTazaungdaingEventsError && (
              <div className="data-error" role="alert">
                <span>တန်ဆောင်တိုင်ပွဲ အချက်အလက်များကို ရယူ၍ မရပါ။</span>
                <button
                  className="link-btn"
                  onClick={() => void refetchTazaungdaingEvents()}
                  type="button"
                >
                  ပြန်ကြိုးစားရန်
                </button>
              </div>
            )}
            {selectedTazaungdaingEvents.map((event) => (
              <article className="tazaungdaing-event" key={`${event.event_date}-${event.name}`}>
                <div className="tazaungdaing-event-heading">
                  <h3>{event.name}</h3>
                  {/* <time dateTime={event.event_date}>{event.event_date}</time> */}
                </div>
                {event.participants.sort((a, b) => a.type.localeCompare(b.type))
                  .map((participant, participantIndex) => (
                    <Link
                      className="tazaungdaing-participant"
                      key={`${participant.name}-${participant.type}`}
                      to={`/events/tazaungdaing/${encodeURIComponent(event.event_date)}/${participantIndex}`}
                    >
                      <span className="tazaungdaing-participant-main">
                        <strong>{participant.name}</strong>
                        <span className="tazaungdaing-participant-type">{participant.type}</span>
                      </span>
                      <span className="tazaungdaing-participant-ward">{participant.ward}</span>
                      <span className="tazaungdaing-participant-arrow" aria-hidden="true">›</span>
                    </Link>
                  ))}
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
