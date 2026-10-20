/**
 * Grey placeholder shapes shown while data loads, in the layout the real
 * content will take (instead of "Loading…" text). Hidden from screen readers;
 * the wrappers announce "Loading" once.
 */

function Bar({ width, height = 12 }: { width: string; height?: number }) {
  return <span className="sk sk-bar" style={{ width, height }} />;
}

/** Rows like the category list: thumbnail plus three lines. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="sk-list" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, index) => (
        <div className="sk-row" key={index} aria-hidden="true">
          <span className="sk sk-thumb" />
          <span className="sk-lines">
            <Bar width="62%" height={15} />
            <Bar width="35%" />
            <Bar width="80%" />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Horizontal cards like "Nearest Place". */
export function CardRowSkeleton({ cards = 3 }: { cards?: number }) {
  return (
    <div className="sk-card-row" role="status" aria-label="Loading">
      {Array.from({ length: cards }, (_, index) => (
        <div className="sk-card" key={index} aria-hidden="true">
          <span className="sk sk-card-image" />
          <span className="sk-lines">
            <Bar width="70%" height={14} />
            <Bar width="90%" />
            <Bar width="40%" />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Icon grid like Categories. */
export function IconGridSkeleton({ cells = 8 }: { cells?: number }) {
  return (
    <div className="sk-icon-grid" role="status" aria-label="Loading">
      {Array.from({ length: cells }, (_, index) => (
        <div className="sk-icon-cell" key={index} aria-hidden="true">
          <span className="sk sk-icon" />
          <Bar width="64%" height={10} />
        </div>
      ))}
    </div>
  );
}

/** Two-column photo grid like Places to Visit. */
export function PhotoGridSkeleton({ cells = 4 }: { cells?: number }) {
  return (
    <div className="places-grid" role="status" aria-label="Loading">
      {Array.from({ length: cells }, (_, index) => (
        <div className="sk-photo-card" key={index} aria-hidden="true">
          <span className="sk sk-photo" />
          <span className="sk-lines">
            <Bar width="75%" height={13} />
            <Bar width="45%" />
          </span>
        </div>
      ))}
    </div>
  );
}

/** Place page: photo, action buttons, title and info cards. */
export function DetailSkeleton() {
  return (
    <div className="sk-detail" role="status" aria-label="Loading">
      <span className="sk sk-hero" aria-hidden="true" />
      <div className="sk-detail-body" aria-hidden="true">
        <Bar width="55%" height={24} />
        <div className="sk-info-grid">
          <span className="sk sk-info" />
          <span className="sk sk-info" />
          <span className="sk sk-info wide" />
          <span className="sk sk-info wide" />
        </div>
        <span className="sk sk-block" />
      </div>
    </div>
  );
}

/** A festival card: title row and a few schedule rows. */
export function EventCardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="sk-event" role="status" aria-label="Loading">
      <div className="sk-event-head" aria-hidden="true">
        <Bar width="45%" height={15} />
      </div>
      {Array.from({ length: rows }, (_, index) => (
        <div className="sk-event-row" key={index} aria-hidden="true">
          <Bar width="50%" height={13} />
          <Bar width="18%" />
        </div>
      ))}
    </div>
  );
}
