import { useEffect, useRef, useState, type ComponentType } from 'react';
import { CalendarClock, CalendarDays, PartyPopper, Sparkles, Store, Users } from 'lucide-react';
import { HorizontalTicker } from 'react-infinite-ticker';
import { Link } from 'react-router-dom';
import { useEventDays, useEventRanges } from '../api/useDirectory';
import { getEventsCalendarDay, getLocalDateString } from '../lib/eventsCalendar';
import { eventDayLabel, toMyanmarDigits } from '../lib/myanmar';
import { daysBetween } from '../services/directory';

/** Upcoming events further away than this are left out of the ticker. */
const UPCOMING_WINDOW_DAYS = 30;
/** Up to this many participants are named; more are shown as a count. */
const MAX_NAMED_ENTRIES = 4;

interface TickerItem {
  id: string;
  icon: ComponentType<{ className?: string; size?: number; 'aria-label'?: string; role?: string }>;
  label: string;
  detail: string;
  /** Highlighted (event running today). */
  accent?: boolean;
}

export default function EventTicker() {
  const viewportRef = useRef<HTMLSpanElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const today = getLocalDateString(new Date());
  const calendarDay = getEventsCalendarDay(today);
  const { data: eventRanges = [] } = useEventRanges();
  const { data: todaysEventDays = [] } = useEventDays(today);

  const currentEvents = eventRanges.filter((event) => event.startDate <= today && today <= event.endDate);
  const nextEvent = eventRanges
    .filter((event) => event.startDate > today && daysBetween(today, event.startDate) <= UPCOMING_WINDOW_DAYS)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];

  const eventItems: TickerItem[] = [];
  for (const event of currentEvents) {
    const dayCount = daysBetween(event.startDate, event.endDate) + 1;
    const dayNumber = daysBetween(event.startDate, today) + 1;
    eventItems.push({
      id: `event-${event.key}`,
      icon: PartyPopper,
      label: 'ယနေ့ပွဲ',
      detail: dayCount > 1 ? `${event.name} · ${eventDayLabel(dayNumber, dayCount)}` : event.name,
      accent: true,
    });
  }
  // Today's lineup: names when short, a count when the list is long (e.g. 20+ at Tazaungdaing).
  for (const day of todaysEventDays) {
    if (day.entries.length === 0) continue;
    eventItems.push({
      id: `lineup-${day.key}`,
      icon: Users,
      label: 'ပွဲဝင်',
      detail:
        day.entries.length <= MAX_NAMED_ENTRIES
          ? day.entries.map((entry) => (entry.role ? `${entry.name} (${entry.role})` : entry.name)).join('၊ ')
          : `${day.title} · ပွဲဝင် ${toMyanmarDigits(day.entries.length)} ဖွဲ့`,
    });
  }

  const items: TickerItem[] = [
    {
      id: 'today',
      icon: CalendarDays,
      label: 'ယနေ့',
      detail: calendarDay.myanmarDate.month.my + ' ' + calendarDay.myanmarDate.day.mp.my + ' ' + calendarDay.myanmarDate.day.fd.my + ' ရက်',
    },
    ...eventItems,
    {
      id: 'market-day',
      icon: Store,
      label: 'ဈေးနေ့',
      detail: calendarDay.marketDay.markets[0]?.name.my ?? '',
    },
    ...(nextEvent
      ? [
          {
            id: `next-${nextEvent.key}`,
            icon: CalendarClock,
            label: 'လာမည့်ပွဲ',
            detail: `${nextEvent.name} · ${
              daysBetween(today, nextEvent.startDate) === 1
                ? 'မနက်ဖြန်'
                : `${toMyanmarDigits(daysBetween(today, nextEvent.startDate))} ရက်အကြာ`
            }`,
          },
        ]
      : []),
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

  // Event data arrives after the first render; a new key restarts the ticker with the full track.
  const trackKey = items.map((item) => item.id).join('|');
  // Longer tracks scroll for longer so the speed stays readable.
  const duration = Math.max(24000, items.reduce((total, item) => total + item.detail.length, 0) * 220);

  return (
    <Link
      className="event-ticker"
      to="/events"
      aria-label="ယနေ့ ပွဲတော်များ၊ ဈေးနေ့၊ ရုံးပိတ်ရက်နှင့် ထူးခြားနေ့များကို ကြည့်ရန်"
    >
      <span className="event-ticker-viewport" aria-hidden="true" ref={viewportRef}>
        <HorizontalTicker key={trackKey} duration={duration} easing="ease-in">
          <span className="event-ticker-track">
            <span
              className="event-ticker-start-spacer"
              style={{ flexBasis: `${viewportWidth}px` }}
            />
            {items.map((item) => (
              <span className={`event-ticker-item${item.accent ? ' accent' : ''}`} key={item.id}>
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
