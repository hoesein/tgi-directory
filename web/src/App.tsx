import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BottomNav from './components/BottomNav';
import {
  isMobileBrowser,
  isRunningAsInstalledApp,
  showAddToHomeScreenGuide,
} from './lib/addToHomeScreen';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import CategoriesPage from './pages/CategoriesPage';
import CategoryDetailPage from './pages/CategoryDetailPage';
import SignInPage from './pages/SignInPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import TazaungdaingParticipantPage from './pages/TazaungdaingParticipantPage';
import EventParticipantPage from './pages/EventParticipantPage';
import PlaceToVisitPage from './pages/PlaceToVisitPage';
import SuggestEditPage from './pages/SuggestEditPage';
import AddPlacePage from './pages/AddPlacePage';
import MySuggestionsPage from './pages/MySuggestionsPage';
import SearchPage from './pages/SearchPage';
import PlaceMapPage from './pages/PlaceMapPage';
import MyRatingsPage from './pages/MyRatingsPage';
import AboutPage from './pages/AboutPage';

// The floating tab bar only lives on the home page — every other
// route is a dedicated page with its own back navigation.
const SHOW_NAV_PATHS = ['/', '/events', '/place-to-visit', '/profile'];

export default function App() {
  const location = useLocation();
  const showNav = SHOW_NAV_PATHS.includes(location.pathname);

  useEffect(() => {
    const guideShown = 'add-to-home-screen-guide-shown';
    if (
      !isMobileBrowser() ||
      isRunningAsInstalledApp() ||
      sessionStorage.getItem(guideShown)
    ) {
      return;
    }

    const timeout = window.setTimeout(() => {
      sessionStorage.setItem(guideShown, 'true');
      showAddToHomeScreenGuide();
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <div className="app-shell">
      <main className={showNav ? 'app-main' : 'app-main no-nav'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/search" element={<SearchPage />} />
          {/* The Places to Visit category is the Places tab. */}
          <Route path="/category/places_to_visit" element={<Navigate to="/place-to-visit" replace />} />
          <Route path="/category/places_to_visit.json" element={<Navigate to="/place-to-visit" replace />} />
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/category/:categoryId/add" element={<AddPlacePage />} />
          <Route path="/place/:entity/:listingId" element={<CategoryDetailPage />} />
          <Route path="/place/:entity/:listingId/suggest" element={<SuggestEditPage />} />
          <Route path="/place/:entity/:listingId/map" element={<PlaceMapPage />} />
          {/* Old static detail links (dir--<file>--<index>) */}
          <Route path="/category-detail/:listingId" element={<CategoryDetailPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          {/* Old email login links */}
          <Route path="/login" element={<Navigate to="/sign-in" replace />} />
          <Route path="/register" element={<Navigate to="/sign-in" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/suggestions" element={<MySuggestionsPage />} />
          <Route path="/profile/ratings" element={<MyRatingsPage />} />
          <Route path="/profile/about" element={<AboutPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/participants/:participantId" element={<EventParticipantPage />} />
          <Route
            path="/events/tazaungdaing/:eventDate/:participantIndex"
            element={<TazaungdaingParticipantPage />}
          />
          <Route path="/place-to-visit" element={<PlaceToVisitPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
