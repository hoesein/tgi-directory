import { useEffect, useRef, useState } from 'react';

interface SliderItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

const SLIDER_DATA: SliderItem[] = [
  {
    id: '1',
    title: 'Famous Places',
    subtitle: 'Explore top attractions',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
  },
  {
    id: '2',
    title: 'Best Restaurants',
    subtitle: 'Top dining experiences',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=200&fit=crop',
  },
  {
    id: '3',
    title: 'Popular Cafes',
    subtitle: 'Cozy coffee spots',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=200&fit=crop',
  },
];

export default function ImageSlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % SLIDER_DATA.length;
        const track = trackRef.current;
        if (track) track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' });
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goTo = (index: number) => {
    setActiveIndex(index);
    const track = trackRef.current;
    if (track) track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.min(Math.max(index, 0), SLIDER_DATA.length - 1));
  };

  return (
    <div className="slider">
      <div className="slider-track" ref={trackRef} onScroll={handleScroll}>
        {SLIDER_DATA.map((item) => (
          <div key={item.id} className="slide">
            <img src={item.image} alt={item.title} loading="lazy" />
            <div className="slide-overlay" />
            <div className="slide-text">
              <h2>{item.title}</h2>
              <p>{item.subtitle}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="slider-dots">
        {SLIDER_DATA.map((item, index) => (
          <button
            key={item.id}
            className={`dot${activeIndex === index ? ' active' : ''}`}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
