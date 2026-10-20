import { useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Building2, Map as MapIcon, MapPin, PencilLine, Phone, Share2, Star, Tag, X } from 'lucide-react';
import { canSuggest } from '../services/suggestions';
import BackButton from '../components/BackButton';
import { DetailSkeleton } from '../components/Skeleton';
import { shareLink } from '../lib/share';
import { useDirectoryPlace } from '../api/useDirectory';
import RatingControl from '../components/RatingControl';
import RatingSummary from '../components/RatingSummary';
import PhotoGallery from '../components/PhotoGallery';
import { parseStaticListingId } from '../services/directory';
import { canRate } from '../services/ratings';
import { placePath } from '../lib/routes';

const updatedFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
/** Longer descriptions start collapsed behind "Read more". */
const DESCRIPTION_PREVIEW = 220;

function InfoCard({ icon, label, wide, children }: { icon: ReactNode; label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`info-card${wide ? ' wide' : ''}`}>
      <span className="info-card-icon" aria-hidden="true">
        {icon}
      </span>
      <div className="info-card-text">
        <dt>{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  );
}

/**
 * Place detail. Routes: /place/:entity/:listingId, and the old
 * /category-detail/dir--<file>--<index> (entity comes from the id).
 */
export default function CategoryDetailPage() {
  const params = useParams();
  const listingId = decodeURIComponent(params.listingId ?? '');
  const entity = params.entity ?? parseStaticListingId(listingId)?.file.replace(/\.json$/, '');
  const [isPhonePickerOpen, setIsPhonePickerOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const { data: place, isLoading, isError: dataError, refetch: retryData } = useDirectoryPlace(entity, listingId);

  // Split on commas, semicolons or slashes only: numbers often contain spaces ("09 4000 64138").
  const phoneNumbers = place?.phone
    ? place.phone
        .split(/[,;/]+/)
        .map((number) => number.trim())
        .filter(Boolean)
    : [];

  useEffect(() => {
    if (!isPhonePickerOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPhonePickerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isPhonePickerOpen]);

  if (!place && isLoading) return <DetailSkeleton />;

  if (!place) {
    return (
      <div className="centered">
        {dataError ? (
          <>
            <p role="alert">Couldn’t load this listing’s directory data.</p>
            <button className="link-btn" onClick={() => void retryData()} type="button">
              Retry
            </button>
          </>
        ) : (
          <p>Listing not found</p>
        )}
      </div>
    );
  }

  const rateable = canRate(place.entity);
  const suggestable = canSuggest() && !parseStaticListingId(place.id);
  const hasMapTarget = (place.latitude !== null && place.longitude !== null) || !!place.address;
  const description = place.description?.trim() ?? '';
  const longDescription = description.length > DESCRIPTION_PREVIEW;
  const shownDescription =
    longDescription && !showFullDescription ? `${description.slice(0, DESCRIPTION_PREVIEW).trimEnd()}…` : description;

  return (
    <div className="place-page">
      <div className="detail-hero">
        <PhotoGallery images={place.imageUrls} alt={place.name} entity={place.entity} />
        <BackButton variant="fab" />
        <button
          className={`hero-fab ${suggestable ? 'hero-fab-right-2' : 'hero-fab-right'}`}
          type="button"
          aria-label="Share"
          title="Share"
          onClick={() =>
            void shareLink({
              title: place.name,
              text: [place.name, place.type.name, place.address].filter(Boolean).join(' · '),
              path: placePath(place),
            })
          }
        >
          <Share2 size={18} />
        </button>
        {suggestable && (
          <Link
            className="hero-fab hero-fab-right"
            to={`${placePath(place)}/suggest`}
            aria-label="Suggest an edit"
            title="Suggest an edit"
          >
            <PencilLine size={19} />
          </Link>
        )}
      </div>

      {/* Call and Map straddle the bottom edge of the photo, above the title. */}
      <div className="category-detail-actions">
        {phoneNumbers.length === 1 ? (
          <a className="category-detail-action" href={`tel:${phoneNumbers[0].replace(/\s+/g, '')}`}>
            <Phone size={19} />
            <span>Call</span>
          </a>
        ) : (
          <button
            className="category-detail-action"
            disabled={phoneNumbers.length === 0}
            onClick={() => setIsPhonePickerOpen(true)}
            type="button"
          >
            <Phone size={19} />
            <span>Call</span>
          </button>
        )}
        {hasMapTarget ? (
          <Link className="category-detail-action" to={`${placePath(place)}/map`}>
            <MapIcon size={19} />
            <span>Map</span>
          </Link>
        ) : (
          <span className="category-detail-action disabled" aria-disabled="true">
            <MapIcon size={19} />
            <span>Map</span>
          </span>
        )}
      </div>

      <div className="place-body">
        <header className="place-title">
          <h1>{place.name}</h1>
          {/* The category card below already names the type; the title row only adds the community score. */}
          {rateable && place.userRating?.count ? (
            <div className="place-subtitle">
              <RatingSummary summary={place.userRating} />
            </div>
          ) : null}
        </header>

        <dl className="info-grid">
          {place.type.name && (
            <InfoCard icon={<Tag size={17} />} label="Category">
              {place.type.name}
            </InfoCard>
          )}
          {place.township && (
            <InfoCard icon={<Building2 size={17} />} label="Township">
              {place.township.name}
            </InfoCard>
          )}
          {place.address && (
            <InfoCard icon={<MapPin size={17} />} label="Address" wide>
              {place.address}
            </InfoCard>
          )}
          {phoneNumbers.length > 0 && (
            <InfoCard icon={<Phone size={17} />} label="Phone" wide>
              {phoneNumbers.map((number) => (
                <a key={number} className="info-phone" href={`tel:${number.replace(/\s+/g, '')}`}>
                  {number}
                </a>
              ))}
            </InfoCard>
          )}
          {place.rating != null && (
            <InfoCard icon={<Star size={17} />} label={rateable ? "Editor's rating" : 'Rating'}>
              {place.rating}
            </InfoCard>
          )}
        </dl>

        {description && (
          <section className="place-section detail-about">
            <h2>About</h2>
            <p>{shownDescription}</p>
            {longDescription && (
              <button className="link-btn" onClick={() => setShowFullDescription((open) => !open)} type="button">
                {showFullDescription ? 'Show less' : 'Read more'}
              </button>
            )}
          </section>
        )}

        {rateable && <RatingControl entity={place.entity} placeId={place.id} />}

        {place.updatedAt && (
          <p className="detail-updated">Updated {updatedFormat.format(new Date(place.updatedAt))}</p>
        )}
      </div>

      {isPhonePickerOpen && (
        <div className="phone-picker-backdrop" onClick={() => setIsPhonePickerOpen(false)} role="presentation">
          <section
            className="phone-picker"
            role="dialog"
            aria-modal="true"
            aria-labelledby="phone-picker-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="phone-picker-heading">
              <h2 id="phone-picker-title">Choose a phone number</h2>
              <button
                className="icon-btn"
                onClick={() => setIsPhonePickerOpen(false)}
                aria-label="Close phone number list"
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className="phone-list">
              {phoneNumbers.map((number) => (
                <a
                  key={number}
                  className="phone-item"
                  href={`tel:${number.replace(/\s+/g, '')}`}
                  onClick={() => setIsPhonePickerOpen(false)}
                >
                  <Phone size={18} />
                  <span>{number}</span>
                </a>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
