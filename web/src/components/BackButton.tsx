import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { markBackNavigation } from '../lib/useNativeNavigation';

interface BackButtonProps {
  variant?: 'header' | 'fab';
  label?: string;
  onBack?: () => void;
}

export default function BackButton({ variant = 'header', label = 'Back', onBack }: BackButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      className={variant === 'fab' ? 'back-fab' : 'icon-btn'}
      onClick={() => {
        // Custom back actions use navigate(path, { replace }); mark them so the page slides back.
        markBackNavigation();
        (onBack ?? (() => navigate(-1)))();
      }}
      aria-label={label}
      type="button"
    >
      <ChevronLeft size={22} strokeWidth={2.4} />
    </button>
  );
}
