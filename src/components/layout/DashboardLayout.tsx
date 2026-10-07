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

  const isMember = user?.isClubMember || user?.membershipStatus === 'ACTIVE';

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
          <Link to="/" className="sidebar-brand text-[#111111]">
            <span className="font-serif text-[15px]">✦</span>
            <span>AI CLUB</span>
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
            <h1 className="page-title text-base sm:text-lg font-semibold text-[#111111] tracking-tight">{pageTitle}</h1>
          </div>
          
          <div className="topbar-right flex items-center gap-3">
            <NotificationBell />
            
            <div className="profile-menu-container" ref={profileMenuRef}>
              <button 
                className="profile-btn flex items-center gap-2.5 p-1 sm:pr-3 rounded-full hover:bg-black/5 transition-colors" 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                aria-label="User account menu"
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
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item text-error" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="dashboard-content">
          {user?.role === 'student' && !isMember && (
            <div className="mb-8 p-6 rounded-[20px] bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#111111] flex items-center justify-center shrink-0">
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#111111] flex items-center gap-2.5">
                    <span>AI CLUB Selection Status</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold uppercase tracking-wider bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-[#66645F]">
                      {user?.applicationStatus?.replace('_', ' ') || 'Application Active'}
                    </span>
                  </div>
                  <p className="text-xs text-[#66645F] mt-1 max-w-[60ch] leading-relaxed">
                    {user?.applicationStatus === 'TEST_REQUIRED' 
                      ? 'You are invited to complete the 25-question technical assessment.' 
                      : user?.applicationStatus === 'UNDER_REVIEW'
                        ? 'Your assessment has been submitted and is currently under administrator review.'
                        : user?.applicationStatus === 'WAITLISTED'
                          ? 'Your application is on the waitlist. You will be notified of decisions.'
                          : 'Complete your application to unlock official AI CLUB member privileges.'}
                  </p>
                </div>
              </div>
              <Link
                to="/application"
                className="pill-btn h-[40px] px-5 text-xs font-semibold shrink-0"
              >
                {user?.applicationStatus === 'TEST_REQUIRED' ? 'Start Mock Test →' : 'View Application →'}
              </Link>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};
