import { useEffect, useRef, useState } from 'react';
import { Bell, CalendarDays, Sparkles, Store } from 'lucide-react';
import { HorizontalTicker } from 'react-infinite-ticker';
import { Link } from 'react-router-dom';
import { getEventsCalendarDay, getLocalDateString } from '../lib/eventsCalendar';

export default function EventTicker() {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const calendarDay = getEventsCalendarDay(getLocalDateString(new Date()));
  const items = [
    {
      id: 'today',
      icon: CalendarDays,
      label: 'ယနေ့',
      detail: calendarDay.myanmarDate.month.my + ' ' + calendarDay.myanmarDate.day.mp.my + ' ' + calendarDay.myanmarDate.day.fd.my + ' ရက်',
    },
    {
      id: 'market-day',
      icon: Store,
      label: 'ဈေးနေ့',
      detail: calendarDay.marketDay.markets[0]?.name.my,
    },
    ...calendarDay.holidays.map((holiday) => ({
      id: holiday.id,
      icon: CalendarDays,
      label: 'ရုံးပိတ်ရက်',
      detail: holiday.name.my,
    })),
    ...calendarDay.specialEvents.map((event) => ({
      id: `special-${event}`,
      icon: Sparkles,
      label: 'ထူးခြားနေ့',
      detail: event,
    })),
  ];

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateWidth = () => setViewportWidth(viewport.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return (
    <Link
      className="event-ticker"
      to="/events"
      aria-label="ယနေ့ ဈေးနေ့၊ ရုံးပိတ်ရက်နှင့် ထူးခြားနေ့များကို ကြည့်ရန်"
    >
      {/* <span className="event-ticker-label">
        <Bell size={16} className="event-ticker-bell" />
      </span> */}
      <span className="event-ticker-viewport" aria-hidden="true" ref={viewportRef}>
        <HorizontalTicker duration={24000} easing="ease-in">
          <span className="event-ticker-track">
            <span
              className="event-ticker-start-spacer"
              style={{ flexBasis: `${viewportWidth}px` }}
            />
            {items.map((item) => (
              <span className="event-ticker-item" key={item.id}>
                <item.icon
                  className="event-ticker-item-icon"
                  size={15}
                  aria-label={item.label}
                  role="img"
                />
                <span>{item.detail}</span>
              </span>
            ))}
          </span>
        </HorizontalTicker>
      </span>
    </Link>
  );
}
