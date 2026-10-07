import React from 'react';
import { BookOpen, CalendarDays, FolderKanban, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      <aside className="auth-sidebar">
        <div className="noticeboard-pattern" aria-hidden="true" />
        <div className="auth-sidebar-content">
          <div className="auth-sidebar-top">
            <Link to="/login" className="auth-brand" aria-label="AI CLUB login">
              <span className="auth-brand-mark">AI</span>
              <span className="auth-brand-name">AI CLUB</span>
            </Link>
            <span className="auth-campus-mark">SIET · Student club</span>
          </div>

          <div className="auth-story">
            <p className="auth-kicker">Learn by making</p>
            <h1 className="auth-tagline">Your club, in one place.</h1>
            <p className="auth-description">
              Your member space for club events, hands-on projects, learning tracks, and the people behind them.
            </p>

            <div className="club-highlights" aria-label="What members can access">
              <div className="club-highlight">
                <span><FolderKanban size={19} /></span>
                <div><strong>Project teams</strong><small>Find a team or continue your build</small></div>
              </div>
              <div className="club-highlight">
                <span><BookOpen size={19} /></span>
                <div><strong>Courses & workshops</strong><small>Learn together, one practical topic at a time</small></div>
              </div>
              <div className="club-highlight">
                <span><CalendarDays size={19} /></span>
                <div><strong>Club events</strong><small>See what is coming up and save your spot</small></div>
              </div>
            </div>
          </div>

          <div className="auth-sidebar-footer">
            <UsersRound size={17} />
            <span>Student-led. Curious people welcome.</span>
          </div>
        </div>
      </aside>

      <section className="auth-content">
        <div className="auth-form-container">
          <div className="auth-mobile-brand">
            <span className="auth-brand-mark">AI</span>
            <div><strong>AI CLUB</strong><small>SIET student club</small></div>
          </div>
          <div className="auth-form-header">
            <p className="auth-form-kicker">AI CLUB community</p>
            <h2 className="auth-form-title">{title}</h2>
            <p className="auth-form-subtitle">{subtitle}</p>
          </div>
          {children}
        </div>

        <div className="auth-page-footer">
          <span>AI CLUB · SIET</span>
          <span>Learn · Build · Share</span>
        </div>
      </section>
    </div>
  );
};
