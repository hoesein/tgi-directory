import { festivalTone } from '../lib/festivals';
import type { EventRangeView } from '../types';

/**
 * Thin coloured lines along the bottom of a day cell, one per festival on
 * that day, in the festival's colour. Takes no extra height (TGI-63).
 * The day's aria-label names the festivals.
 */
export default function FestivalMarks({ events }: { events: EventRangeView[] }) {
  if (events.length === 0) return null;
  return (
    <span className="festival-marks" aria-hidden="true">
      {events.map((event) => (
        <span key={event.key} className={`festival-mark tone-${festivalTone(event.name)}`} />
      ))}
    </span>
  );
}
