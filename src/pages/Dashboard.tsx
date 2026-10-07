import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useDashboard } from '../hooks/useDashboard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
import { aiApi } from '../api/ai.api';
import { AIRecommendationCard } from '../components/ai/AIRecommendationCard';
import type { StudentDashboardInsights } from '../types/ai';
import { ArrowRight, Sparkles, PlayCircle, Bot } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, retry } = useDashboard();
  const [aiInsights, setAiInsights] = useState<StudentDashboardInsights | null>(null);
  const [aiTab, setAiTab] = useState<'courses' | 'events' | 'projects'>('courses');

  useEffect(() => {
    let isMounted = true;
    aiApi.getInsights()
      .then(res => {
        if (isMounted) setAiInsights(res);
      })
      .catch(err => {
        console.warn('AI insights unavailable:', err?.message);
      });
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return (
      <DashboardLayout pageTitle="Dashboard">
        <LoadingState message="Loading your personalized AI CLUB dashboard..." fullScreen={false} />
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout pageTitle="Dashboard">
        <ErrorState message={error || 'Unable to load dashboard data.'} onRetry={retry} />
      </DashboardLayout>
    );
  }

  const { 
    profile, 
    profileCompletion, 
    stats, 
    announcements, 
    recentActivity,
    upcomingEvents = [],
    continueLearning = null
  } = data;

  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Member';

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-8 max-w-[1400px] mx-auto pb-16">
        {/* Welcome Header (Section 37) */}
        <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.09)] rounded-[24px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-[#92908A] mb-2">
              <span className="w-2 h-2 rounded-full bg-[#111111]" />
              <span>AUTHENTICATED MEMBER SESSION &middot; NO. 112 KNOWLEDGE QUAD</span>
            </div>
            <h1 className="text-[28px] sm:text-[38px] font-normal tracking-[-0.03em] leading-tight text-[#111111]">
              Good {greetingTime}, {firstName}.
            </h1>
            <p className="text-[16px] text-[#66645F] mt-1.5 flex items-center flex-wrap gap-2">
              <span>What are you building today?</span>
              {profile?.department && (
                <>
                  <span className="text-[#92908A]">&middot;</span>
                  <span>{profile.department}</span>
                </>
              )}
              {profile?.year && (
                <>
                  <span className="text-[#92908A]">&middot;</span>
                  <span>Year {profile.year}</span>
                </>
              )}
            </p>
          </div>

          {/* Profile Completion Callout */}
          {profileCompletion && profileCompletion.percentage < 100 && (
            <div 
              onClick={() => navigate('/profile')}
              className="bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] hover:border-[rgba(17,17,17,0.22)] p-4 rounded-[16px] flex items-center gap-4 cursor-pointer transition-all shrink-0"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-[#111111]" />
                  <span className="text-xs font-semibold text-[#111111]">Profile {profileCompletion.percentage}% Complete</span>
                </div>
                <div className="text-[11.5px] text-[#66645F]">
                  {profileCompletion.missing?.length > 0 ? (
                    <span>Add {profileCompletion.missing.slice(0, 2).join(', ')}</span>
                  ) : (
                    <span>Complete your profile details</span>
                  )}
                </div>
              </div>
              <div className="pill-btn h-[34px] px-3.5 text-xs">
                Edit &rarr;
              </div>
            </div>
          )}
        </div>

        {/* Continue Learning Banner */}
        {continueLearning && (
          <div className="p-6 md:p-8 rounded-[24px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <span className="editorial-number mb-0">CONTINUE LEARNING</span>
                <span className="text-xs text-[#92908A]">
                  &middot; {continueLearning.category?.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-normal tracking-tight text-[#111111]">
                {continueLearning.title}
              </h3>
              <div className="w-80 max-w-full pt-1">
                <div className="flex justify-between text-[11px] text-[#66645F] mb-1.5 font-medium">
                  <span>Curriculum Progress</span>
                  <span className="text-[#111111] font-semibold">{continueLearning.progressPercentage || 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#EBE9E3] overflow-hidden">
                  <div
                    className="h-full bg-[#050505] rounded-full transition-all duration-300"
                    style={{ width: `${continueLearning.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/courses/${continueLearning.slug || continueLearning.id}/learn`)}
              className="pill-btn h-[44px] px-6 text-sm flex items-center gap-2 self-start md:self-auto shrink-0"
            >
              <PlayCircle size={15} /> Resume Course <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* AI Intelligence Section */}
        {aiInsights && (
          <div className="space-y-4">
            <div className="p-6 rounded-[24px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="editorial-number mb-0">✦ NEXT BEST ACTION</span>
                  <span className="text-xs text-[#92908A]">&middot; Personalized Signal</span>
                </div>
                <h4 className="text-lg font-medium tracking-tight text-[#111111] mt-1">
                  {aiInsights.nextBestAction}
                </h4>
                <p className="text-xs text-[#66645F]">
                  {aiInsights.skillSummary}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => navigate('/ai-assistant')}
                  className="pill-btn h-[40px] px-5 text-xs flex items-center gap-1.5"
                >
                  <Bot size={14} /> AI Assistant &rarr;
                </button>
              </div>
            </div>

            {/* AI Personalized Recommendations Deck */}
            <div className="p-6 md:p-8 rounded-[24px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(17,17,17,0.06)] pb-4">
                <div>
                  <span className="editorial-number mb-1">INTELLIGENCE RADAR</span>
                  <h3 className="text-lg font-medium text-[#111111] tracking-tight">
                    Recommended For You
                  </h3>
                </div>

                <div className="flex items-center gap-1 bg-[#FAF9F6] p-1 rounded-full border border-[rgba(17,17,17,0.08)] self-start sm:self-auto">
                  <button
                    onClick={() => setAiTab('courses')}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      aiTab === 'courses' ? 'bg-[#050505] text-[#FFFFFF]' : 'text-[#66645F] hover:text-[#111111]'
                    }`}
                  >
                    Courses ({aiInsights.recommendedCourses.length})
                  </button>
                  <button
                    onClick={() => setAiTab('events')}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      aiTab === 'events' ? 'bg-[#050505] text-[#FFFFFF]' : 'text-[#66645F] hover:text-[#111111]'
                    }`}
                  >
                    Events ({aiInsights.recommendedEvents.length})
                  </button>
                  <button
                    onClick={() => setAiTab('projects')}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      aiTab === 'projects' ? 'bg-[#050505] text-[#FFFFFF]' : 'text-[#66645F] hover:text-[#111111]'
                    }`}
                  >
                    Projects ({aiInsights.recommendedProjects.length})
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {aiTab === 'courses' && aiInsights.recommendedCourses.map(c => (
                  <AIRecommendationCard key={c.courseId} type="course" item={c} />
                ))}
                {aiTab === 'events' && aiInsights.recommendedEvents.map(e => (
                  <AIRecommendationCard key={e.eventId} type="event" item={e} />
                ))}
                {aiTab === 'projects' && aiInsights.recommendedProjects.map(p => (
                  <AIRecommendationCard key={p.projectId} type="project" item={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Grid — Large Typography Numbers (Section 8) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div 
            onClick={() => navigate('/projects')}
            className="p-6 rounded-[20px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] hover:border-[rgba(17,17,17,0.22)] cursor-pointer transition-all shadow-xs group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#92908A] block mb-2">Projects</span>
            <div className="text-[36px] font-normal tracking-tight text-[#111111] leading-none mb-2">{stats.projects}</div>
            <span className="text-[12px] text-[#66645F]">
              {stats.totalProjects ? `${stats.totalProjects} total club projects` : 'Active collaborations'}
            </span>
          </div>

          <div 
            onClick={() => navigate('/courses')}
            className="p-6 rounded-[20px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] hover:border-[rgba(17,17,17,0.22)] cursor-pointer transition-all shadow-xs group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#92908A] block mb-2">Enrolled Courses</span>
            <div className="text-[36px] font-normal tracking-tight text-[#111111] leading-none mb-2">{stats.courses}</div>
            <span className="text-[12px] text-[#66645F]">
              {stats.totalCourses ? `${stats.totalCourses} learning paths` : 'Curated curriculum'}
            </span>
          </div>

          <div 
            onClick={() => navigate('/achievements')}
            className="p-6 rounded-[20px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] hover:border-[rgba(17,17,17,0.22)] cursor-pointer transition-all shadow-xs group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#92908A] block mb-2">Points Earned</span>
            <div className="text-[36px] font-normal tracking-tight text-[#111111] leading-none mb-2">{stats.totalPoints || 0}</div>
            <span className="text-[12px] text-[#66645F]">
              {stats.achievements} Milestones unlocked
            </span>
          </div>

          <div 
            onClick={() => navigate('/events')}
            className="p-6 rounded-[20px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] hover:border-[rgba(17,17,17,0.22)] cursor-pointer transition-all shadow-xs group"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#92908A] block mb-2">Events Attended</span>
            <div className="text-[36px] font-normal tracking-tight text-[#111111] leading-none mb-2">{stats.events}</div>
            <span className="text-[12px] text-[#66645F]">
              {stats.totalEvents ? `${stats.totalEvents} upcoming events` : 'Workshops & talks'}
            </span>
          </div>
        </div>

        {/* Main Grid: Activity & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Activity & Announcements (2 Cols) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Announcements */}
            <section className="rounded-[24px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] overflow-hidden shadow-xs">
              <div className="p-6 border-b border-[rgba(17,17,17,0.06)] flex items-center justify-between">
                <div>
                  <span className="editorial-number mb-0.5">DISPATCHES</span>
                  <h2 className="text-base font-semibold text-[#111111]">Club Announcements</h2>
                </div>
                <Link to="/announcements" className="text-xs text-[#66645F] hover:text-[#111111] font-medium flex items-center gap-1">
                  View all &rarr;
                </Link>
              </div>

              {announcements.length === 0 ? (
                <div className="p-8">
                  <EmptyState title="No Announcements" message="There are no active club announcements at this time." />
                </div>
              ) : (
                <div className="divide-y divide-[rgba(17,17,17,0.06)]">
                  {announcements.map((a: any) => (
                    <div 
                      key={a.id}
                      onClick={() => navigate(`/announcements/${a.id}`)}
                      className="p-5 hover:bg-[#FAF9F6] cursor-pointer transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-[#111111] truncate">{a.title}</h4>
                        <span className="text-[11.5px] text-[#92908A] mt-0.5 block">
                          {new Date(a.publishedAt || a.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-[11px] px-3 py-1 rounded-full border border-[rgba(17,17,17,0.08)] bg-[#FAF9F6] text-[#66645F] uppercase font-medium shrink-0">
                        {a.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Personal Activity */}
            <section className="rounded-[24px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] overflow-hidden shadow-xs">
              <div className="p-6 border-b border-[rgba(17,17,17,0.06)] flex items-center justify-between">
                <div>
                  <span className="editorial-number mb-0.5">LOGS</span>
                  <h2 className="text-base font-semibold text-[#111111]">Personal Milestones</h2>
                </div>
                <span className="text-xs text-[#92908A]">Recent Activity</span>
              </div>

              {recentActivity.length === 0 ? (
                <div className="p-8">
                  <EmptyState 
                    title="No Personal Activity Yet" 
                    message="Your project interests, course enrollments, achievements, and event signups will appear here." 
                  />
                </div>
              ) : (
                <div className="divide-y divide-[rgba(17,17,17,0.06)] p-2">
                  {recentActivity.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => item.link && navigate(item.link)}
                      className="p-4 hover:bg-[#FAF9F6] rounded-[16px] cursor-pointer transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-[#111111] block truncate">{item.title}</span>
                        <span className="text-xs text-[#66645F] truncate block mt-0.5">{item.description}</span>
                      </div>
                      <span className="text-[11.5px] text-[#92908A] whitespace-nowrap shrink-0">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Identity, Learning, Projects, Events */}
          <div className="space-y-8">
            {/* Identity Summary Card */}
            <div className="p-6 rounded-[24px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.06)] pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#92908A]">Member Portfolio</span>
                <Link to="/profile" className="text-xs text-[#111111] font-medium hover:underline">
                  View Profile &rarr;
                </Link>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#050505] text-[#FFFFFF] font-semibold text-sm flex items-center justify-center shrink-0">
                  {profile.fullName?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ST'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-base font-medium text-[#111111] truncate">{profile.fullName}</h4>
                  <p className="text-xs text-[#66645F] font-mono">{profile.registerNumber}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#92908A] font-medium uppercase tracking-wider block mb-2">Verified Skills</span>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 5).map((s: string) => (
                      <span key={s} className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FAF9F6] text-[#111111] border border-[rgba(17,17,17,0.08)]">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-[#92908A] italic">No skills listed yet.</span>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="p-6 rounded-[24px] border border-[rgba(17,17,17,0.09)] bg-[#FFFFFF] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.06)] pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#92908A]">Upcoming Events</span>
                <Link to="/events" className="text-xs text-[#111111] font-medium hover:underline">
                  All &rarr;
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-[#92908A]">No upcoming events scheduled right now.</p>
              ) : (
                <div className="space-y-2.5">
                  {upcomingEvents.slice(0, 3).map((ev: any) => (
                    <div
                      key={ev.id}
                      onClick={() => navigate(`/events/${ev.id}`)}
                      className="p-3.5 rounded-[16px] bg-[#FAF9F6] hover:bg-[#EBE9E3] border border-[rgba(17,17,17,0.06)] cursor-pointer transition-all flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-medium text-[#111111] truncate">{ev.title}</h5>
                        <span className="text-[11px] text-[#92908A]">{new Date(ev.startAt).toLocaleDateString()}</span>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] text-[#111111] shrink-0">
                        {ev.isRegistered ? 'Registered' : 'RSVP'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
