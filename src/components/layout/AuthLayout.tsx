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
          <Link to="/" className="auth-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', textDecoration: 'none', color: '#fafafa', marginBottom: '2rem' }}>
            <svg viewBox="0 0 31.5 48.5" width="28" height="42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="bg_auth_logo" x1="8" y1="0" x2="34.1" y2="28.9" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#9e9e9e"/>
                  <stop offset="0.28" stopColor="#a6a6a6"/>
                  <stop offset="0.34" stopColor="#a3a3a3"/>
                  <stop offset="0.40" stopColor="#3a3a3a"/>
                  <stop offset="0.55" stopColor="#414141"/>
                  <stop offset="0.60" stopColor="#7a7a7a"/>
                  <stop offset="0.68" stopColor="#8e8e8e"/>
                  <stop offset="0.80" stopColor="#a9a9a9"/>
                  <stop offset="0.95" stopColor="#c4c4c4"/>
                  <stop offset="1" stopColor="#cccccc"/>
                </linearGradient>
              </defs>
              <path d="M21.5 0 L21.5 19.5 L31.5 19.5 L31.5 29 L10 48.5 L10 28.5 L0.5 28.5 L0.5 18.5 Z" fill="url(#bg_auth_logo)"/>
              <rect x="0.5" y="18.5" width="9" height="10" fill="#fdfdfd"/>
              <rect x="22" y="19.5" width="9.5" height="9.5" fill="#fdfdfd"/>
            </svg>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>AI CLUB</span>
          </Link>
          <h1 className="auth-tagline" style={{ fontSize: '2.5rem', lineHeight: 1.15, fontWeight: 400, color: '#fafafa', marginBottom: '1.25rem' }}>
            The Next Layer<br/>of Intelligence.
          </h1>
          <p className="auth-description" style={{ color: '#a7a6a6', lineHeight: 1.6, fontSize: '0.95rem' }}>
            A unified infrastructure platform to help teams build, ship, and scale AI systems with confidence.
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
