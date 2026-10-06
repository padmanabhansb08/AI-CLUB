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
  Bot
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Body scroll lock on mobile drawer
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle click outside profile dropdown
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

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() || 'ST');

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Member';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
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
        className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}
        aria-label="Primary Navigation"
      >
        <div className="sidebar-header">
          <Link to="/dashboard" className="sidebar-brand">
            <span className="font-mono text-blue-500 font-bold">{'>_'}</span>
            <span className="bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">AI CLUB</span>
          </Link>
          <button 
            className="mobile-close" 
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
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
            <button 
              className="nav-item logout-btn" 
              onClick={handleLogout}
              aria-label="Log out of account"
            >
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
              className="mobile-toggle" 
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="page-title text-base sm:text-lg font-bold text-white tracking-tight">{pageTitle}</h1>
          </div>
          
          <div className="topbar-right flex items-center gap-3">
            <NotificationBell />
            
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button 
                className="profile-btn flex items-center gap-2.5 p-1 sm:pr-3 rounded-full hover:bg-white/5 transition-colors" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                aria-label="User account menu"
              >
                <div className="avatar w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center text-xs font-bold font-mono">
                  {initials}
                </div>
                <span className="profile-name hidden sm:inline text-xs font-medium text-slate-200">{displayName}</span>
              </button>
              
              {profileDropdownOpen && (
                <div className="profile-dropdown">
                  <div className="px-4 py-2 border-b border-white/5 mb-1 sm:hidden">
                    <p className="text-xs font-bold text-white truncate">{displayName}</p>
                    <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                  </div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>Profile</Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setProfileDropdownOpen(false)}>Settings</Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-error" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
};
