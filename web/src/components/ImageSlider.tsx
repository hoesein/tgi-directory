import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

/** How long each slide stays before the next one slides in. */
const SLIDE_MS = 5000;
/** No scroll events for this long → the swipe or smooth scroll has settled. */
const SETTLE_MS = 120;

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Home slider: photo cards with the next one peeking in. Cards scale with the
 * swipe (the incoming card grows, the outgoing one shrinks and dims).
 *
 * It loops: the track is [copy of last, ...slides, copy of first]. When a
 * swipe or autoplay settles on a copy, the track jumps without animation to
 * the real slide it copies, so the photos seem to go round forever.
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
  const loop = slides.length > 1;
  const track: { slide: Slide; key: string; real: number }[] = loop
    ? [
        { slide: slides[slides.length - 1], key: `${slides[slides.length - 1].id}-before`, real: slides.length - 1 },
        ...slides.map((slide, index) => ({ slide, key: slide.id, real: index })),
        { slide: slides[0], key: `${slides[0].id}-after`, real: 0 },
      ]
    : slides.map((slide, index) => ({ slide, key: slide.id, real: index }));
  /** Track position of the first real slide. */
  const first = loop ? 1 : 0;

  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const settleTimer = useRef(0);
  const [position, setPosition] = useState(first);
  const [held, setHeld] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [autoplay] = useState(() => !prefersReducedMotion());
  const paused = held || hidden || !autoplay || !loop;

  const cardLeft = useCallback((index: number) => {
    const element = trackRef.current;
    const card = element?.children[index] as HTMLElement | undefined;
    if (!element || !card) return null;
    return card.offsetLeft - parseFloat(getComputedStyle(element).scrollPaddingLeft || '0');
  }, []);

  /** Per card: 0 when in the snap position, 1 when a full card away. Drives scale and dim. */
  const updateCards = useCallback(() => {
    const element = trackRef.current;
    if (!element) return;
    const cards = Array.from(element.children) as HTMLElement[];
    const start = element.scrollLeft + parseFloat(getComputedStyle(element).scrollPaddingLeft || '0');
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
    setPosition(nearest);
    return nearest;
  }, []);

  /** Jump without animation to a track position. */
  const jumpTo = useCallback(
    (index: number) => {
      const element = trackRef.current;
      const left = cardLeft(index);
      if (!element || left === null) return;
      element.scrollTo({ left, behavior: 'auto' });
      updateCards();
    },
    [cardLeft, updateCards],
  );

  /** After a swipe or autoplay settles on a copy, swap to the real slide it shows. */
  const settle = useCallback(() => {
    if (!loop) return;
    const nearest = updateCards();
    if (nearest === 0) jumpTo(slides.length);
    else if (nearest === slides.length + 1) jumpTo(1);
  }, [jumpTo, loop, slides.length, updateCards]);

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(updateCards);
    window.clearTimeout(settleTimer.current);
    // While a finger is down the swipe isn't over; release calls settle.
    if (!held) settleTimer.current = window.setTimeout(settle, SETTLE_MS);
  };

  // New slide list (admin photos arrived) → start from the first real slide.
  const slideKey = slides.map((slide) => slide.id).join('|');
  useLayoutEffect(() => {
    jumpTo(first);
  }, [slideKey, first, jumpTo]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      window.clearTimeout(settleTimer.current);
    },
    [],
  );

  useEffect(() => {
    const onVisibility = () => setHidden(document.visibilityState === 'hidden');
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Autoplay: always forward; past the last slide comes the copy of the first.
  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => {
      const element = trackRef.current;
      const left = cardLeft(position + 1);
      if (element && left !== null) element.scrollTo({ left, behavior: 'smooth' });
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [cardLeft, paused, position]);

  const release = () => {
    setHeld(false);
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(settle, SETTLE_MS * 3);
  };

  return (
    <section
      className="home-slider"
      aria-roledescription="carousel"
      aria-label="Featured places"
      onPointerDown={() => setHeld(true)}
      onPointerUp={release}
      onPointerCancel={release}
      onPointerLeave={() => held && release()}
    >
      <div className="home-slider-track" ref={trackRef} onScroll={onScroll}>
        {track.map(({ slide, key, real }, index) => {
          const copy = loop && (index === 0 || index === track.length - 1);
          return (
            <Link
              key={key}
              to={slide.to}
              className="home-slide"
              aria-roledescription="slide"
              aria-label={`${slide.title}, ${real + 1} of ${slides.length}`}
              // The copies at each end are only there for the loop.
              aria-hidden={copy || undefined}
              tabIndex={copy ? -1 : undefined}
              draggable={false}
            >
              <img
                src={slide.image}
                alt=""
                loading={index === first ? 'eager' : 'lazy'}
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
          );
        })}
      </div>
    </section>
  );
}
