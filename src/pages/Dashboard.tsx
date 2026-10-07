import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useDashboard } from '../hooks/useDashboard';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';

export function Dashboard() {
  const { data, loading, error, retry } = useDashboard();
  if (loading) return <DashboardLayout pageTitle="Dashboard"><LoadingState message="Loading your club activity…" /></DashboardLayout>;
  if (error || !data) return <DashboardLayout pageTitle="Dashboard"><ErrorState message={error || 'Dashboard unavailable.'} onRetry={retry} /></DashboardLayout>;
  const { profile, profileCompletion, stats, announcements, recentActivity, upcomingEvents = [], myProjects = [], continueLearning } = data;
  const name = profile?.fullName?.split(' ')[0] || 'Member';
  const metrics = [
    { label: 'Your projects', value: stats.projects, detail: 'Teams and collaborations', href: '/my-projects' },
    { label: 'Learning', value: stats.courses, detail: 'Enrolled courses', href: '/my-learning' },
    { label: 'Achievements', value: stats.achievements, detail: `${stats.points ?? data.totalPoints ?? 0} points earned`, href: '/achievements' },
    { label: 'Events', value: stats.events, detail: 'Your registrations', href: '/events/my' },
  ];
  return <DashboardLayout pageTitle="Dashboard">
    <div className="member-dashboard">
      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">Your club, at a glance</span>
          <h2>Welcome back, {name}.</h2>
          <p>{profile.department} · Year {profile.year} · Catch up and choose what to work on next.</p>
        </div>
        {profileCompletion?.percentage < 100 && <Link className="profile-completion-link" to="/profile">Complete your profile · {profileCompletion.percentage}%</Link>}
      </div>
      <div className="dashboard-stat-row">
        {metrics.map(metric => <Link key={metric.label} to={metric.href} className="dashboard-stat"><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.detail}</small></Link>)}
      </div>
      {continueLearning && <section className="learning-resume">
        <div><span className="dashboard-eyebrow">{continueLearning.progressPercentage === 100 ? 'Revisit your learning' : 'Continue learning'}</span><h3>{continueLearning.title}</h3><p>{continueLearning.progressPercentage || 0}% complete</p></div>
        <Link to={`/courses/${continueLearning.slug || continueLearning.id}/learn`}>{continueLearning.progressPercentage === 100 ? 'Review course' : 'Resume course'} →</Link>
      </section>}
      <div className="dashboard-editorial-grid">
        <div className="dashboard-stack">
          <section className="community-panel">
            <header className="community-panel-header"><h3>Club announcements</h3><Link to="/announcements">View all →</Link></header>
            {announcements.length ? announcements.slice(0, 4).map(item => <Link key={item.id} className="community-list-row" to={`/announcements/${item.id}`}><strong>{item.title}</strong><small>{new Date(item.publishedAt || item.createdAt).toLocaleDateString('en-IN')} · {item.category || 'Club news'}</small></Link>) : <p className="community-empty">No announcements yet. Club news will appear here.</p>}
          </section>
          <section className="community-panel">
            <header className="community-panel-header"><h3>Your recent activity</h3><Link to="/notifications">Activity feed →</Link></header>
            {recentActivity.length ? recentActivity.slice(0, 5).map(item => <Link key={item.id} className="community-list-row" to={item.link || '/notifications'}><strong>{item.title}</strong><p>{item.description}</p><small>{new Date(item.timestamp).toLocaleDateString('en-IN')}</small></Link>) : <p className="community-empty">Join an event, start a course, or work on a project to get going.</p>}
          </section>
        </div>
        <div className="dashboard-stack">
          <section className="community-panel">
            <header className="community-panel-header"><h3>Upcoming events</h3><Link to="/events">Browse →</Link></header>
            {upcomingEvents.length ? upcomingEvents.slice(0, 4).map(item => <Link key={item.id} className="community-list-row" to={`/events/${item.id}`}><strong>{item.title}</strong><small>{new Date(item.startAt || item.start_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {item.eventType || item.event_type || 'Club event'}</small></Link>) : <p className="community-empty">There are no upcoming events right now.</p>}
          </section>
          <section className="community-panel">
            <header className="community-panel-header"><h3>Your project workspace</h3><Link to="/my-projects">View all →</Link></header>
            {myProjects.length ? myProjects.slice(0, 3).map(item => <Link key={item.id} className="community-list-row" to={`/projects/${item.slug || item.id}`}><strong>{item.title}</strong><small>{item.status?.replace(/_/g, ' ') || 'In progress'}</small></Link>) : <div className="community-empty"><p>You haven’t joined a project yet.</p><Link to="/projects" className="text-accent">Find a project →</Link></div>}
          </section>
        </div>
      </div>
    </div>
  </DashboardLayout>;
}
