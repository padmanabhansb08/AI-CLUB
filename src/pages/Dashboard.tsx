import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useDashboard } from '../hooks/useDashboard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { EmptyState } from '../components/common/EmptyState';
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
  PlayCircle
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, retry } = useDashboard();

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-800/80 shadow-lg">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span> Authenticated Member Session
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
              Good {greetingTime}, {firstName}!
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {profile?.department ? `${profile.department} &bull; Year ${profile.year} &bull; ` : ''}Learn. Build. Research. Innovate.
            </p>
          </div>

          {/* Profile Completion Callout (if < 100%) */}
          {profileCompletion && profileCompletion.percentage < 100 && (
            <div 
              onClick={() => navigate('/profile')}
              className="bg-gray-800/80 hover:bg-gray-800 border border-gray-700/80 hover:border-accent p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-200 group flex-shrink-0"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} className="text-accent" />
                  <span className="text-xs font-semibold text-gray-200">Profile {profileCompletion.percentage}% Complete</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {profileCompletion.missing?.length > 0 ? (
                    <span>Add {profileCompletion.missing.slice(0, 2).join(', ')} to boost identity</span>
                  ) : (
                    <span>Complete your profile details</span>
                  )}
                </div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-medium group-hover:bg-accent group-hover:text-black transition-colors whitespace-nowrap">
                Complete &rarr;
              </div>
            </div>
          )}
        </div>

        {/* Continue Learning Banner (Sprint 5) */}
        {continueLearning && (
          <div className="p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-900/20 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider flex items-center gap-1">
                  <PlayCircle size={12} /> Continue Learning
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {continueLearning.category?.replace(/_/g, ' ')}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                {continueLearning.title}
              </h3>
              <div className="w-72 max-w-full">
                <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                  <span>Curriculum Progress</span>
                  <span className="text-indigo-400 font-semibold">{continueLearning.progressPercentage || 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${continueLearning.progressPercentage || 0}%` }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate(`/courses/${continueLearning.slug || continueLearning.id}/learn`)}
              className="btn btn-primary flex items-center gap-2 self-start md:self-auto text-sm shrink-0"
            >
              <PlayCircle size={16} /> Resume Course <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Projects Stat */}
          <div 
            onClick={() => navigate('/projects')}
            className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 hover:border-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">My Projects</span>
              <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                <Lightbulb size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-100 font-mono">{stats.projects}</div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {stats.totalProjects ? `${stats.totalProjects} total club projects` : 'Active collaborations'}
            </span>
          </div>

          {/* Courses Stat */}
          <div 
            onClick={() => navigate('/courses')}
            className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 hover:border-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Enrolled Courses</span>
              <div className="p-2 rounded-lg bg-blue-950/40 text-blue-400 border border-blue-800/40">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-100 font-mono">{stats.courses}</div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {stats.totalCourses ? `${stats.totalCourses} learning paths` : 'Curated curriculum'}
            </span>
          </div>

          {/* Achievements Stat */}
          <div 
            onClick={() => navigate('/achievements')}
            className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 hover:border-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Achievements & Points</span>
              <div className="p-2 rounded-lg bg-amber-950/40 text-amber-400 border border-amber-800/40">
                <Trophy size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-100 font-mono">
              {stats.achievements} <span className="text-xs font-normal text-amber-400">({stats.totalPoints || 0} pts)</span>
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Sprint 6 Recognition</span>
          </div>

          {/* Events Stat */}
          <div 
            onClick={() => navigate('/events')}
            className="p-4 rounded-xl border border-gray-800 bg-gray-900/60 hover:border-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400 font-medium">Event Registrations</span>
              <div className="p-2 rounded-lg bg-purple-950/40 text-purple-400 border border-purple-800/40">
                <Calendar size={18} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-100 font-mono">{stats.events}</div>
            <span className="text-[11px] text-gray-500 mt-1 block">
              {stats.totalEvents ? `${stats.totalEvents} upcoming events` : 'Workshops & talks'}
            </span>
          </div>
        </div>

        {/* Main Grid: Activity & Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Personal Activity & Announcements (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            <section className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-800/20">
                <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Megaphone size={16} className="text-blue-400" /> Club Announcements
                </h2>
                <Link to="/announcements" className="text-xs text-accent hover:underline flex items-center gap-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>

              {announcements.length === 0 ? (
                <div className="p-6">
                  <EmptyState title="No Announcements" message="There are no active club announcements at this time." />
                </div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {announcements.map((a: any) => (
                    <div 
                      key={a.id}
                      onClick={() => navigate(`/announcements/${a.id}`)}
                      className={`p-4 hover:bg-gray-800/40 cursor-pointer transition-colors flex items-center justify-between ${
                        !a.read ? 'bg-blue-950/15' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {!a.read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" title="Unread" />}
                        <div>
                          <h4 className="text-sm font-medium text-gray-200">{a.title}</h4>
                          <span className="text-[11px] font-mono text-gray-500">
                            {new Date(a.publishedAt || a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded border border-gray-700 bg-gray-800 text-gray-300 uppercase">
                        {a.category}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Recent Personal Activity */}
            <section className="rounded-xl border border-gray-800 bg-gray-900/40 overflow-hidden">
              <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-800/20">
                <h2 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" /> Recent Personal Activity
                </h2>
                <span className="text-xs text-gray-500">Chronological Milestones</span>
              </div>

              {recentActivity.length === 0 ? (
                <div className="p-6">
                  <EmptyState 
                    title="No Personal Activity Yet" 
                    message="Your project interests, course enrollments, achievements, and event signups will appear here." 
                  />
                </div>
              ) : (
                <div className="divide-y divide-gray-800 p-2">
                  {recentActivity.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => item.link && navigate(item.link)}
                      className="p-3 hover:bg-gray-800/40 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl flex-shrink-0">{item.icon || '📌'}</span>
                        <div>
                          <span className="text-xs font-semibold text-gray-300 block">{item.title}</span>
                          <span className="text-xs text-gray-400">{item.description}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap flex items-center gap-1">
                        <Clock size={10} /> {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Member Identity Quick View & Top Projects (1 Col) */}
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-accent" /> Identity Summary
                </span>
                <Link to="/profile" className="text-xs text-accent hover:underline">
                  Edit
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {profile.profilePhotoUrl ? (
                  <img 
                    src={profile.profilePhotoUrl} 
                    alt={profile.fullName} 
                    className="w-12 h-12 rounded-full object-cover border border-accent"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent text-accent font-bold font-mono flex items-center justify-center">
                    {profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold text-gray-100">{profile.fullName}</h4>
                  <p className="text-xs text-gray-400">{profile.registerNumber}</p>
                </div>
              </div>

              {/* Skills Snippet */}
              <div>
                <span className="text-[11px] text-gray-500 font-medium block mb-1.5 uppercase tracking-wider">Top Skills</span>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {profile.skills.slice(0, 5).map(s => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-500 italic">No skills listed yet.</span>
                )}
              </div>

              {/* Quick Directory CTA */}
              <div className="pt-2 border-t border-gray-800">
                <Link 
                  to="/members" 
                  className="w-full py-2 px-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 flex items-center justify-center gap-2 transition-colors border border-gray-700"
                >
                  Explore Member Directory &rarr;
                </Link>
              </div>
            </div>

            {/* Enrolled Courses / My Learning (Sprint 5) */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-indigo-400" />{' '}
                  {myCourses.length > 0 ? 'My Courses' : 'Curated Learning'}
                </span>
                <Link
                  to={myCourses.length > 0 ? '/my-learning' : '/courses'}
                  className="text-xs text-accent hover:underline"
                >
                  {myCourses.length > 0 ? 'My Learning' : 'All'}
                </Link>
              </div>

              {myCourses && myCourses.length > 0 ? (
                <div className="space-y-2">
                  {myCourses.map((c: any) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/courses/${c.slug || c.id}`)}
                      className="p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-semibold text-gray-200 truncate max-w-[170px]">
                          {c.title}
                        </h5>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 font-medium uppercase">
                          {c.enrollmentStatus || 'ENROLLED'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>{c.category?.replace(/_/g, ' ') || c.difficulty}</span>
                        <span className="text-indigo-400 font-medium">{c.progressPercentage || 0}% Done</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-xs text-gray-400 mb-2">No active enrollments yet.</p>
                  <Link
                    to="/courses"
                    className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                  >
                    Browse Course Catalog &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Projects & Pods */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Lightbulb size={14} className="text-emerald-400" />{' '}
                  {myProjects.length > 0 ? 'My Projects & Pods' : 'Active Projects'}
                </span>
                <Link
                  to={myProjects.length > 0 ? '/projects/my' : '/projects'}
                  className="text-xs text-accent hover:underline"
                >
                  {myProjects.length > 0 ? 'My Pods' : 'All'}
                </Link>
              </div>

              {myProjects && myProjects.length > 0 ? (
                <div className="space-y-2">
                  {myProjects.map((p: any) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.slug || p.id}`)}
                      className="p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-semibold text-gray-200 truncate max-w-[170px]">
                          {p.title}
                        </h5>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium uppercase">
                          {p.role || p.membershipStatus}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>{p.domain?.replace(/_/g, ' ') || p.difficulty}</span>
                        <span>{p.progressPercentage || 0}% Done</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentProjects.length === 0 ? (
                <EmptyState title="No Projects" message="No active projects available right now." />
              ) : (
                <div className="space-y-2">
                  {recentProjects.map((p: any) => (
                    <div 
                      key={p.id}
                      onClick={() => navigate(`/projects/${p.id}`)}
                      className="p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="text-xs font-semibold text-gray-200 truncate max-w-[170px]">{p.title}</h5>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-700 text-gray-300 uppercase">
                          {p.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-1">{p.shortDescription}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements Highlight */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div>
                  <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-400" /> Recognition & Points
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-bold text-amber-400 font-mono">
                      ⭐ {stats.totalPoints || 0} PTS
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      • 🏆 {stats.achievements} Unlocked
                    </span>
                  </div>
                </div>
                <Link to="/achievements" className="text-xs text-accent hover:underline">
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
                      className="p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] text-amber-400 font-mono block uppercase">{ach.category}</span>
                        <h5 className="text-xs font-semibold text-gray-200 truncate">{ach.name || ach.title}</h5>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 shrink-0">
                        +{ach.points || 10}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events Card */}
            <div className="p-5 rounded-xl border border-gray-800 bg-gray-900/40 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-400" /> Upcoming Events
                </span>
                <Link to="/events" className="text-xs text-accent hover:underline">
                  All
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <EmptyState title="No Events" message="No upcoming events scheduled right now." />
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((ev: any) => {
                    const evDate = new Date(ev.startAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    });
                    return (
                      <div
                        key={ev.id}
                        onClick={() => navigate(`/events/${ev.id}`)}
                        className="p-2.5 rounded-lg bg-gray-800/40 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 cursor-pointer transition-colors flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-semibold text-gray-200 truncate">{ev.title}</h5>
                          <span className="text-[11px] text-gray-400 font-mono">{evDate} • {ev.eventType}</span>
                        </div>
                        {ev.isRegistered ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shrink-0">
                            Registered
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-700 text-gray-300 hover:bg-emerald-600 hover:text-black shrink-0 transition-colors">
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
