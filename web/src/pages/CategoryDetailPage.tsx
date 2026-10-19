import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, X } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useDirectoryPlace } from '../api/useDirectory';
import { parseStaticListingId } from '../services/directory';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';

/**
 * Place detail. Routes: /place/:entity/:listingId, and the old
 * /category-detail/dir--<file>--<index> (entity comes from the id).
 */
export default function CategoryDetailPage() {
  const params = useParams();
  const listingId = decodeURIComponent(params.listingId ?? '');
  const entity = params.entity ?? parseStaticListingId(listingId)?.file.replace(/\.json$/, '');
  const [isPhonePickerOpen, setIsPhonePickerOpen] = useState(false);

  const {
    data: place,
    isLoading,
    isError: dataError,
    refetch: retryData,
  } = useDirectoryPlace(entity, listingId);

  const listing = place
    ? {
      id: place.id,
      title: place.name,
      location: place.address,
      phone: place.phone,
    }
    : undefined;

  const listingImage = place?.imageUrl || FALLBACK_IMAGE;
  const address = listing?.location ?? '';
  const mapQuery =
    place?.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : address;

  const phoneNumbers = listing?.phone
    ? listing.phone.split(/[,;\s]+/).filter(Boolean)
    : [];

  useEffect(() => {
    if (!isPhonePickerOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPhonePickerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isPhonePickerOpen]);

  if (!listing) {
    return (
      <div className="centered">
        {isLoading ? (
          <p>Loading…</p>
        ) : dataError ? (
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

  return (
    <div>
      <div className="detail-hero">
        <img src={listingImage} alt={listing.title} />
        <BackButton variant="fab" />
      </div>

      <div className="category-detail-actions">
        {phoneNumbers.length === 1 ? (
          <a className="category-detail-action" href={`tel:${phoneNumbers[0]}`}>
            <Phone size={19} />
            <span>Phone</span>
          </a>
        ) : (
          <button
            className="category-detail-action"
            disabled={phoneNumbers.length === 0}
            onClick={() => setIsPhonePickerOpen(true)}
            type="button"
          >
            <Phone size={19} />
            <span>Phone</span>
          </button>
        )}
        <a
          className={`category-detail-action${mapQuery ? '' : ' disabled'}`}
          href={
            mapQuery
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
              : undefined
          }
          target="_blank"
          rel="noreferrer"
          aria-disabled={!mapQuery}
          onClick={(event) => {
            if (!mapQuery) event.preventDefault();
          }}
        >
          <MapPin size={19} />
          <span>Map</span>
        </a>
      </div>

      <article className="tazaungdaing-participant-info category-detail-info">
        <h1>{listing.title}</h1>
        <dl>
          {place?.type.name && (
            <div>
              <dt>Category</dt>
              <dd>{place.type.name}</dd>
            </div>
          )}
          {address && (
            <div>
              <dt>Address</dt>
              <dd>{address}</dd>
            </div>
          )}
          {place?.rating != null && (
            <div>
              <dt>Rating</dt>
              <dd>{place.rating}</dd>
            </div>
          )}
          {phoneNumbers.length > 0 && (
            <div>
              <dt>Phone</dt>
              <dd>{phoneNumbers.join(', ')}</dd>
            </div>
          )}
        </dl>
      </article>

      {isPhonePickerOpen && (
        <div
          className="phone-picker-backdrop"
          onClick={() => setIsPhonePickerOpen(false)}
          role="presentation"
        >
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
                  href={`tel:${number}`}
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
