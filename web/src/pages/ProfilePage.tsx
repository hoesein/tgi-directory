import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Shield,
  Clock,
  Heart,
  TrendingUp,
  Users,
  Link2,
  Moon,
  ChevronRight,
  Info,
  Database,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { storage } from '../lib/storage';

export default function ProfilePage() {
  const { userToken, signOut } = useAuthStore();
  const [darkMode, setDarkMode] = useState(storage.getString('darkMode') === 'true');

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    storage.set('darkMode', String(next));
  };

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
          <Link to="/login" className="profile-user-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="profile-avatar">
              <User size={28} />
            </div>
            <div className="profile-user-info">
              <div className="profile-name">Sign In (or) Register</div>
              <div className="profile-email">Access your account</div>
            </div>
            <ChevronRight size={20} />
          </Link>
        )}

        <div className="profile-menu">
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <Shield size={20} />
            </div>
            <span>Security</span>
            <ChevronRight size={18} />
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <Clock size={20} />
            </div>
            <span>History</span>
            <ChevronRight size={18} />
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <Heart size={20} />
            </div>
            <span>Favorites (Saved)</span>
            <ChevronRight size={18} />
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <TrendingUp size={20} />
            </div>
            <span>Usage Realtime Data</span>
            <ChevronRight size={18} />
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <Users size={20} />
            </div>
            <span>Communication</span>
            <ChevronRight size={18} />
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <Link2 size={20} />
            </div>
            <span>Website & Resources</span>
            <ChevronRight size={18} />
          </div>
        </div>

        <div className="profile-menu">
          <div className="profile-menu-item" onClick={toggleDarkMode} role="switch" aria-checked={darkMode} tabIndex={0}>
            <div className="profile-menu-icon">
              <Moon size={20} />
            </div>
            <span>Dark Mode</span>
            <div className={`toggle${darkMode ? ' on' : ''}`}>
              <div className="toggle-knob" />
            </div>
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <Info size={20} />
            </div>
            <span>App Version</span>
            <span className="profile-menu-value">1.0.0</span>
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <Database size={20} />
            </div>
            <span>Data Source</span>
            <span className="profile-menu-value">Internet</span>
          </div>
        </div>

        {userToken && (
          <button className="btn-primary profile-signout" onClick={signOut} type="button">
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}
