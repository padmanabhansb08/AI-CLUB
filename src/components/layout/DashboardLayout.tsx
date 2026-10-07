import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Rss, 
  BookOpen, 
  Lightbulb, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  Calendar,
  GraduationCap,
  Megaphone,
  Users,
  Bot,
  Award
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMobile } from '../../hooks/useMobile';
import { useDialog } from '../../hooks/useDialog';
import { NotificationBell } from '../notifications/NotificationBell';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Member';
  const initials = displayName.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const mobile = useMobile();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const navigationRef = useDialog<HTMLElement>(mobile && mobileMenuOpen, () => setMobileMenuOpen(false));

  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', dismiss);
    return () => document.removeEventListener('keydown', dismiss);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Club Application', path: '/application', icon: Award },
    { name: 'AI Assistant', path: '/ai-assistant', icon: Bot },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'Events', path: '/events', icon: Calendar },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'My Learning', path: '/my-learning', icon: GraduationCap },
    { name: 'Projects', path: '/projects', icon: Lightbulb },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'AI & Tech', path: '/updates', icon: Rss },
    { name: 'Members', path: '/members', icon: Users },
  ];

  return (
    <div className="dashboard-layout">
      <a className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-white focus:shadow" href="#member-content">
        Skip to content
      </a>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        ref={navigationRef} 
        aria-label="Member navigation" 
        className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}
      >
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand text-[#111111]">
            <span className="font-serif text-[15px]">✦</span>
            <span>AI CLUB</span>
          </Link>
          <button 
            aria-label="Close navigation" 
            className="mobile-close" 
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            {navItems.map((item) => (
              <NavLink 
                key={item.name}
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon size={18} className="shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>
          
          <div className="sidebar-divider"></div>

          <div className="nav-section">
            <NavLink 
              to="/profile" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
              onClick={() => setMobileMenuOpen(false)}
            >
              <User size={18} className="shrink-0" />
              <span>Profile</span>
            </NavLink>
            <NavLink 
              to="/settings" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} 
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings size={18} className="shrink-0" />
              <span>Settings</span>
            </NavLink>
          </div>

          <div className="sidebar-footer">
            <button className="nav-item logout-btn" onClick={handleLogout}>
              <LogOut size={18} className="shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button 
              aria-label="Open navigation" 
              aria-expanded={mobileMenuOpen} 
              className="mobile-toggle" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <h1 className="page-title text-base sm:text-lg font-semibold text-[#111111] tracking-tight">{pageTitle}</h1>
          </div>
          
          <div className="topbar-right flex items-center gap-3">
            <NotificationBell />
            
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button 
                className="profile-btn flex items-center gap-2.5 p-1 sm:pr-3 rounded-full hover:bg-black/5 transition-colors" 
                aria-label={`Account menu for ${displayName}`}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="avatar w-8 h-8 rounded-full bg-[#050505] text-[#FFFFFF] flex items-center justify-center text-xs font-semibold font-mono">
                  {initials}
                </div>
                <span className="profile-name hidden sm:inline text-xs font-medium text-[#111111]">{displayName}</span>
              </button>
              
              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="px-4 py-2 border-b border-[rgba(17,17,17,0.06)] mb-1 sm:hidden">
                    <p className="text-xs font-semibold text-[#111111] truncate">{displayName}</p>
                    <p className="text-[11px] text-[#66645F] truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>Profile</Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>Settings</Link>
                  <button className="dropdown-item text-red-600 w-full text-left" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="dashboard-content" id="member-content" tabIndex={-1}>
          {children}
        </div>
      </main>
    </div>
  );
};
