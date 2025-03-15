import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  toggleSidebar: () => void;
}

/**
 * Header Component
 *
 * Top navigation bar that includes the sidebar toggle, application branding,
 * and user controls such as theme toggle and notifications.
 */
const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="fixed w-full z-30 bg-card-bg border-b border-card-border h-16">
      <div className="px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
            aria-label="Toggle sidebar"
          >
            <MenuIcon />
          </button>

          <Link to="/" className="ml-4 flex items-center">
            <span className="font-bold text-xl tracking-tight text-text-primary">
              OSPAiN<span className="text-primary">₂</span>
            </span>
            <span className="ml-2 text-sm text-text-secondary">v0.1.0</span>
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle />

          <button
            className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
            aria-label="Notifications"
          >
            <NotificationsIcon />
          </button>

          <button
            className="p-2 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover"
            aria-label="User account"
          >
            <AccountCircleIcon />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
