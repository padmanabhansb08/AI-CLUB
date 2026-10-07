import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet, Link } from 'react-router-dom';
import { 
  Users, Trophy, Zap, BookOpen, BarChart3, Settings, LogOut, 
  Menu, X, Search, LayoutDashboard, Calendar, Megaphone, FolderGit2, ShieldCheck, Sparkles, FileText
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
    const close = (event: KeyboardEvent) => { 
      if (event.key === 'Escape') setIsMobileMenuOpen(false); 
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);

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
      <a className="skip-link sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:p-2 focus:bg-white focus:shadow" href="#admin-content">
        Skip to content
      </a>

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#FAF9F6] border-b border-[rgba(17,17,17,0.08)]">
        <Link to="/" className="flex items-center gap-2 text-[15px] font-semibold text-[#111111]">
          <span className="font-serif">✦</span>
          <span>AI CLUB</span>
          <span className="admin-badge-text text-[10px] bg-[#050505] text-[#FFFFFF] px-1.5 py-0.5 rounded font-mono">CONTROL</span>
        </Link>
        <button 
          className="p-2 text-[#111111]"
          aria-label={isMobileMenuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        ref={navigationRef} 
        aria-label="Administration navigation" 
        className={`sidebar ${isMobileMenuOpen ? 'mobile-open open' : ''} bg-[#FAF9F6]`}
      >
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand text-[#111111]">
            <span className="font-serif text-[15px]">✦</span>
            <span>AI CLUB</span>
            <span className="admin-badge-text text-[10px] bg-[#050505] text-[#FFFFFF] px-1.5 py-0.5 rounded font-mono">CONTROL</span>
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
              Platform Modules
            </span>
            {navItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                end={item.path === '/admin'}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </div>

          <div className="nav-section mt-4 pt-4 border-t border-[rgba(17,17,17,0.06)]">
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
              className="mobile-toggle lg:hidden p-1.5" 
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
            
            <div className="flex items-center gap-3">
              <NotificationBell />
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
          aria-hidden="true"
        />
      )}
    </div>
  );
};
