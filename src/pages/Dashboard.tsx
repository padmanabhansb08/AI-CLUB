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
import { 
  ArrowRight, 
  Trophy, 
  Lightbulb, 
  BookOpen, 
  Calendar, 
  Clock, 
  Sparkles, 
  Activity,
  Megaphone,
  UserCheck,
  PlayCircle,
  Bot,
  Target
} from 'lucide-react';

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
    recentProjects, 
    recentAchievements, 
    recentActivity,
    upcomingEvents = [],
    myProjects = [],
    myCourses = [],
    continueLearning = null
  } = data;

  // Determine time-of-day greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Member';

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="space-y-6 max-w-6xl mx-auto pb-12">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-white/10 bg-[#0d131f] shadow-lg">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Authenticated Member Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Good {greetingTime}, {firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center flex-wrap gap-2">
              {profile?.department && <span className="text-slate-300 font-medium">{profile.department}</span>}
              {profile?.year && (
                <>
                  <span className="text-slate-600">•</span>
                  <span>Year {profile.year}</span>
                </>
              )}
              <span className="text-slate-600">•</span>
              <span>Learn. Build. Research. Innovate.</span>
            </p>
          </div>

          {/* Profile Completion Callout (if < 100%) */}
          {profileCompletion && profileCompletion.percentage < 100 && (
            <div 
              onClick={() => navigate('/profile')}
              className="bg-[#121927] hover:bg-[#162032] border border-white/10 hover:border-blue-500/40 p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-200 group shrink-0"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-blue-400" />
                  <span className="text-xs font-semibold text-slate-200">Profile {profileCompletion.percentage}% Complete</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {profileCompletion.missing?.length > 0 ? (
                    <span>Add {profileCompletion.missing.slice(0, 2).join(', ')}</span>
                  ) : (
                    <span>Complete your profile details</span>
                  )}
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors whitespace-nowrap">
                Complete &rarr;
              </div>
            </div>
          )}
        </div>

        {/* Continue Learning Banner */}
        {continueLearning && (
          <div className="p-5 rounded-2xl border border-blue-500/25 bg-[#0f172a] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-wider flex items-center gap-1 font-mono">
                  <PlayCircle size={13} /> Continue Learning
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {continueLearning.category?.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {continueLearning.title}
              </h3>
              <div className="w-80 max-w-full">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1.5 font-medium">
                  <span>Curriculum Progress</span>
                  <span className="text-blue-400 font-bold font-mono">{continueLearning.progressPercentage || 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300"
                    style={{ width: `${continueLearning.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/courses/${continueLearning.slug || continueLearning.id}/learn`)}
              className="btn btn-primary flex items-center gap-2 self-start md:self-auto text-xs sm:text-sm shrink-0"
            >
              <PlayCircle size={16} /> Resume Course <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Next Best Action Banner & AI Intelligence Section (Sprint 8) */}
        {aiInsights && (
          <div className="space-y-4">
            {/* Next Best Action Banner */}
            <div className="p-4 sm:p-5 rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-slate-900 to-sky-900/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30 uppercase tracking-wider flex items-center gap-1 font-mono">
                    <Target size={12} /> Next Best Action
                  </span>
                  <span className="text-xs text-gray-400">Personalized Activity Signal</span>
                </div>
                <h4 className="text-base font-bold text-white mt-1">
                  {aiInsights.nextBestAction}
                </h4>
                <p className="text-xs text-gray-400">
                  {aiInsights.skillSummary}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                <button
                  onClick={() => navigate('/ai-assistant')}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow"
                >
                  <Bot size={14} /> AI Assistant &rarr;
                </button>
              </div>
            </div>

            {/* AI Personalized Recommendations Deck */}
            <div className="p-5 rounded-2xl border border-gray-800 bg-gray-900/50 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-100">
                      Recommended For You
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      AI recommendations grounded in your profile, skills, and learning progress
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-gray-800/80 p-1 rounded-lg border border-gray-700/60 self-start sm:self-auto">
                  <button
                    onClick={() => setAiTab('courses')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      aiTab === 'courses' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Courses ({aiInsights.recommendedCourses.length})
                  </button>
                  <button
                    onClick={() => setAiTab('events')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      aiTab === 'events' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Events ({aiInsights.recommendedEvents.length})
                  </button>
                  <button
                    onClick={() => setAiTab('projects')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      aiTab === 'projects' ? 'bg-sky-500 text-slate-950 font-semibold' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Projects ({aiInsights.recommendedProjects.length})
                  </button>
                </div>
              </div>

              {/* Grid of Recommendation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Weekly Highlights Mini-bar */}
              {aiInsights.weeklyHighlights.length > 0 && (
                <div className="pt-3 border-t border-gray-800/80 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-gray-400 font-mono uppercase">
                    Weekly Highlights:
                  </span>
                  {aiInsights.weeklyHighlights.map((hl, hIdx) => (
                    <span 
                      key={hIdx} 
                      className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                    >
                      {hl}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Projects Stat */}
          <div 
            onClick={() => navigate('/projects')}
            className="p-4 rounded-xl border border-white/10 bg-[#0d131f] hover:bg-[#121927] hover:border-emerald-500/30 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">My Projects</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Lightbulb size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.projects}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.totalProjects ? `${stats.totalProjects} total club projects` : 'Active collaborations'}
            </span>
          </div>

          {/* Courses Stat */}
          <div 
            onClick={() => navigate('/courses')}
            className="p-4 rounded-xl border border-white/10 bg-[#0d131f] hover:bg-[#121927] hover:border-blue-500/30 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Enrolled Courses</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.courses}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.totalCourses ? `${stats.totalCourses} learning paths` : 'Curated curriculum'}
            </span>
          </div>

          {/* Achievements Stat */}
          <div 
            onClick={() => navigate('/achievements')}
            className="p-4 rounded-xl border border-white/10 bg-[#0d131f] hover:bg-[#121927] hover:border-amber-500/30 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Achievements & Points</span>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Trophy size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
              {stats.achievements} <span className="text-xs font-semibold text-amber-400 font-sans">({stats.totalPoints || 0} pts)</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">Platform Recognition</span>
          </div>

          {/* Events Stat */}
          <div 
            onClick={() => navigate('/events')}
            className="p-4 rounded-xl border border-white/10 bg-[#0d131f] hover:bg-[#121927] hover:border-purple-500/30 cursor-pointer transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Event Registrations</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 group-hover:scale-105 transition-transform">
                <Calendar size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">{stats.events}</div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {stats.totalEvents ? `${stats.totalEvents} upcoming events` : 'Workshops & talks'}
            </span>
          </div>
        </div>

        {/* Main Grid: Activity & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal Activity & Announcements (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            <section className="rounded-2xl border border-white/10 bg-[#0d131f] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Megaphone size={16} className="text-blue-400" /> Club Announcements
                </h2>
                <Link to="/announcements" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {announcements.length === 0 ? (
                <div className="p-6">
                  <EmptyState title="No Announcements" message="There are no active club announcements at this time." />
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {announcements.map((a: any) => (
                    <div 
                      key={a.id}
                      onClick={() => navigate(`/announcements/${a.id}`)}
                      className={`p-4 hover:bg-white/[0.03] cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                        !a.read ? 'bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {!a.read && <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" title="Unread" />}
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-200 truncate">{a.title}</h4>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(a.publishedAt || a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-300 uppercase font-mono shrink-0">
                        {a.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Personal Activity */}
            <section className="rounded-2xl border border-white/10 bg-[#0d131f] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" /> Recent Personal Activity
                </h2>
                <span className="text-xs text-slate-400 font-medium">Platform Milestones</span>
              </div>

              {recentActivity.length === 0 ? (
                <div className="p-6">
                  <EmptyState 
                    title="No Personal Activity Yet" 
                    message="Your project interests, course enrollments, achievements, and event signups will appear here." 
                  />
                </div>
              ) : (
                <div className="divide-y divide-white/5 p-2">
                  {recentActivity.map((item) => {
                    const titleLower = (item.title || '').toLowerCase();
                    const isEvent = titleLower.includes('event');
                    const isCourse = titleLower.includes('course') || titleLower.includes('learn');
                    const isAch = titleLower.includes('achievement') || titleLower.includes('unlocked');
                    const isProject = titleLower.includes('project') || titleLower.includes('team');

                    return (
                      <div 
                        key={item.id}
                        onClick={() => item.link && navigate(item.link)}
                        className="p-3 hover:bg-white/[0.03] rounded-xl cursor-pointer transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg border shrink-0 ${
                            isEvent 
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                              : isCourse
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : isAch
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : isProject
                              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {isEvent ? <Calendar size={15} /> : isCourse ? <BookOpen size={15} /> : isAch ? <Trophy size={15} /> : isProject ? <Lightbulb size={15} /> : <Activity size={15} />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-200 block truncate">{item.title}</span>
                            <span className="text-xs text-slate-400 truncate block">{item.description}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                          <Clock size={11} /> {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Member Identity Quick View & Top Projects (1 Col) */}
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d131f] space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck size={14} className="text-blue-400" /> Identity Summary
                </span>
                <Link to="/profile" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  Edit
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {profile.profilePhotoUrl ? (
                  <img 
                    src={profile.profilePhotoUrl} 
                    alt={profile.fullName} 
                    className="w-12 h-12 rounded-full object-cover border border-blue-500/40"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold font-mono flex items-center justify-center text-sm">
                    {profile.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-white truncate">{profile.fullName}</h4>
                  <p className="text-xs text-slate-400 font-mono">{profile.registerNumber}</p>
                </div>
              </div>

              {/* Skills Snippet */}
              <div>
                <span className="text-[11px] text-slate-400 font-medium block mb-1.5 uppercase tracking-wider font-mono">Top Skills</span>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.slice(0, 5).map((s: string) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No skills listed yet.</span>
                )}
              </div>

              {/* Quick Directory CTA */}
              <div className="pt-2 border-t border-white/5">
                <Link 
                  to="/members" 
                  className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-200 flex items-center justify-center gap-2 transition-colors border border-white/10 font-medium"
                >
                  Explore Member Directory &rarr;
                </Link>
              </div>
            </div>

            {/* Enrolled Courses / My Learning */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d131f] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BookOpen size={14} className="text-blue-400" />{' '}
                  {myCourses.length > 0 ? 'My Courses' : 'Curated Learning'}
                </span>
                <Link
                  to={myCourses.length > 0 ? '/my-learning' : '/courses'}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  {myCourses.length > 0 ? 'My Learning' : 'All'}
                </Link>
              </div>

              {myCourses && myCourses.length > 0 ? (
                <div className="space-y-2">
                  {myCourses.slice(0, 3).map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/courses/${c.slug || c.id}`)}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-blue-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h5 className="text-xs font-semibold text-slate-200 truncate flex-1">
                          {c.title}
                        </h5>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-semibold uppercase tracking-wider font-mono shrink-0">
                          {c.enrollmentStatus || 'ENROLLED'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate">{c.category?.replace(/_/g, ' ') || c.difficulty}</span>
                        <span className="text-blue-400 font-semibold font-mono shrink-0">{c.progressPercentage || 0}% Done</span>
                      </div>
                    </div>
                  ))}
                  {myCourses.length > 3 && (
                    <Link
                      to="/my-learning"
                      className="block text-center text-[11px] text-blue-400 hover:text-blue-300 font-medium pt-1"
                    >
                      View all {myCourses.length} courses &rarr;
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-xs text-slate-400 mb-2">No active enrollments yet.</p>
                  <Link
                    to="/courses"
                    className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
                  >
                    Browse Course Catalog &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Projects & Pods */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d131f] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-emerald-400" />{' '}
                  {myProjects.length > 0 ? 'My Projects & Pods' : 'Active Projects'}
                </span>
                <Link
                  to={myProjects.length > 0 ? '/projects/my' : '/projects'}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  {myProjects.length > 0 ? 'My Pods' : 'All'}
                </Link>
              </div>

              {myProjects && myProjects.length > 0 ? (
                <div className="space-y-2">
                  {myProjects.slice(0, 3).map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.slug || p.id}`)}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h5 className="text-xs font-semibold text-slate-200 truncate flex-1">
                          {p.title}
                        </h5>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold uppercase tracking-wider font-mono shrink-0">
                          {p.role || p.membershipStatus}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate">{p.domain?.replace(/_/g, ' ') || p.difficulty}</span>
                        <span className="text-emerald-400 font-semibold font-mono shrink-0">{p.progressPercentage || 0}% Done</span>
                      </div>
                    </div>
                  ))}
                  {myProjects.length > 3 && (
                    <Link
                      to="/projects/my"
                      className="block text-center text-[11px] text-blue-400 hover:text-blue-300 font-medium pt-1"
                    >
                      View all {myProjects.length} projects &rarr;
                    </Link>
                  )}
                </div>
              ) : recentProjects.length === 0 ? (
                <EmptyState title="No Projects" message="No active projects available right now." />
              ) : (
                <div className="space-y-2">
                  {recentProjects.slice(0, 3).map((p: any) => (
                    <div 
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <h5 className="text-xs font-semibold text-slate-200 truncate flex-1">{p.title}</h5>
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 uppercase font-mono shrink-0">
                          {p.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{p.shortDescription}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Highlight */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d131f] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-400" /> Recognition & Points
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-amber-400 font-mono">
                      ⭐ {stats.totalPoints || 0} PTS
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      • 🏆 {stats.achievements} Unlocked
                    </span>
                  </div>
                </div>
                <Link to="/achievements" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  All &rarr;
                </Link>
              </div>

              {recentAchievements.length === 0 ? (
                <EmptyState title="No Achievements Yet" message="Participate in club events or complete courses to earn recognition." />
              ) : (
                <div className="space-y-2">
                  {recentAchievements.slice(0, 4).map((ach: any) => (
                    <div 
                      key={ach.id}
                      onClick={() => navigate(ach.slug ? `/achievements/${ach.slug}` : '/achievements')}
                      className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-amber-500/30 cursor-pointer transition-all flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-amber-400 font-mono block uppercase">{ach.category}</span>
                        <h5 className="text-xs font-semibold text-slate-200 truncate">{ach.name || ach.title}</h5>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 shrink-0 font-mono">
                        +{ach.points || 10}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events Card */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#0d131f] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Calendar size={14} className="text-cyan-400" /> Upcoming Events
                </span>
                <Link to="/events" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  All
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <EmptyState title="No Events" message="No upcoming events scheduled right now." />
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 4).map((ev: any) => {
                    const evDate = new Date(ev.startAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    });
                    return (
                      <div
                        key={ev.id}
                        onClick={() => navigate(`/events/${ev.id}`)}
                        className="p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-cyan-500/30 cursor-pointer transition-all flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-semibold text-slate-200 truncate">{ev.title}</h5>
                          <span className="text-[11px] text-slate-400 font-mono">{evDate} • {ev.eventType}</span>
                        </div>
                        {ev.isRegistered ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0 font-mono">
                            Registered
                          </span>
                        ) : (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-white/10 text-slate-300 hover:bg-emerald-500 hover:text-slate-950 shrink-0 transition-colors font-mono">
                            Register
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
