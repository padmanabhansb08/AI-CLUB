import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout">
      {/* LEFT SIDE: Branding */}
      <div className="auth-sidebar">
        <div className="tech-pattern"></div>
        <div className="auth-sidebar-content">
          <div className="auth-brand">
            <span style={{ color: 'var(--accent-color)' }}>{'>_'}</span> AI CLUB
          </div>
          <h1 className="auth-tagline">Learn. Build.<br/>Research.<br/>Innovate.</h1>
          <p className="auth-description">
            Join a community of builders, researchers, and innovators pushing the boundaries of artificial intelligence.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form Panel */}
      <div className="auth-content">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2 className="auth-form-title">{title}</h2>
            <p className="auth-form-subtitle">{subtitle}</p>
          </div>
          
          {children}
        </div>
        
        <Link to="/admin" className="admin-link">Admin Access</Link>
      </div>
    </div>
  );
};
