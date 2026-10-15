import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, X } from 'lucide-react';
import BackButton from '../components/BackButton';
import { parseStaticListingId, useDirectoryFile } from '../api/useDirectory';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';

export default function CategoryDetailPage() {
  const { listingId = '' } = useParams();
  const [isPhonePickerOpen, setIsPhonePickerOpen] = useState(false);

  const staticRef = parseStaticListingId(decodeURIComponent(listingId));
  const {
    data: staticItems,
    isError: dataError,
    refetch: retryData,
  } = useDirectoryFile(staticRef?.file);
  const staticItem =
    staticRef && staticItems && staticItems[staticRef.index]
      ? staticItems[staticRef.index]
      : undefined;

  const listing = staticItem
    ? {
      id: listingId,
      title: staticItem.name,
      location: staticItem.address || staticItem.location,
      image: staticItem.images || FALLBACK_IMAGE,
      description: [staticItem.type.name, staticItem.phone].filter(Boolean).join(' • '),
      phone: staticItem.phone || null,
    }
    : undefined;

  const listingImage =
    listing?.image ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';
  const address = listing?.location ?? '';

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
          className={`category-detail-action${address ? '' : ' disabled'}`}
          href={
            address
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
              : undefined
          }
          target="_blank"
          rel="noreferrer"
          aria-disabled={!address}
          onClick={(event) => {
            if (!address) event.preventDefault();
          }}
        >
          <MapPin size={19} />
          <span>Map</span>
        </a>
      </div>

      <article className="tazaungdaing-participant-info category-detail-info">
        <h1>{listing.title}</h1>
        <dl>
          {staticItem?.type && (
            <div>
              <dt>Category</dt>
              <dd>{staticItem.type.name}</dd>
            </div>
          )}
          {address && (
            <div>
              <dt>Address</dt>
              <dd>{address}</dd>
            </div>
          )}
          {staticItem?.rating && (
            <div>
              <dt>Rating</dt>
              <dd>{staticItem.rating}</dd>
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
