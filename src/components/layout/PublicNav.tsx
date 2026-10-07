import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X } from 'lucide-react';

export const PublicNav: React.FC = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#F5F4F0]/90 backdrop-blur-md border-b border-[rgba(17,17,17,0.08)] py-3.5 shadow-xs'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Brand Mark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 text-[17px] font-semibold tracking-[-0.025em] text-[#111111] hover:opacity-85 transition-opacity"
        >
          <span className="text-[13px] opacity-75 font-serif">✦</span>
          <span>AI CLUB</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          <a
            href="#manifesto"
            className="text-[14px] text-[#66645F] hover:text-[#111111] tracking-[-0.01em] transition-colors"
          >
            Explore
          </a>
          <a
            href="#learn"
            className="text-[14px] text-[#66645F] hover:text-[#111111] tracking-[-0.01em] transition-colors"
          >
            Learn
          </a>
          <a
            href="#build"
            className="text-[14px] text-[#66645F] hover:text-[#111111] tracking-[-0.01em] transition-colors"
          >
            Build
          </a>
          <a
            href="#research"
            className="text-[14px] text-[#66645F] hover:text-[#111111] tracking-[-0.01em] transition-colors"
          >
            Research
          </a>
          <a
            href="#community"
            className="text-[14px] text-[#66645F] hover:text-[#111111] tracking-[-0.01em] transition-colors"
          >
            Community
          </a>
          <a
            href="#events"
            className="text-[14px] text-[#66645F] hover:text-[#111111] tracking-[-0.01em] transition-colors"
          >
            Events
          </a>
          <a
            href="#projects"
            className="text-[14px] text-[#66645F] hover:text-[#111111] tracking-[-0.01em] transition-colors"
          >
            Projects
          </a>
        </nav>

        {/* Right CTA Area */}
        <div className="hidden sm:flex items-center gap-5">
          {user ? (
            <Link
              to="/dashboard"
              className="pill-btn text-[14px] py-2 px-5 h-[40px]"
            >
              Member Dashboard →
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[14px] font-medium text-[#111111] hover:text-[#66645F] transition-colors px-2"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="pill-btn text-[14px] py-2 px-5 h-[40px]"
              >
                Join AI CLUB →
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="lg:hidden p-2 text-[#111111] focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF9F6] border-b border-[rgba(17,17,17,0.08)] px-6 py-6 flex flex-col gap-4 shadow-lg animate-fadeIn">
          <a
            href="#manifesto"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] text-[#111111] font-medium py-1"
          >
            Explore
          </a>
          <a
            href="#learn"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] text-[#111111] font-medium py-1"
          >
            Learn
          </a>
          <a
            href="#build"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] text-[#111111] font-medium py-1"
          >
            Build
          </a>
          <a
            href="#research"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] text-[#111111] font-medium py-1"
          >
            Research
          </a>
          <a
            href="#community"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] text-[#111111] font-medium py-1"
          >
            Community
          </a>
          <a
            href="#events"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] text-[#111111] font-medium py-1"
          >
            Events
          </a>
          <a
            href="#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[16px] text-[#111111] font-medium py-1"
          >
            Projects
          </a>

          <div className="pt-4 border-t border-[rgba(17,17,17,0.08)] flex flex-col gap-3">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="pill-btn w-full text-center"
              >
                Member Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="pill-outline w-full text-center"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="pill-btn w-full text-center"
                >
                  Join AI CLUB →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
