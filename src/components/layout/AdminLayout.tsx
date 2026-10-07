import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import { 
  Users, Trophy, Zap, BookOpen, BarChart3, Settings, LogOut, 
  Menu, X, Search, LayoutDashboard, Calendar, Megaphone, FolderGit2, ShieldCheck, Sparkles, FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../notifications/NotificationBell';

interface AdminLayoutProps {
  pageTitle: string;
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ pageTitle, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Applications', path: '/admin/applications', icon: <FileText size={18} /> },
    { name: 'AI Insights', path: '/admin/ai-insights', icon: <Sparkles size={18} /> },
    { name: 'Members', path: '/admin/members', icon: <Users size={18} /> },
    { name: 'Announcements', path: '/admin/announcements', icon: <Megaphone size={18} /> },
    { name: 'Events', path: '/admin/events', icon: <Calendar size={18} /> },
    { name: 'Courses', path: '/admin/courses', icon: <BookOpen size={18} /> },
    { name: 'Projects', path: '/admin/projects', icon: <FolderGit2 size={18} /> },
    { name: 'Achievements', path: '/admin/achievements', icon: <Trophy size={18} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <NotificationBell /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: <ShieldCheck size={18} /> },
    { name: 'AI & Tech Updates', path: '/admin/updates', icon: <Zap size={18} /> }
  ];

  return (
    <div className="dashboard-layout min-h-screen bg-[#F5F4F0] text-[#111111]">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#FAF9F6] border-b border-[rgba(17,17,17,0.08)]">
        <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold text-[#111111]">
          <span className="font-serif">✦</span>
          <span>AI CLUB</span>
          <span className="admin-badge-text">CONTROL</span>
        </Link>
        <button 
          className="p-2 text-[#111111]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''} bg-[#FAF9F6]`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand text-[#111111]">
            <span className="font-serif text-[15px]">✦</span>
            <span>AI CLUB</span>
            <span className="admin-badge-text">CONTROL</span>
          </Link>
          <button 
            className="mobile-close" 
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#92908A] px-3 mb-2 block">
              CONTROL CENTER
            </span>
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                end={item.path === '/admin'}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="sidebar-divider" />

          <div className="nav-section">
            <NavLink 
              to="/admin/settings" 
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
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

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Topbar */}
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button 
              className="mobile-toggle" 
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <h1 className="page-title">{pageTitle}</h1>
          </div>
          
          <div className="topbar-right flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-full px-4 py-1.5 text-xs text-[#66645F] w-56">
              <Search size={14} className="text-[#92908A]" />
              <input 
                type="text" 
                placeholder="Search control center..." 
                className="bg-transparent border-none outline-none text-xs w-full text-[#111111]"
              />
            </div>
            
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#050505] text-[#FFFFFF] flex items-center justify-center text-xs font-semibold font-mono">
                {user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-[#111111]">{user?.email?.split('@')[0] || 'Administrator'}</span>
                <span className="text-[10px] uppercase tracking-wider text-[#92908A] font-medium">SUPERADMIN</span>
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
          aria-hidden="true"
        />
      )}
    </div>
  );
};
