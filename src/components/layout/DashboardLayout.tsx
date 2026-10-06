import React, { useState } from 'react';
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
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <span style={{ color: 'var(--accent-color)' }}>{'>_'}</span> AI CLUB
          </div>
          <button className="mobile-close" onClick={() => setMobileMenuOpen(false)}>
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
                <item.icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
          
          <div className="sidebar-divider"></div>

          <div className="nav-section">
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              <User size={18} />
              <span>Profile</span>
            </NavLink>
            <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>
          </div>

          <div className="sidebar-footer">
            <button className="nav-item logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
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
            <button className="mobile-toggle" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="page-title">{pageTitle}</h1>
          </div>
          
          <div className="topbar-right flex items-center gap-3">
            <NotificationBell />
            
            <div className="profile-menu-container">
              <button 
                className="profile-btn" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="avatar">{initials}</div>
                <span className="profile-name">{displayName}</span>
              </button>
              
              {profileDropdownOpen && (
                <div className="profile-dropdown">
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
