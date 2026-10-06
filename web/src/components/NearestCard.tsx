interface NearestCardProps {
  listing: {
    id: string;
    name: string;
    address: string;
    type: string;
    image: string;
  };
  onPress: () => void;
}

export default function NearestCard({ listing, onPress }: NearestCardProps) {
  return (
    <button className="nearest-card" onClick={onPress} type="button">
      <img src={listing.image} alt={listing.name} loading="lazy" />
      <div className="nearest-body">
        <h3>{listing.name}</h3>
        <p>{listing.address}</p>
        <div className="nearest-meta">
          <span>{listing.type.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </button>
  );
}
