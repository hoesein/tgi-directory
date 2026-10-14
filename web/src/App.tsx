import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import TazaungdaingParticipantPage from './pages/TazaungdaingParticipantPage';
import PlaceToVisitPage from './pages/PlaceToVisitPage';

// The floating tab bar only lives on the home page — every other
// route is a dedicated page with its own back navigation.
const SHOW_NAV_PATHS = ['/', '/events', '/notifications', '/profile'];

export default function App() {
  const location = useLocation();
  const showNav = SHOW_NAV_PATHS.includes(location.pathname);

  return (
    <div className="app-shell">
      <main className={showNav ? 'app-main' : 'app-main no-nav'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/category-detail/:listingId" element={<CategoryDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/events/tazaungdaing/:eventDate/:participantIndex"
            element={<TazaungdaingParticipantPage />}
          />
          <Route path="/notifications" element={<PlaceToVisitPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
