import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  Info,
  LogOut,
  Phone,
  PlusCircle,
  Send,
  Star,
  User,
} from 'lucide-react';
import { useMySuggestions } from '../api/useSuggestions';
import { useMyRatings } from '../api/useRatings';
import { isMobileBrowser, isRunningAsInstalledApp, showAddToHomeScreenGuide } from '../lib/addToHomeScreen';
import { enabledProviders, userAvatarUrl, userDisplayName, userProviderName } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { canSuggest } from '../services/suggestions';
import { useAuthStore } from '../store/authStore';

/** "Google", "Google or Telegram", "Google, Facebook or Telegram". */
function providerList(): string {
  const names = enabledProviders().map((provider) => provider.label.replace(/^Continue with /, ''));
  if (names.length <= 1) return names[0] ?? '';
  return `${names.slice(0, -1).join(', ')} or ${names[names.length - 1]}`;
}

interface RowProps {
  icon: ReactNode;
  label: string;
  /** Small grey text on the right, e.g. a count. */
  detail?: ReactNode;
  to?: string;
  href?: string;
  onClick?: () => void;
}

function SettingsRow({ icon, label, detail, to, href, onClick }: RowProps) {
  const external = !!href && !href.startsWith('tel:');
  const body = (
    <>
      <span className="settings-row-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="settings-row-label">{label}</span>
      {detail !== undefined && detail !== null && <span className="settings-row-detail">{detail}</span>}
      {external ? (
        <ExternalLink size={15} className="settings-row-chevron" aria-hidden="true" />
      ) : (
        <ChevronRight size={18} className="settings-row-chevron" aria-hidden="true" />
      )}
    </>
  );
  if (to) {
    return (
      <Link className="settings-row" to={to}>
        {body}
      </Link>
    );
  }
  if (href) {
    return (
      <a className="settings-row" href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
        {body}
      </a>
    );
  }
  return (
    <button className="settings-row" type="button" onClick={onClick}>
      {body}
    </button>
  );
}

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-group">
      <h2>{title}</h2>
      <div className="settings-list">{children}</div>
    </section>
  );
}

export default function ProfilePage() {
  const { user, signOut } = useAuthStore();
  const apiMode = canSuggest();
  const { data: suggestions } = useMySuggestions(apiMode);
  const { data: ratings } = useMyRatings(apiMode);
  const [installError, setInstallError] = useState<string | null>(null);
  const avatarUrl = user ? userAvatarUrl(user) : null;
  const providerName = user ? userProviderName(user) : null;
  const providers = providerList();
  const canInstall = isMobileBrowser() && !isRunningAsInstalledApp();

  const openInstallGuide = () => {
    setInstallError(null);
    try {
      showAddToHomeScreenGuide();
    } catch {
      setInstallError('Open your browser menu and choose “Add to Home Screen”.');
    }
  };

  return (
    <div className="profile-page">
      <div className="page-head">
        <h1>Profile</h1>
        <span style={{ width: 24 }} />
      </div>

      <div className="profile-content">
        {user ? (
          <div className="profile-user-card">
            <div className="profile-avatar">
              {avatarUrl ? <img src={avatarUrl} alt="" referrerPolicy="no-referrer" /> : <User size={28} />}
            </div>
            <div className="profile-user-info">
              <div className="profile-name">{userDisplayName(user)}</div>
              {/* Telegram users have no email; show how they signed in instead. */}
              <div className="profile-email">
                {user.email || (providerName ? `Signed in with ${providerName}` : '')}
              </div>
            </div>
          </div>
        ) : !supabase ? (
          <div className="profile-user-card profile-user-card-disabled" aria-disabled="true">
            <div className="profile-avatar">
              <User size={28} />
            </div>
            <div className="profile-user-info">
              <div className="profile-name">Sign in</div>
              <div className="profile-email">Coming soon</div>
            </div>
          </div>
        ) : (
          <Link className="profile-user-card" to="/sign-in?next=/profile">
            <div className="profile-avatar">
              <User size={28} />
            </div>
            <div className="profile-user-info">
              <div className="profile-name">Sign in</div>
              <div className="profile-email">
                {providers ? `With ${providers} to rate and suggest places` : 'Rate and suggest places'}
              </div>
            </div>
            <ChevronRight size={20} />
          </Link>
        )}

        {apiMode && (
          <SettingsGroup title="My activity">
            {user && (
              <>
                <SettingsRow
                  icon={<ClipboardList size={18} />}
                  label="My suggestions"
                  detail={suggestions?.length || undefined}
                  to="/profile/suggestions"
                />
                <SettingsRow
                  icon={<Star size={18} />}
                  label="Places I rated"
                  detail={ratings?.count || undefined}
                  to="/profile/ratings"
                />
              </>
            )}
            <SettingsRow icon={<PlusCircle size={18} />} label="Add a missing place" to="/categories" />
          </SettingsGroup>
        )}

        <SettingsGroup title="App">
          {canInstall && <SettingsRow icon={<Download size={18} />} label="Install app" onClick={openInstallGuide} />}
          <SettingsRow icon={<Info size={18} />} label="About this app" to="/profile/about" />
        </SettingsGroup>
        {installError && (
          <p className="settings-note" role="alert">
            {installError}
          </p>
        )}

        <SettingsGroup title="Help & contact">
          <SettingsRow icon={<Send size={18} />} label="Telegram" detail="@h3ins03" href="https://t.me/h3ins03" />
          <SettingsRow icon={<ExternalLink size={18} />} label="Facebook" href="https://www.facebook.com/XXIXIIIMCMXCII" />
          <SettingsRow icon={<Phone size={18} />} label="Call" detail="09957992668" href="tel:09957992668" />
        </SettingsGroup>
        <p className="settings-note">Contact the developer to update a place or event, or to share an idea.</p>

        {user && (
          <button className="profile-signout" onClick={() => void signOut()} type="button">
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        )}

        <p className="profile-version">Version {__APP_VERSION__}</p>
      </div>
    </div>
  );
}
