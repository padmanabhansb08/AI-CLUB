import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  Users, Trophy, Zap, BookOpen, BarChart3, Settings, LogOut, 
  Menu, X, Bell, LayoutDashboard, Calendar, Megaphone, FolderGit2, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMobile } from '../../hooks/useMobile';
import { useDialog } from '../../hooks/useDialog';
import { NotificationBell } from '../notifications/NotificationBell';

interface AdminLayoutProps {
  pageTitle: string;
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ pageTitle, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const mobile = useMobile();
  const navigationRef = useDialog<HTMLElement>(mobile && isMobileMenuOpen, () => setIsMobileMenuOpen(false));
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setIsMobileMenuOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Members', path: '/admin/members', icon: <Users size={20} /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone size={20} /> },
    { name: 'Events', path: '/admin/events', icon: <Calendar size={20} /> },
    { name: 'Courses', path: '/admin/courses', icon: <BookOpen size={20} /> },
    { name: 'Projects', path: '/admin/projects', icon: <FolderGit2 size={20} /> },
    { name: 'Achievements', path: '/admin/achievements', icon: <Trophy size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <Bell size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: <ShieldCheck size={20} /> },
    { name: 'AI & Tech Updates', path: '/admin/updates', icon: <Zap size={20} /> }
  ];

  return (
    <div className="dashboard-container admin-layout">
      <a className="skip-link" href="#admin-content">Skip to content</a>
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <span className="logo-text">AI CLUB <span className="admin-badge-text">ADMIN</span></span>
        </div>
        <button 
          className="mobile-menu-btn"
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside ref={navigationRef} inert={mobile && !isMobileMenuOpen} aria-label="Administration navigation" className={`sidebar ${isMobileMenuOpen ? 'mobile-open open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon"></div>
            <span className="logo-text">AI CLUB <span className="admin-badge-text">ADMIN</span></span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">ADMINISTRATION</span>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/admin'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <NavLink 
            to="/admin/settings" 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Settings size={20} />
            <span>Settings</span>
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="dashboard-topbar">
          <h1 className="page-title">{pageTitle}</h1>
          <div className="topbar-actions">
            <NotificationBell />
            <div className="user-profile">
              <div className="avatar admin-avatar">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="user-info hidden-mobile">
                <span className="user-name">{user?.email || 'Administrator'}</span>
                <span className="user-role">{user?.role?.toUpperCase() || 'OPERATIONS'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content" id="admin-content" tabIndex={-1}>
          {children || <Outlet />}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </div>
  );
};
