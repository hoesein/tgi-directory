import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface PhotoViewerProps {
  photos: string[];
  /** Photo to show first. */
  startIndex: number;
  /** Used in alt text and the dialog label, e.g. the participant's name. */
  title: string;
  onClose: () => void;
}

/**
 * Full-screen photo popup. Swipe (or the arrows / arrow keys) moves between
 * photos; the ✕, Escape or a tap on the dark area closes it.
 */
export default function PhotoViewer({ photos, startIndex, title, onClose }: PhotoViewerProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const frame = useRef(0);
  const [index, setIndex] = useState(startIndex);

  const goTo = useCallback((next: number, smooth = true) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(next, track.children.length - 1));
    track.scrollTo({ left: target * track.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  // Open on the tapped photo without animating there.
  useLayoutEffect(() => {
    goTo(startIndex, false);
  }, [goTo, startIndex]);

  // Focus the close button, stop the page behind from scrolling, and give
  // focus back to the tapped thumbnail on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') goTo(index + 1);
      if (event.key === 'ArrowLeft') goTo(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, index, onClose]);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (track) setIndex(Math.round(track.scrollLeft / track.clientWidth));
    });
  };

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const many = photos.length > 1;

  // Rendered on <body>: the page wrapper animates with transform, which would
  // otherwise pin this fixed overlay to the page instead of the screen.
  return createPortal(
    <div className="photo-viewer" role="dialog" aria-modal="true" aria-label={`${title} photos`}>
      <div className="photo-viewer-bar">
        <span className="photo-viewer-count" aria-live="polite">
          {index + 1} / {photos.length}
        </span>
        <button ref={closeRef} className="photo-viewer-btn" onClick={onClose} aria-label="Close photos" type="button">
          <X size={22} />
        </button>
      </div>

      <div className="photo-viewer-track" ref={trackRef} onScroll={onScroll}>
        {photos.map((src, photoIndex) => (
          // Tapping the dark area around a photo closes the viewer.
          <div
            key={src}
            className="photo-viewer-slide"
            onClick={(event) => event.target === event.currentTarget && onClose()}
          >
            <img
              src={src}
              alt={`${title} photo ${photoIndex + 1} of ${photos.length}`}
              loading={Math.abs(photoIndex - startIndex) <= 1 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          <button
            className="photo-viewer-btn photo-viewer-prev"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Previous photo"
            type="button"
          >
            <ChevronLeft size={26} />
          </button>
          <button
            className="photo-viewer-btn photo-viewer-next"
            onClick={() => goTo(index + 1)}
            disabled={index === photos.length - 1}
            aria-label="Next photo"
            type="button"
          >
            <ChevronRight size={26} />
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}
