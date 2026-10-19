import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

/** Profile → About: version, data credits and a privacy note (TGI-55). */
export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="suggest-page">
      <div className="page-head">
        <BackButton onBack={() => navigate('/profile', { replace: true })} />
        <h1>About</h1>
        <span style={{ width: 24 }} />
      </div>

      <div className="about-content">
        <div className="about-app">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" width={64} height={64} />
          <h2>Directory - Taunggyi</h2>
          <p>Version {__APP_VERSION__}</p>
        </div>

        <section className="about-section">
          <h3>What it is</h3>
          <p>
            A city guide for Taunggyi: hotels, food places, banks, shops, events and places to visit. Listings
            are kept up to date by the developer and by suggestions from people who use the app.
          </p>
        </section>

        <section className="about-section">
          <h3>Data and maps</h3>
          <p>
            Map tiles and map data ©{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
              OpenStreetMap contributors
            </a>
            . Directions open in Apple Maps or Google Maps.
          </p>
          <p>Place details can change. Call ahead before you visit.</p>
        </section>

        <section className="about-section">
          <h3>Privacy</h3>
          <p>
            Browsing needs no account. When you sign in, the app keeps your name, email (if your sign-in
            provider shares it) and profile photo, plus the ratings and suggestions you send. Ratings are shown
            only as averages. Admins see your display name on the suggestions they review.
          </p>
          <p>To delete your account and data, contact the developer from the Profile page.</p>
        </section>
      </div>
    </div>
  );
}
