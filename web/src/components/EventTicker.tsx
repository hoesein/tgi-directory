import { Bell } from 'lucide-react';

const TODAY_EVENTS = [
  { id: 1, title: 'Tech Meetup', time: '10:00 AM' },
  { id: 2, title: 'Lunch with Team', time: '12:30 PM' },
];

export default function EventTicker() {
  const items = [...TODAY_EVENTS, ...TODAY_EVENTS];

  return (
    <div className="event-ticker">
      <div className="event-ticker-label">
        <Bell size={16} className="event-ticker-bell" />
      </div>
      <div className="event-ticker-viewport">
        <div className="event-ticker-track">
          {items.map((event, i) => (
            <div key={`${event.id}-${i}`} className="event-ticker-item">
              <span className="event-ticker-dot" />
              <span className="event-ticker-title">{event.title}</span>
              <span className="event-ticker-time">{event.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
