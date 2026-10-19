import { useRef, useState } from 'react';
import PlaceImage from './PlaceImage';

interface PhotoGalleryProps {
  images: string[];
  alt: string;
  entity: string;
}

/** Swipeable hero photos (CSS scroll-snap) with a counter and dots. */
export default function PhotoGallery({ images, alt, entity }: PhotoGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (images.length <= 1) {
    return <PlaceImage className="gallery-slide" src={images[0]} alt={alt} entity={entity} iconSize={64} />;
  }

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const goTo = (target: number) => {
    const track = trackRef.current;
    track?.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="gallery" aria-roledescription="carousel" aria-label={`${alt} photos`}>
      <div className="gallery-track" ref={trackRef} onScroll={handleScroll}>
        {images.map((src, position) => (
          <PlaceImage
            key={src}
            className="gallery-slide"
            src={src}
            alt={`${alt} — photo ${position + 1} of ${images.length}`}
            entity={entity}
            iconSize={64}
          />
        ))}
      </div>
      <span className="gallery-counter" aria-live="polite">
        {index + 1} / {images.length}
      </span>
      <div className="gallery-dots">
        {images.map((src, position) => (
          <button
            key={src}
            className={`gallery-dot${position === index ? ' active' : ''}`}
            onClick={() => goTo(position)}
            aria-label={`Show photo ${position + 1}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}
