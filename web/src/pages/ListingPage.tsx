import { useParams } from 'react-router-dom';
import { Phone } from 'lucide-react';
import BackButton from '../components/BackButton';
import { parseStaticListingId, useDirectoryFile } from '../api/useDirectory';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';

export default function ListingPage() {
  const { listingId = '' } = useParams();

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
        description: [staticItem.type, staticItem.phone].filter(Boolean).join(' • '),
        phone: staticItem.phone || null,
      }
    : undefined;

  const mockImage =
    listing?.image ||
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';
  const fullAddress = listing?.location || 'Ferry Road, Berkshire, SL6 2AT';

  const phoneNumbers = listing?.phone
    ? listing.phone.split(/[,;\s]+/).filter(Boolean)
    : [];

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
        <img src={mockImage} alt={listing.title} />
        <BackButton variant="fab" />
      </div>

      <div className="detail-card">
        <h1>Another title</h1>
        <h1>{listing.title}</h1>
        <p className="detail-sub">{listing.location}</p>

        <div className="divider" />

        <div className="map-row">
          <div className="map-thumb">Map</div>
          <div>
            <p>{fullAddress}</p>
            <a
              className="map-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
              target="_blank"
              rel="noreferrer"
            >
              Open on Maps
            </a>
          </div>
        </div>

        <div className="divider" />

        <p className="detail-desc">
          {listing.description ||
            'Its picture-book riverbank location may look and feel as English as The Wind in the Willows, but everything else at The Waterside Inn...'}
        </p>

        {phoneNumbers.length > 0 && (
          <>
            <div className="divider" />
            <div className="phone-list">
              {phoneNumbers.map((num, i) => (
                <a key={i} className="phone-item" href={`tel:${num}`}>
                  <Phone size={18} />
                  <span>{num}</span>
                </a>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
