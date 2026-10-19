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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EventsPage from './pages/EventsPage';
import TazaungdaingParticipantPage from './pages/TazaungdaingParticipantPage';
import EventParticipantPage from './pages/EventParticipantPage';
import PlaceToVisitPage from './pages/PlaceToVisitPage';

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
          <Route path="/category/:categoryId" element={<CategoryPage />} />
          <Route path="/place/:entity/:listingId" element={<CategoryDetailPage />} />
          {/* Old static detail links (dir--<file>--<index>) */}
          <Route path="/category-detail/:listingId" element={<CategoryDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
