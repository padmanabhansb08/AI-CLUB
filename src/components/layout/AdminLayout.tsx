import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  Users, Trophy, Zap, BookOpen, BarChart3, Settings, LogOut, 
  Menu, X, Bell, Search, LayoutDashboard
} from 'lucide-react';
import { authService } from '../../services/authService';

interface AdminLayoutProps {
  pageTitle: string;
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ pageTitle, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/admin');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Members', path: '/admin/members', icon: <Users size={20} /> },
    { name: 'Achievements', path: '/admin/achievements', icon: <Trophy size={20} /> },
    { name: 'AI & Tech Updates', path: '/admin/updates', icon: <Zap size={20} /> },
    { name: 'Projects', path: '/admin/projects', icon: <BookOpen size={20} /> },
    { name: 'Courses', path: '/admin/courses', icon: <BookOpen size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> }
  ];

  return (
    <div className="dashboard-container">
      {/* Mobile Header */}
      <div className="mobile-header">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <span className="logo-text">AI CLUB <span className="admin-badge-text">ADMIN</span></span>
        </div>
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
            <div className="search-bar hidden-mobile">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search admin..." />
            </div>
            <button className="icon-btn">
              <Bell size={20} />
            </button>
            <div className="user-profile">
              <div className="avatar admin-avatar">A</div>
              <div className="user-info hidden-mobile">
                <span className="user-name">Administrator</span>
                <span className="user-role">Operations</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
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
