import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell } from 'lucide-react';
import ImageSlider from '../components/ImageSlider';
import EventTicker from '../components/EventTicker';
import CategoriesList from '../components/CategoriesList';
import NearestListings from '../components/NearestListings';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const handleViewAllCategories = () => {
    navigate('/categories');
  };

  const handleCategoryPress = (id: string) => {
    navigate(`/category/${id}`);
  };

  const handleListingPress = (id: string) => {
    navigate(`/category-detail/${encodeURIComponent(id)}`);
  };

  const handleFoodPlacesViewAll = () => {
    navigate('/category/food_places.json');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <div className="home-header">
        <div className="home-toprow">
          <form className="searchbar" onSubmit={handleSearchSubmit} style={{ flex: 1 }}>
            <Search size={18} color="#999" />
            <input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              type="search"
              aria-label="Search"
            />
          </form>
          <button
            className="icon-btn"
            onClick={() => navigate('/notifications')}
            aria-label="Notifications"
            type="button"
          >
            <Bell size={22} color="#333" />
          </button>
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
