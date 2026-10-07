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
    <div className="auth-layout min-h-screen bg-[#F5F4F0] text-[#111111]">
      {/* LEFT SIDE: Editorial Typography & Atmosphere */}
      <aside className="auth-sidebar bg-[#EBE9E3] border-r border-[rgba(17,17,17,0.08)] relative">
        <div className="grain-overlay" aria-hidden="true" />
        <div className="auth-sidebar-content flex flex-col justify-between h-full p-8 md:p-12 relative z-10">
          <div className="auth-sidebar-top">
            <Link to="/" className="auth-brand inline-flex items-center gap-2 text-base font-semibold text-[#111111]" aria-label="AI CLUB home">
              <span className="font-serif text-[15px]">✦</span>
              <span>AI CLUB</span>
            </Link>
            <div className="text-[11px] font-mono tracking-wider uppercase text-[#92908A] mt-1">SIET · Student Club</div>
          </div>

          <div className="auth-sidebar-body my-auto py-8">
            <span className="text-[11px] font-mono tracking-widest uppercase text-[#92908A] block mb-3">
              ADMISSIONS &amp; IDENTITY
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-normal text-[#111111] leading-tight mb-4">
              Intelligence for the next generation.
            </h1>
            <p className="text-sm text-[#66645F] leading-relaxed mb-8 max-w-sm">
              Your member space for club events, hands-on projects, learning tracks, and the people behind them.
            </p>

            <div className="club-highlights flex flex-col gap-3.5" aria-label="What members can access">
              <div className="club-highlight flex items-center gap-3 text-xs text-[#44423E]">
                <FolderKanban size={17} className="text-[#111111] shrink-0" />
                <span><strong>Project teams</strong> &mdash; Build purposeful AI systems</span>
              </div>
              <div className="club-highlight flex items-center gap-3 text-xs text-[#44423E]">
                <BookOpen size={17} className="text-[#111111] shrink-0" />
                <span><strong>Courses &amp; workshops</strong> &mdash; Practical ML curriculums</span>
              </div>
              <div className="club-highlight flex items-center gap-3 text-xs text-[#44423E]">
                <CalendarDays size={17} className="text-[#111111] shrink-0" />
                <span><strong>Club events</strong> &mdash; Hackathons and research seminars</span>
              </div>
            </div>
          </div>

          <div className="auth-sidebar-footer text-[12px] text-[#92908A] flex items-center gap-2">
            <UsersRound size={15} />
            <span>Student-led. Curious people welcome.</span>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE: Minimal Editorial Form Panel */}
      <section className="auth-content bg-[#F5F4F0] relative flex items-center justify-center p-6 md:p-12">
        <div className="auth-form-container w-full max-w-md">
          <div className="auth-form-header mb-6">
            <Link to="/" className="lg:hidden inline-flex items-center gap-2 text-[15px] font-semibold mb-6 text-[#111111]">
              <span className="font-serif">✦</span> AI CLUB
            </Link>
            <p className="text-[11px] font-mono tracking-wider uppercase text-[#92908A] mb-1">AI CLUB COMMUNITY</p>
            <h2 className="text-2xl font-serif font-normal text-[#111111] mb-1">{title}</h2>
            <p className="text-xs text-[#66645F]">{subtitle}</p>
          </div>
          
          <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-[20px] p-6 md:p-8 shadow-[0_12px_32px_rgba(0,0,0,0.03)]">
            {children}
          </div>

          <div className="mt-6 flex items-center justify-between text-[12px] text-[#92908A]">
            <span>AI CLUB · SIET</span>
            <Link to="/admin/login" className="hover:text-[#111111] transition-colors font-medium">
              Administrative Portal &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
