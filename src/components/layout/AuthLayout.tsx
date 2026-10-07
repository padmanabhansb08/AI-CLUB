import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout min-h-screen bg-[#F5F4F0] text-[#111111]">
      {/* LEFT SIDE: Editorial Typography & Atmosphere */}
      <div className="auth-sidebar bg-[#EBE9E3] border-r border-[rgba(17,17,17,0.08)] relative">
        <div className="grain-overlay" />
        <Link to="/" className="auth-brand">
          <span className="font-serif text-[14px]">✦</span> AI CLUB
        </Link>
        <div className="auth-sidebar-content my-auto">
          <span className="editorial-number">ADMISSIONS &amp; IDENTITY</span>
          <h1 className="auth-tagline">
            Intelligence for the next generation.
          </h1>
          <p className="auth-description">
            A community where students explore artificial intelligence, build purposeful systems, and research what comes next.
          </p>
        </div>
        <div className="text-[12px] text-[#92908A] tracking-wider uppercase">
          112 Knowledge Quad &middot; Campus Center
        </div>
      </div>

      {/* RIGHT SIDE: Minimal Editorial Form Panel */}
      <div className="auth-content bg-[#F5F4F0] relative">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-[15px] font-semibold mb-6 text-[#111111]">
              <span className="font-serif">✦</span> AI CLUB
            </Link>
            <h2 className="auth-form-title">{title}</h2>
            <p className="auth-form-subtitle">{subtitle}</p>
          </div>
          
          <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-[20px] p-8 shadow-[0_12px_32px_rgba(0,0,0,0.03)]">
            {children}
          </div>
        </div>
        
        <div className="mt-8 text-center text-[12.5px] text-[#92908A]">
          <Link to="/admin/login" className="hover:text-[#111111] transition-colors">
            Administrative Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
