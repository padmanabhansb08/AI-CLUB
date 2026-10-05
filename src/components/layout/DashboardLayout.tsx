import React, { useState, useEffect } from 'react';
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
  Megaphone,
  Users
} from 'lucide-react';
import { announcementService } from '../../services/content/announcementService';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    navigate('/');
  };

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Only fetch unread count if we are a student (which DashboardLayout typically is)
    // and we have a valid token (implied by being here).
    // In a real app, we might use a global context, but simple fetch is fine.
    const fetchUnread = async () => {
      try {
        const count = await announcementService.getUnreadCount();
        setUnreadCount(count);
      } catch (err) {
        console.error('Failed to fetch unread count', err);
      }
    };
    fetchUnread();
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Announcements', path: '/announcements', icon: Megaphone },
    { name: 'Achievements', path: '/achievements', icon: Trophy },
    { name: 'AI & Tech', path: '/updates', icon: Rss },
    { name: 'Courses', path: '/courses', icon: BookOpen },
    { name: 'Projects', path: '/projects', icon: Lightbulb },
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
          
          <div className="topbar-right">
            <button className="icon-btn relative" onClick={() => navigate('/announcements')} title="Announcements">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[var(--bg-card)]"></span>
              )}
            </button>
            
            <div className="profile-menu-container">
              <button 
                className="profile-btn" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="avatar">JD</div>
                <span className="profile-name">John Doe</span>
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
