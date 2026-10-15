import { ChevronRight, ExternalLink, MessageCircle, Phone, Send, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const { userToken, signOut } = useAuthStore();

  return (
    <div className="profile-page">
      <div className="page-head">
        <h1>Profile</h1>
        <span style={{ width: 24 }} />
      </div>

      <div className="profile-content">
        {userToken ? (
          <div className="profile-user-card">
            <div className="profile-avatar">
              <User size={28} />
            </div>
            <div className="profile-user-info">
              <div className="profile-name">Guest User</div>
              <div className="profile-email">guest@directory.app</div>
            </div>
            <ChevronRight size={20} />
          </div>
        ) : (
          <div className="profile-user-card profile-user-card-disabled" aria-disabled="true">
            <div className="profile-avatar">
              <User size={28} />
            </div>
            <div className="profile-user-info">
              <div className="profile-name">Sign In (or) Register</div>
              <div className="profile-email">Coming soon</div>
            </div>
            <ChevronRight size={20} />
          </div>
        )}

        <section className="profile-contact">
          <div className="profile-contact-icon">
            <MessageCircle size={22} />
          </div>
          <div className="profile-contact-copy">
            <h2>Help improve the directory</h2>
            <p>
              Contact the developer to update category or event information, or to share
              another suggestion.
            </p>
          </div>
          <div className="profile-contact-links">
            <a
              className="profile-contact-link"
              href="https://t.me/h3ins03"
              target="_blank"
              rel="noreferrer"
              aria-label="Contact the developer on Telegram at @h3ins03"
            >
              <Send size={17} />
              <span>Telegram · @h3ins03</span>
              <ChevronRight size={18} />
            </a>
            <a
              className="profile-contact-link"
              href="https://www.facebook.com/XXIXIIIMCMXCII"
              target="_blank"
              rel="noreferrer"
              aria-label="Visit the developer's Facebook profile"
            >
              <ExternalLink size={17} />
              <span>Facebook</span>
              <ChevronRight size={18} />
            </a>
            <a
              className="profile-contact-link"
              href="tel:09957992668"
              aria-label="Call the developer at 09957992668"
            >
              <Phone size={17} />
              <span>09957992668</span>
              <ChevronRight size={18} />
            </a>
          </div>
        </section>

        {userToken && (
          <button className="btn-primary profile-signout" onClick={signOut} type="button">
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
