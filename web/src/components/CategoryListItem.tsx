interface CategoryListItemProps {
  item: {
    id: string;
    title: string;
    location: string;
    rating: number;
    reviews: number;
    image: string;
  };
  onPress: () => void;
}

export default function CategoryListItem({ item, onPress }: CategoryListItemProps) {
  return (
    <button className="list-item" onClick={onPress} type="button">
      <img src={item.image} alt={item.title} loading="lazy" />
      <div>
        <h3>{item.title}</h3>
        <p>{item.location}</p>
        <p>
          ★ {item.rating} ({item.reviews} reviews)
        </p>
      </div>
    </button>
  );
}
