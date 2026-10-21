import { festivalTone } from '../lib/festivals';
import type { EventRangeView } from '../types';

/**
 * Festival bars under a row of day columns (day strip and month weeks).
 * `dates` lists each column's date; null columns (outside the month) end a
 * band. A band's end is rounded on the festival's first or last day and flat
 * where the festival carries on past the row. Each festival gets its own line.
 */
export default function FestivalBands({ dates, events }: { dates: (string | null)[]; events: EventRangeView[] }) {
  const bands = events
    .map((event) => {
      let first = -1;
      let last = -1;
      dates.forEach((date, index) => {
        if (date && event.startDate <= date && date <= event.endDate) {
          if (first < 0) first = index;
          last = index;
        }
      });
      return { event, first, last };
    })
    .filter((band) => band.first >= 0)
    .sort((a, b) => a.event.startDate.localeCompare(b.event.startDate) || a.event.name.localeCompare(b.event.name));

  if (bands.length === 0) return null;

  return (
    <div
      className="festival-bands"
      style={{ gridTemplateColumns: `repeat(${dates.length}, minmax(0, 1fr))` }}
      aria-hidden="true"
    >
      {bands.map(({ event, first, last }, row) => (
        <span
          key={event.key}
          className={[
            'festival-band',
            `tone-${festivalTone(event.name)}`,
            event.startDate === dates[first] ? 'starts' : '',
            event.endDate === dates[last] ? 'ends' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ gridColumn: `${first + 1} / ${last + 2}`, gridRow: row + 1 }}
        >
          {event.name}
        </span>
      ))}
    </div>
  );
}
