import { FC } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/components/sidebar.css';
import { LayoutDashboard, BookOpen, TrendingUp, MapPin } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const Sidebar: FC = () => {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: '/',
    },
    {
      id: 'literacy',
      label: 'Financial Literacy',
      icon: <BookOpen className="w-5 h-5" />,
      path: '/literacy',
    },
    {
      id: 'behavior',
      label: 'Behavior & Well-being',
      icon: <TrendingUp className="w-5 h-5" />,
      path: '/behavior',
    },
    {
      id: 'regional',
      label: 'Regional Analysis',
      icon: <MapPin className="w-5 h-5" />,
      path: '/regional',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar fixed left-0 h-screen shadow-lg">
      {/* Logo Section */}
      <div className="h-20 flex items-center px-6 border-b border-white border-opacity-5">
        <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          GenZ Financial
          <span className="block text-sm font-normal text-[var(--primary-blue)]">
            Analytics Dashboard
          </span>
        </h1>
      </div>

      {/* Navigation Menu */}
      <nav className="px-4 mt-8">
        <div className="mb-4 px-3">
          <h2 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
            Analytics
          </h2>
        </div>
        
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`
                flex items-center px-3 py-2.5 text-sm rounded-lg transition-all duration-200
                ${
                  isActive(item.path)
                    ? 'text-[var(--text-primary)] bg-[var(--primary-blue)] bg-opacity-10 font-medium shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }
              `}
            >
              <span
                className={`
                  mr-3 transition-colors
                  ${isActive(item.path) ? 'text-[var(--primary-blue)]' : ''}
                `}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white border-opacity-5">
        <p className="text-xs text-[var(--text-secondary)] text-center">
          v1.0.0 • 2025
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
