import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import ImageSlider from '../components/ImageSlider';
import EventTicker from '../components/EventTicker';
import CategoriesList from '../components/CategoriesList';
import NearestListings from '../components/NearestListings';
import { placePath } from '../lib/routes';
import type { DirectoryPlace } from '../types';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const handleViewAllCategories = () => {
    navigate('/categories');
  };

  const handleCategoryPress = (id: string) => {
    navigate(`/category/${id}`);
  };

  const handleListingPress = (place: DirectoryPlace) => {
    navigate(placePath(place));
  };

  const handleFoodPlacesViewAll = () => {
    navigate('/category/food_places');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search');
  };

  return (
    <div>
      <div className="home-header">
        <div className="home-toprow">
          <form className="searchbar" onSubmit={handleSearchSubmit} role="search" style={{ flex: 1 }}>
            <Search size={18} color="#999" />
            <input
              placeholder="Search all places..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="search"
              enterKeyHint="search"
              aria-label="Search all places"
            />
          </form>
        </div>
      </div>
      <ImageSlider />
      <EventTicker />
      <CategoriesList
        onViewAll={handleViewAllCategories}
        onCategoryPress={handleCategoryPress}
      />
      <NearestListings onViewAll={handleFoodPlacesViewAll} onListingPress={handleListingPress} />
    </div>
  );
}
