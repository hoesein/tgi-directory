const PLACES = [
  {
    id: 1,
    name: 'Shan State Cultural Museum',
    location: 'Taunggyi',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    name: 'Inle Lake Viewpoint',
    location: 'Nyaungshwe',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    name: 'Kakku Pagodas',
    location: 'Pa-O Tracts',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    name: 'Pindaya Caves',
    location: 'Pindaya',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
  },
];

export default function PlaceToVisitPage() {
  return (
    <div>
      <div className="page-head">
        <h1>Places to Visit</h1>
        <span style={{ width: 24 }} />
      </div>
      <div className="places-grid">
        {PLACES.map((place) => (
          <div key={place.id} className="place-card">
            <img src={place.image} alt={place.name} />
            <div className="place-info">
              <div className="place-name">{place.name}</div>
              <div className="place-location">{place.location}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
