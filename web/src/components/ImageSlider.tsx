import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useHomeSlides } from '../api/useDirectory';
import { placePath } from '../lib/routes';

interface Slide {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  to: string;
}

/** Shown until an admin picks photos in the portal (TGI-60), and in static mode. */
const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'default-places',
    title: 'Places to visit',
    subtitle: 'Viewpoints, pagodas and the lake',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=560&fit=crop',
    to: '/place-to-visit',
  },
  {
    id: 'default-food',
    title: 'Food & drinks',
    subtitle: 'Shan noodles, tea shops and cafes',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=560&fit=crop',
    to: '/category/food_places',
  },
  {
    id: 'default-hotels',
    title: 'Places to stay',
    subtitle: 'Hotels and guest houses in town',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=560&fit=crop',
    to: '/category/hotels',
  },
];

/** How long each slide stays before the next one; the progress segment fills over this time. */
const SLIDE_MS = 5000;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Home slider: photo cards with the next one peeking in. Cards scale with the
 * swipe (the incoming card grows, the outgoing one shrinks and dims), and a
 * story-style segment fills while a slide is showing.
 */
export default function ImageSlider() {
  const { data } = useHomeSlides();
  const slides: Slide[] = data?.length
    ? data.map((slide) => ({
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image_url,
        to: placePath({ entity: slide.entity, id: slide.record_id }),
      }))
    : DEFAULT_SLIDES;

  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [autoplay] = useState(() => !prefersReducedMotion());
  const paused = held || hidden || !autoplay || slides.length < 2;

  /** Per card: 0 when centred in the snap position, 1 when a full card away. Drives scale and dim. */
  const updateCards = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const start = track.scrollLeft + parseFloat(getComputedStyle(track).scrollPaddingLeft || '0');
    let nearest = 0;
    let nearestDistance = Infinity;
    cards.forEach((card, index) => {
      const distance = (card.offsetLeft - start) / card.offsetWidth;
      card.style.setProperty('--away', String(Math.min(1, Math.abs(distance))));
      if (Math.abs(distance) < nearestDistance) {
        nearestDistance = Math.abs(distance);
        nearest = index;
      }
    });
    setActive(nearest);
  }, []);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(updateCards);
  };

  useEffect(() => {
    updateCards();
    return () => cancelAnimationFrame(frame.current);
  }, [updateCards, slides.length]);

  // New slide list (admin photos arrived) → start from the first.
  const slideKey = slides.map((slide) => slide.id).join('|');
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    setActive(0);
  }, [slideKey]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    const padding = parseFloat(getComputedStyle(track).scrollPaddingLeft || '0');
    track.scrollTo({ left: card.offsetLeft - padding, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <section
      className={`home-slider${paused ? ' paused' : ''}`}
      aria-roledescription="carousel"
      aria-label="Featured places"
      onPointerDown={() => setHeld(true)}
      onPointerUp={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
      onPointerLeave={() => setHeld(false)}
    >
      <div className="home-slider-track" ref={trackRef} onScroll={onScroll}>
        {slides.map((slide, index) => (
          <Link
            key={slide.id}
            to={slide.to}
            className="home-slide"
            aria-roledescription="slide"
            aria-label={`${slide.title}, ${index + 1} of ${slides.length}`}
            draggable={false}
          >
            <img
              src={slide.image}
              alt=""
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
            />
            <span className="home-slide-caption">
              <span className="home-slide-text">
                <strong>{slide.title}</strong>
                {slide.subtitle && <span>{slide.subtitle}</span>}
              </span>
              <ChevronRight size={20} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="home-slider-progress">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`home-slider-segment${index < active ? ' seen' : ''}`}
              aria-label={`Show slide ${index + 1}`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => goTo(index)}
            >
              {index === active && (
                // Keyed by slide so the fill restarts; when it finishes the next slide comes in.
                <span
                  key={`${slide.id}-${active}`}
                  className="home-slider-fill"
                  style={{ '--slide-ms': `${SLIDE_MS}ms` } as CSSProperties}
                  onAnimationEnd={() => goTo((active + 1) % slides.length)}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
