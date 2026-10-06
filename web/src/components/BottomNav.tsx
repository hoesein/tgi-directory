import { NavLink } from 'react-router-dom';
import { Home, Calendar, MapPin, User } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Home', Icon: Home },
  { to: '/events', label: 'Events', Icon: Calendar },
  { to: '/notifications', label: 'Places', Icon: MapPin },
  { to: '/profile', label: 'Profile', Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {TABS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
