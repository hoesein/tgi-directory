import { useState } from 'react';
import CategoryIcon from './CategoryIcon';

interface PlaceImageProps {
  src: string | null | undefined;
  alt: string;
  /** Entity code; picks the placeholder icon. */
  entity: string;
  className?: string;
  iconSize?: number;
}

/** A place photo, or a tinted tile with the category icon when there is none (or it fails to load). */
export default function PlaceImage({ src, alt, entity, className, iconSize = 32 }: PlaceImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`place-image-placeholder ${className ?? ''}`} role="img" aria-label={alt}>
        <CategoryIcon id={entity} name="" size={iconSize} />
      </div>
    );
  }

  return (
    <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />
  );
}
