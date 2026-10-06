import { Search, Bell } from 'lucide-react';

interface HeaderProps {
  onSearch: () => void;
  onNotification: () => void;
}

export default function Header({ onSearch, onNotification }: HeaderProps) {
  return (
    <div className="page-head">
      <h1>Home</h1>
      <div style={{ display: 'flex' }}>
        <button className="icon-btn" onClick={onSearch} aria-label="Search">
          <Search size={24} />
        </button>
        <button className="icon-btn" onClick={onNotification} aria-label="Notifications">
          <Bell size={24} />
        </button>
      </div>
    </div>
  );
}
