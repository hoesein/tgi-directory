import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { useDirectoryAsCategories } from '../api/useDirectory';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MOCK_EVENTS = [
  { id: 1, title: 'Tech Meetup', time: '10:00 AM', date: '2026-09-27' },
  { id: 2, title: 'Lunch with Team', time: '12:30 PM', date: '2026-09-27' },
  { id: 3, title: 'Project Demo', time: '03:00 PM', date: '2026-09-28' },
  { id: 4, title: 'Design Review', time: '11:00 AM', date: '2026-09-20' },
  { id: 5, title: 'Community Fair', time: '09:00 AM', date: '2026-09-15' },
];

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

export default function EventsPage() {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    toDateStr(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const cells = buildCalendarDays(viewYear, viewMonth);
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const filteredEvents = MOCK_EVENTS.filter((e) => e.date === selectedDate);

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
      <div className="page-head">
        <h1>Events</h1>
        <span style={{ width: 24 }} />
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <div className="calendar-card">
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
              const hasEvents = MOCK_EVENTS.some((e) => e.date === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`calendar-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  type="button"
                >
                  {day}
                  {hasEvents && <span className="event-dot" />}
                </button>
              );
            })}
          </div>
        </div>

        <h2 className="events-heading">
          {selectedDate === todayStr ? "Today's Events" : `Events on ${selectedDate}`}
        </h2>

        {filteredEvents.length > 0 ? (
          <ul className="events-list">
            {filteredEvents.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-icon">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <div className="event-title">{event.title}</div>
                  <div className="event-time">{event.time}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="events-empty">No events for this day.</div>
        )}
      </div>
    </div>
  );
}
