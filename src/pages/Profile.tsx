import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useMemberProfile } from '../hooks/useMemberProfile';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { YEAR_OPTIONS, DEPARTMENT_OPTIONS, SECTION_OPTIONS } from '../constants/academicOptions';
import type { SkillProficiency, SkillItem } from '../types/profile';
import { 
  User, 
  Link as LinkIcon, 
  CheckCircle, 
  AlertCircle, 
  Edit2, 
  X, 
  Save, 
  ExternalLink,
  Plus,
  Sparkles,
  Camera,
  Layers,
  Award,
  BookOpen,
  FolderGit2,
  Trophy
} from 'lucide-react';
import { coursesApi } from '../api/courses.api';
import { projectsApi } from '../api/projects.api';
import { achievementsApi } from '../api/achievements.api';
import type { CourseEnrollmentItem } from '../types/courses';
import type { ProjectItem } from '../types/projects';
import type { MemberAchievementItem, MemberAchievementStats } from '../types/achievements';
import { AchievementBadge } from '../components/achievements/AchievementBadge';

export const Profile: React.FC = () => {
  const {
    profile,
    catalogSkills,
    catalogInterests,
    loading,
    error,
    saving,
    saveError,
    setSaveError,
    updateProfile,
    refresh,
  } = useMemberProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [classSection, setClassSection] = useState('');
  const [year, setYear] = useState<number>(1);
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  // Skills State (normalized)
  const [selectedSkills, setSelectedSkills] = useState<SkillItem[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillProficiency>('INTERMEDIATE');

  // Interests State
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [newInterestName, setNewInterestName] = useState('');

  // Course Enrollments State (Sprint 5) & Projects State (Sprint 4) & Achievements (Sprint 6)
  const [myEnrollments, setMyEnrollments] = useState<CourseEnrollmentItem[]>([]);
  const [myProjects, setMyProjects] = useState<ProjectItem[]>([]);
  const [myAchievements, setMyAchievements] = useState<MemberAchievementItem[]>([]);
  const [achievementStats, setAchievementStats] = useState<MemberAchievementStats | null>(null);

  useEffect(() => {
    coursesApi.getMyCourses()
      .then(data => setMyEnrollments(data || []))
      .catch(() => {});
    projectsApi.getMyProjects()
      .then(data => setMyProjects(data || []))
      .catch(() => {});
    achievementsApi.getMyAchievements()
      .then(data => setMyAchievements(data || []))
      .catch(() => {});
    achievementsApi.getMyStats()
      .then(data => setAchievementStats(data))
      .catch(() => {});
  }, []);

  // Sync form with profile when loaded or toggling edit
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setDepartment(profile.department || '');
      setClassSection(profile.classSection || '');
      setYear(profile.year || 1);
      setPhone(profile.phone || '');
      setBio(profile.bio || '');
      setProfilePhotoUrl(profile.profilePhotoUrl || '');
      setGithubUrl(profile.githubUrl || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setPortfolioUrl(profile.portfolioUrl || '');

      if (profile.normalizedSkills && profile.normalizedSkills.length > 0) {
        setSelectedSkills(profile.normalizedSkills);
      } else if (profile.skills && profile.skills.length > 0) {
        setSelectedSkills(profile.skills.map(s => ({ name: s, proficiency: 'INTERMEDIATE' })));
      } else {
        setSelectedSkills([]);
      }

      if (profile.technicalInterests && profile.technicalInterests.length > 0) {
        setSelectedInterests(profile.technicalInterests);
      } else {
        setSelectedInterests([]);
      }
    }
  }, [profile, isEditing]);

  const handleAddSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    if (selectedSkills.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setNewSkillName('');
      return;
    }
    setSelectedSkills(prev => [...prev, { name: trimmed, proficiency: newSkillProficiency }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (name: string) => {
    setSelectedSkills(prev => prev.filter(s => s.name.toLowerCase() !== name.toLowerCase()));
  };

  const handleToggleInterest = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSelectedInterests(prev => {
      const exists = prev.some(i => i.toLowerCase() === trimmed.toLowerCase());
      if (exists) {
        return prev.filter(i => i.toLowerCase() !== trimmed.toLowerCase());
      }
      return [...prev, trimmed];
    });
  };

  const handleAddCustomInterest = () => {
    const trimmed = newInterestName.trim();
    if (!trimmed) return;
    if (!selectedInterests.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedInterests(prev => [...prev, trimmed]);
    }
    setNewInterestName('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveError(null);
      setSaveSuccess('');

      await updateProfile({
        fullName: fullName.trim(),
        department,
        classSection,
        year: Number(year),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
        profilePhotoUrl: profilePhotoUrl.trim() || undefined,
        githubUrl: githubUrl.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        skills: selectedSkills,
        technicalInterests: selectedInterests,
      });

      setIsEditing(false);
      setSaveSuccess('Your profile has been successfully updated.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch {
      // Error handled by hook
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Member Profile">
        <LoadingState message="Loading your profile details..." fullScreen={false} />
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout pageTitle="Member Profile">
        <ErrorState message={error || 'Failed to load member profile.'} onRetry={refresh} />
      </DashboardLayout>
    );
  }

  const completionPct = profile.profileCompletion?.percentage || 0;
  const missingItems = profile.profileCompletion?.missing || [];

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="page-container max-w-5xl mx-auto pb-12">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="page-title mb-1 text-2xl font-bold flex items-center gap-2">
              <User size={24} className="text-accent" /> Your profile
            </h1>
            <p className="text-gray-400 text-sm">
              Update your details, skills, interests, and public club profile.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
                <Edit2 size={16} /> Edit Profile
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleCancel} className="flex items-center gap-2">
                <X size={16} /> Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-lg bg-green-950/40 border border-green-700/60 text-green-300 flex items-center gap-3 text-sm">
            <CheckCircle size={18} className="text-green-400 flex-shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {saveError && (
          <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-700/60 text-red-300 flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Profile Completion Bar */}
        <div className="mb-8 p-5 rounded-xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              <span className="font-semibold text-gray-200">Profile Completion</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">
                {completionPct}%
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {profile.profileCompletion?.completed || 0} of {profile.profileCompletion?.total || 11} attributes completed
            </span>
          </div>

          <div className="w-full h-2.5 bg-gray-800 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-accent transition-all duration-700 ease-out"
              style={{ width: `${completionPct}%` }}
            />
          </div>

          {missingItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-gray-500">Missing fields:</span>
              {missingItems.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors flex items-center gap-1 border border-gray-700"
                >
                  <Plus size={12} /> {({ profilePhoto: 'Profile photo', bio: 'About you', skills: 'Skills', interests: 'Interests', github: 'GitHub', linkedin: 'LinkedIn', portfolio: 'Portfolio' } as Record<string,string>)[item] || item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode vs Edit Mode */}
        {!isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="lg:col-span-1 rounded-xl border border-gray-800 bg-gray-900/40 p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                {profile.profilePhotoUrl ? (
                  <img 
                    src={profile.profilePhotoUrl} 
                    alt={profile.fullName} 
                    className="w-28 h-28 rounded-full object-cover border-2 border-accent shadow-lg shadow-accent/10"
                    onError={(e) => {
                      // Fallback on broken image
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-accent text-3xl font-bold font-mono">
                    {profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-gray-900" title="Active Member"></span>
              </div>

              <h2 className="text-xl font-bold text-gray-100">{profile.fullName}</h2>
              <p className="text-xs font-mono text-gray-400 mt-0.5">{profile.registerNumber}</p>
              
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/80 border border-gray-700 text-xs text-gray-300">
                <span>{profile.department}</span>
                <span>&bull;</span>
                <span>Year {profile.year}</span>
                <span>&bull;</span>
                <span>Sec {profile.classSection}</span>
              </div>

              <div className="w-full border-t border-gray-800 my-5"></div>

              {/* Contact Info */}
              <div className="w-full text-left space-y-2.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500">College Email</span>
                  <span className="font-mono text-gray-300 truncate max-w-[160px]">{profile.collegeEmail}</span>
                </div>
                {profile.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-mono text-gray-300">{profile.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Member Since</span>
                  <span className="text-gray-300">{new Date(profile.joinedAt || profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-400 font-medium">{profile.status}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-gray-500">Events Attended</span>
                  <span className="text-emerald-400 font-semibold font-mono">{profile.eventsAttended ?? 0}</span>
                </div>
              </div>

              {/* Social Links */}
              {(profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl) && (
                <div className="w-full mt-6 pt-4 border-t border-gray-800 flex justify-center gap-3">
                  {profile.githubUrl && (
                    <a 
                      href={profile.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
                      title="GitHub Profile"
                    >
                      <LinkIcon size={16} />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a 
                      href={profile.linkedinUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300 transition-colors"
                      title="LinkedIn Profile"
                    >
                      <LinkIcon size={16} />
                    </a>
                  )}
                  {profile.portfolioUrl && (
                    <a 
                      href={profile.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-accent hover:text-accent-hover transition-colors"
                      title="Personal Portfolio"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Details Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About / Bio */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
                <h3 className="text-base font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <User size={18} className="text-accent" /> About
                </h3>
                {profile.bio ? (
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-gray-500 italic">No bio provided yet. Click "Edit Profile" to share your background and goals.</p>
                )}
              </div>

              {/* Technical Skills */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
                <h3 className="text-base font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <Layers size={18} className="text-accent" /> Skills & Proficiencies
                </h3>
                {profile.normalizedSkills && profile.normalizedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.normalizedSkills.map(s => (
                      <div 
                        key={s.name} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/80 text-xs"
                      >
                        <span className="font-medium text-gray-200">{s.name}</span>
                        {s.proficiency && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                            s.proficiency === 'EXPERT' ? 'bg-purple-900/40 text-purple-300 border border-purple-700/50' :
                            s.proficiency === 'ADVANCED' ? 'bg-blue-900/40 text-blue-300 border border-blue-700/50' :
                            s.proficiency === 'INTERMEDIATE' ? 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50' :
                            'bg-gray-700 text-gray-300'
                          }`}>
                            {s.proficiency}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <span key={skill} className="px-3 py-1 rounded bg-gray-800 text-gray-300 text-xs border border-gray-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No skills listed yet.</p>
                )}
              </div>

              {/* Technical Interests */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6">
                <h3 className="text-base font-semibold text-gray-200 mb-3 flex items-center gap-2">
                  <Award size={18} className="text-accent" /> Technical Interests & Focus
                </h3>
                {profile.technicalInterests && profile.technicalInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.technicalInterests.map(interest => (
                      <span 
                        key={interest} 
                        className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No technical interests specified.</p>
                )}
              </div>

              {/* Projects & Collaborations (Sprint 4) */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2 m-0">
                    <FolderGit2 size={18} className="text-emerald-400" /> Projects & Collaborations
                  </h3>
                  <a
                    href="/projects/my"
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    View All &rarr;
                  </a>
                </div>

                {myProjects.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No project participations yet. Explore active club initiatives!</p>
                ) : (
                  <div className="space-y-3">
                    {myProjects.slice(0, 4).map((proj) => {
                      const isComplete = proj.status === 'COMPLETED' || proj.progress_percentage === 100;
                      return (
                        <div
                          key={proj.id}
                          className="p-3 rounded-lg bg-gray-800/40 border border-gray-800 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-200 truncate">
                                {proj.title}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${
                                isComplete
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-blue-500/15 text-blue-400'
                              }`}>
                                {proj.current_member_role || proj.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-400">
                              <span>{typeof proj.domain === 'string' ? proj.domain.replace(/_/g, ' ') : 'AI / ML'}</span>
                              <span>Progress: {proj.progress_percentage || 0}%</span>
                            </div>
                          </div>

                          <a
                            href={`/projects/${proj.slug || proj.id}`}
                            className="text-xs px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
                          >
                            View
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Learning & Courses (Sprint 5) */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2 m-0">
                    <BookOpen size={18} className="text-indigo-400" /> Learning & Courses
                  </h3>
                  <a
                    href="/my-learning"
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    View All &rarr;
                  </a>
                </div>

                {myEnrollments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No enrolled courses yet. Discover courses in the catalog!</p>
                ) : (
                  <div className="space-y-3">
                    {myEnrollments.slice(0, 4).map((enr) => {
                      const course = enr.course;
                      const isComplete = enr.status === 'COMPLETED' || (enr.progress_percentage || 0) === 100;
                      return (
                        <div
                          key={enr.id}
                          className="p-3 rounded-lg bg-gray-800/40 border border-gray-800 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-200 truncate">
                                {course?.title || 'Course'}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${
                                isComplete
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-indigo-500/15 text-indigo-400'
                              }`}>
                                {isComplete ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-gray-400">
                              <span>{course?.category?.replace(/_/g, ' ') || 'General'}</span>
                              {enr.completed_at ? (
                                <span>Completed: {new Date(enr.completed_at).toLocaleDateString()}</span>
                              ) : (
                                <span>Progress: {enr.progress_percentage || 0}%</span>
                              )}
                            </div>
                          </div>

                          <a
                            href={isComplete ? `/courses/${course?.slug || course?.id}` : `/courses/${course?.slug || course?.id}/learn`}
                            className="text-xs px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
                          >
                            {isComplete ? 'Review' : 'Continue'}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Achievements & Recognition (Sprint 6) */}
              <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-amber-400" />
                    <h3 className="text-base font-semibold text-gray-200 m-0">
                      Achievements & Recognition
                    </h3>
                    {achievementStats && (
                      <span className="text-xs font-bold text-amber-400 font-mono ml-2">
                        ⭐ {achievementStats.totalPoints} PTS
                      </span>
                    )}
                  </div>
                  <a
                    href="/achievements"
                    className="text-xs text-accent hover:underline flex items-center gap-1"
                  >
                    View All &rarr;
                  </a>
                </div>

                {myAchievements.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No achievements unlocked yet. Attend events or complete courses to start earning recognition!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {myAchievements.map((item) => {
                      const ach = item.achievement;
                      return (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-gray-800/40 border border-gray-800 flex items-center gap-3"
                        >
                          <AchievementBadge
                            iconName={ach?.icon}
                            isUnlocked={true}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-xs font-bold text-white truncate">
                                {ach?.name || 'Achievement'}
                              </span>
                              <span className="text-[10px] font-bold text-amber-400 font-mono">
                                +{ach?.points || 10}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400 line-clamp-1">
                              {ach?.description}
                            </p>
                            <span className="text-[10px] text-gray-500 mt-1 block">
                              Earned {new Date(item.earned_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Dedicated Edit Mode */
          <form onSubmit={handleSave} className="space-y-8">
            {/* Section 1: Personal & Academic */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
              <h3 className="text-base font-semibold text-gray-200 border-b border-gray-800 pb-3">
                1. Personal & Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  label="Register number"
                  value={profile.registerNumber}
                  disabled
                />
                <Select
                  label="Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={DEPARTMENT_OPTIONS}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Year"
                    value={String(year)}
                    onChange={(e) => setYear(Number(e.target.value))}
                    options={YEAR_OPTIONS}
                    required
                  />
                  <Select
                    label="Section"
                    value={classSection}
                    onChange={(e) => setClassSection(e.target.value)}
                    options={SECTION_OPTIONS}
                    required
                  />
                </div>
                <Input
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />
                <Input
                  label="Email address"
                  value={profile.collegeEmail}
                  disabled
                />
              </div>
            </div>

            {/* Section 2: Bio & Profile Photo */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
              <h3 className="text-base font-semibold text-gray-200 border-b border-gray-800 pb-3 flex items-center gap-2">
                <Camera size={18} className="text-accent" /> 2. Profile Photo & About
              </h3>

              <div>
                <Input
                  label="Profile Photo URL"
                  value={profilePhotoUrl}
                  onChange={(e) => setProfilePhotoUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                {profilePhotoUrl && (
                  <div className="mt-3 flex items-center gap-4">
                    <img 
                      src={profilePhotoUrl} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-full object-cover border border-accent"
                      onError={(e) => {
                        (e.target as HTMLElement).style.opacity = '0.3';
                      }}
                    />
                    <div className="text-xs text-gray-400">
                      Live preview. If image fails to load, ensure the URL is publicly accessible.
                    </div>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setProfilePhotoUrl('')}
                      className="text-xs px-2.5 py-1 ml-auto"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="profile-bio" className="block text-sm font-medium text-gray-300 mb-1">
                  Bio / About Me ({bio.length}/1000)
                </label>
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="w-full bg-dark-bg border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:outline-none focus:border-accent"
                  placeholder="Share a brief overview of your technical background, research passions, and engineering focus..."
                />
              </div>
            </div>

            {/* Section 3: Normalized Skills */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
              <h3 className="text-base font-semibold text-gray-200 border-b border-gray-800 pb-3 flex items-center gap-2">
                <Layers size={18} className="text-accent" /> 3. Skills & Proficiencies
              </h3>

              {/* Current Selected Skills */}
              <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 rounded-lg bg-dark-bg border border-gray-800">
                {selectedSkills.length === 0 ? (
                  <span className="text-xs text-gray-500 italic">No skills added yet. Add from catalog below or type a custom skill.</span>
                ) : (
                  selectedSkills.map(skill => (
                    <div 
                      key={skill.name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-gray-200"
                    >
                      <span>{skill.name}</span>
                      <span className="text-[10px] text-accent font-mono uppercase bg-accent/10 px-1 py-0.5 rounded">
                        {skill.proficiency || 'INTERMEDIATE'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-gray-400 hover:text-red-400 transition-colors ml-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Add Skill Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="sm:col-span-1">
                  <input
                    type="text"
                    value={newSkillName}
                    aria-label="Add a skill"
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. PyTorch, React, Rust"
                    className="w-full bg-dark-bg border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                  />
                </div>
                <div className="sm:col-span-1">
                  <select
                    value={newSkillProficiency}
                    aria-label="Skill proficiency"
                    onChange={(e) => setNewSkillProficiency(e.target.value as SkillProficiency)}
                    className="w-full bg-dark-bg border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                    <option value="EXPERT">EXPERT</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <Button type="button" onClick={handleAddSkill} className="w-full h-full flex items-center justify-center gap-1">
                    <Plus size={16} /> Add Skill
                  </Button>
                </div>
              </div>

              {/* Suggested Catalog Skills */}
              {catalogSkills.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs text-gray-400 mb-2">Curated skills catalog (click to add):</div>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                    {catalogSkills
                      .filter(cs => !selectedSkills.some(s => s.name.toLowerCase() === cs.name.toLowerCase()))
                      .slice(0, 16)
                      .map(cs => (
                        <button
                          key={cs.name}
                          type="button"
                          onClick={() => {
                            setSelectedSkills(prev => [...prev, { name: cs.name, proficiency: 'INTERMEDIATE' }]);
                          }}
                          className="text-xs px-2.5 py-1 rounded bg-gray-800/60 hover:bg-accent/20 hover:text-accent text-gray-400 border border-gray-700/60 transition-colors"
                        >
                          + {cs.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Technical Interests */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
              <h3 className="text-base font-semibold text-gray-200 border-b border-gray-800 pb-3 flex items-center gap-2">
                <Award size={18} className="text-accent" /> 4. Technical Interests
              </h3>

              <div className="flex flex-wrap gap-2">
                {(catalogInterests.length > 0 ? catalogInterests.map(i => i.name) : [
                  'Artificial Intelligence', 'Machine Learning', 'Deep Learning', 'Generative AI',
                  'Computer Vision', 'Natural Language Processing', 'Robotics', 'Data Science',
                  'Cloud Computing', 'Cybersecurity', 'Web Development', 'Mobile Development', 'Research'
                ]).map(interest => {
                  const active = selectedInterests.some(i => i.toLowerCase() === interest.toLowerCase());
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleToggleInterest(interest)}
                      className={`text-xs px-3 py-1.5 rounded-full transition-all border ${
                        active
                          ? 'bg-accent/20 border-accent text-accent font-medium shadow-sm shadow-accent/10'
                          : 'bg-gray-800/60 border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {interest}
                    </button>
                  );
                })}
              </div>

              {/* Add custom interest */}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newInterestName}
                  aria-label="Add an interest"
                  onChange={(e) => setNewInterestName(e.target.value)}
                  placeholder="Custom interest (e.g. Edge AI, Quantization)..."
                  className="flex-1 bg-dark-bg border border-gray-700 rounded-lg p-2.5 text-sm text-gray-200 focus:outline-none focus:border-accent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomInterest();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddCustomInterest}>
                  Add
                </Button>
              </div>
            </div>

            {/* Section 5: Social Links */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-6 space-y-4">
              <h3 className="text-base font-semibold text-gray-200 border-b border-gray-800 pb-3 flex items-center gap-2">
                <LinkIcon size={18} className="text-accent" /> 5. Professional & Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="GitHub URL"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                />
                <Input
                  label="LinkedIn URL"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                />
                <Input
                  label="Portfolio / Website URL"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                />
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="flex items-center gap-2">
                <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};
