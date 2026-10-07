import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useMemberProfile } from '../hooks/useMemberProfile';
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

    setSelectedSkills(prev => [
      ...prev,
      { name: trimmed, proficiency: newSkillProficiency }
    ]);
    setNewSkillName('');
    setNewSkillProficiency('INTERMEDIATE');
  };

  const handleRemoveSkill = (name: string) => {
    setSelectedSkills(prev => prev.filter(s => s.name.toLowerCase() !== name.toLowerCase()));
  };

  const handleToggleInterest = (interest: string) => {
    setSelectedInterests(prev => {
      const exists = prev.some(i => i.toLowerCase() === interest.toLowerCase());
      if (exists) {
        return prev.filter(i => i.toLowerCase() !== interest.toLowerCase());
      } else {
        return [...prev, interest];
      }
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

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');

    try {
      await updateProfile({
        fullName,
        department,
        classSection,
        year,
        phone,
        bio,
        profilePhotoUrl,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        skills: selectedSkills,
        technicalInterests: selectedInterests,
      });

      setSaveSuccess('Profile successfully updated!');
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(''), 5000);
    } catch (err: any) {
      // Error handled by hook
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Member Profile">
        <LoadingState message="Loading member credentials & profile..." />
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
    <DashboardLayout pageTitle="Member Profile">
      <div className="page-container max-w-5xl mx-auto pb-12">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="page-title mb-1 text-2xl font-bold flex items-center gap-2 text-[#111111]">
              <User size={24} className="text-[#111111]" /> Member Identity
            </h1>
            <p className="text-[#66645F] text-sm">
              Manage your academic credentials, technical skills, interests, and club identity.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="pill-btn flex items-center gap-2 text-xs py-2 px-5">
                <Edit2 size={15} /> Edit Profile
              </button>
            ) : (
              <button onClick={handleCancel} className="pill-outline flex items-center gap-2 text-xs py-2 px-5">
                <X size={15} /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 text-sm">
            <CheckCircle size={18} className="text-emerald-700 flex-shrink-0" />
            <span>{saveSuccess}</span>
          </div>
        )}

        {/* Error Alert */}
        {saveError && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-sm">
            <AlertCircle size={18} className="text-rose-700 flex-shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Profile Completion Bar */}
        <div className="mb-8 p-6 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-[#111111]" />
              <span className="font-semibold text-[#111111]">Profile Completion</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.1)] text-[#111111] font-mono font-bold">
                {completionPct}%
              </span>
            </div>
            <span className="text-xs text-[#66645F]">
              {profile.profileCompletion?.completed || 0} of {profile.profileCompletion?.total || 11} attributes completed
            </span>
          </div>

          <div className="w-full h-2 bg-[#EBE9E3] rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-[#050505] transition-all duration-700 ease-out"
              style={{ width: `${completionPct}%` }}
            />
          </div>

          {missingItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-[#92908A]">Missing fields:</span>
              {missingItems.map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs px-2.5 py-1 rounded-full bg-[#FAF9F6] hover:bg-[#EBE9E3] text-[#111111] transition-colors flex items-center gap-1 border border-[rgba(17,17,17,0.1)]"
                >
                  <Plus size={12} /> {item}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode vs Edit Mode */}
        {!isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="lg:col-span-1 rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 flex flex-col items-center text-center shadow-sm">
              <div className="relative mb-4">
                {profile.profilePhotoUrl ? (
                  <img 
                    src={profile.profilePhotoUrl} 
                    alt={profile.fullName} 
                    className="w-28 h-28 rounded-full object-cover border-2 border-[#111111] shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-[#EBE9E3] border-2 border-[#111111] flex items-center justify-center text-[#111111] text-3xl font-bold font-mono">
                    {profile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#FFFFFF]" title="Active Member"></span>
              </div>

              <h2 className="text-xl font-bold text-[#111111]">{profile.fullName}</h2>
              <p className="text-xs font-mono text-[#66645F] mt-0.5">{profile.registerNumber}</p>
              
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-xs text-[#111111]">
                <span>{profile.department}</span>
                <span>&bull;</span>
                <span>Year {profile.year}</span>
                <span>&bull;</span>
                <span>Sec {profile.classSection}</span>
              </div>

              <div className="w-full border-t border-[rgba(17,17,17,0.08)] my-5"></div>

              {/* Contact Info */}
              <div className="w-full text-left space-y-2.5 text-xs text-[#66645F]">
                <div className="flex justify-between">
                  <span className="text-[#92908A]">College Email</span>
                  <span className="font-mono text-[#111111] truncate max-w-[160px]">{profile.collegeEmail}</span>
                </div>
                {profile.phone && (
                  <div className="flex justify-between">
                    <span className="text-[#92908A]">Phone</span>
                    <span className="font-mono text-[#111111]">{profile.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#92908A]">Member Since</span>
                  <span className="text-[#111111]">{new Date(profile.joinedAt || profile.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#92908A]">Status</span>
                  <span className="text-emerald-700 font-semibold">{profile.status}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#92908A]">Events Attended</span>
                  <span className="text-[#111111] font-semibold font-mono">{profile.eventsAttended ?? 0}</span>
                </div>
              </div>

              {/* Social Links */}
              {(profile.githubUrl || profile.linkedinUrl || profile.portfolioUrl) && (
                <div className="w-full mt-6 pt-4 border-t border-[rgba(17,17,17,0.08)] flex justify-center gap-3">
                  {profile.githubUrl && (
                    <a 
                      href={profile.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] hover:bg-[#EBE9E3] text-[#111111] transition-colors"
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
                      className="p-2.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] hover:bg-[#EBE9E3] text-[#111111] transition-colors"
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
                      className="p-2.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] hover:bg-[#EBE9E3] text-[#111111] transition-colors"
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
              <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#111111] mb-3 flex items-center gap-2">
                  <User size={18} className="text-[#111111]" /> About
                </h3>
                {profile.bio ? (
                  <p className="text-sm text-[#66645F] leading-relaxed whitespace-pre-line">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-[#92908A] italic">No bio provided yet. Click "Edit Profile" to share your background and goals.</p>
                )}
              </div>

              {/* Technical Skills */}
              <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#111111] mb-3 flex items-center gap-2">
                  <Layers size={18} className="text-[#111111]" /> Skills & Proficiencies
                </h3>
                {profile.normalizedSkills && profile.normalizedSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.normalizedSkills.map(s => (
                      <div 
                        key={s.name} 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)] text-xs"
                      >
                        <span className="font-medium text-[#111111]">{s.name}</span>
                        {s.proficiency && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono uppercase ${
                            s.proficiency === 'EXPERT' ? 'bg-purple-100 text-purple-800' :
                            s.proficiency === 'ADVANCED' ? 'bg-blue-100 text-blue-800' :
                            s.proficiency === 'INTERMEDIATE' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-gray-100 text-gray-800'
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
                      <span key={skill} className="px-3 py-1 rounded-full bg-[#FAF9F6] text-[#111111] text-xs border border-[rgba(17,17,17,0.08)]">
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#92908A] italic">No skills listed yet.</p>
                )}
              </div>

              {/* Technical Interests */}
              <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 shadow-sm">
                <h3 className="text-base font-semibold text-[#111111] mb-3 flex items-center gap-2">
                  <Award size={18} className="text-[#111111]" /> Technical Interests & Focus
                </h3>
                {profile.technicalInterests && profile.technicalInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.technicalInterests.map(interest => (
                      <span 
                        key={interest} 
                        className="px-3 py-1.5 rounded-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.1)] text-[#111111] text-xs font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#92908A] italic">No technical interests specified.</p>
                )}
              </div>

              {/* Projects & Collaborations (Sprint 4) */}
              <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.08)] pb-3">
                  <h3 className="text-base font-semibold text-[#111111] flex items-center gap-2 m-0">
                    <FolderGit2 size={18} className="text-[#111111]" /> Projects & Collaborations
                  </h3>
                  <a
                    href="/projects/my"
                    className="text-xs text-[#111111] font-semibold hover:underline flex items-center gap-1"
                  >
                    View All &rarr;
                  </a>
                </div>

                {myProjects.length === 0 ? (
                  <p className="text-sm text-[#92908A] italic">No project participations yet. Explore active club initiatives!</p>
                ) : (
                  <div className="space-y-3">
                    {myProjects.slice(0, 4).map((proj) => {
                      const isComplete = proj.status === 'COMPLETED' || proj.progress_percentage === 100;
                      return (
                        <div
                          key={proj.id}
                          className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-[#111111] truncate">
                                {proj.title}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                                isComplete
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {proj.current_member_role || proj.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-[#66645F]">
                              <span>{typeof proj.domain === 'string' ? proj.domain.replace(/_/g, ' ') : 'AI / ML'}</span>
                              <span>Progress: {proj.progress_percentage || 0}%</span>
                            </div>
                          </div>

                          <a
                            href={`/projects/${proj.slug || proj.id}`}
                            className="text-xs px-3 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#EBE9E3] text-[#111111] border border-[rgba(17,17,17,0.1)] transition font-medium"
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
              <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.08)] pb-3">
                  <h3 className="text-base font-semibold text-[#111111] flex items-center gap-2 m-0">
                    <BookOpen size={18} className="text-[#111111]" /> Learning & Courses
                  </h3>
                  <a
                    href="/my-learning"
                    className="text-xs text-[#111111] font-semibold hover:underline flex items-center gap-1"
                  >
                    View All &rarr;
                  </a>
                </div>

                {myEnrollments.length === 0 ? (
                  <p className="text-sm text-[#92908A] italic">No enrolled courses yet. Discover courses in the catalog!</p>
                ) : (
                  <div className="space-y-3">
                    {myEnrollments.slice(0, 4).map((enr) => {
                      const course = enr.course;
                      const isComplete = enr.status === 'COMPLETED' || (enr.progress_percentage || 0) === 100;
                      return (
                        <div
                          key={enr.id}
                          className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)] flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-[#111111] truncate">
                                {course?.title || 'Course'}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                                isComplete
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {isComplete ? 'Completed' : 'In Progress'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-[#66645F]">
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
                            className="text-xs px-3 py-1.5 rounded-full bg-[#FFFFFF] hover:bg-[#EBE9E3] text-[#111111] border border-[rgba(17,17,17,0.1)] transition font-medium"
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
              <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.08)] pb-3">
                  <div className="flex items-center gap-2">
                    <Trophy size={18} className="text-amber-600" />
                    <h3 className="text-base font-semibold text-[#111111] m-0">
                      Achievements & Recognition
                    </h3>
                    {achievementStats && (
                      <span className="text-xs font-bold text-amber-700 font-mono ml-2">
                        ⭐ {achievementStats.totalPoints} PTS
                      </span>
                    )}
                  </div>
                  <a
                    href="/achievements"
                    className="text-xs text-[#111111] font-semibold hover:underline flex items-center gap-1"
                  >
                    View All &rarr;
                  </a>
                </div>

                {myAchievements.length === 0 ? (
                  <p className="text-sm text-[#92908A] italic">No achievements unlocked yet. Attend events or complete courses to start earning recognition!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {myAchievements.map((item) => {
                      const ach = item.achievement;
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.06)] flex items-center gap-3"
                        >
                          <AchievementBadge
                            iconName={ach?.icon}
                            isUnlocked={true}
                            size="md"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-xs font-bold text-[#111111] truncate">
                                {ach?.name || 'Achievement'}
                              </span>
                              <span className="text-[10px] font-bold text-amber-700 font-mono">
                                +{ach?.points || 10}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#66645F] line-clamp-1">
                              {ach?.description}
                            </p>
                            <span className="text-[10px] text-[#92908A] mt-1 block">
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
            <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#111111] border-b border-[rgba(17,17,17,0.08)] pb-3">
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
                  label="Register Number (Immutable)"
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
                  label="College Email (Immutable)"
                  value={profile.collegeEmail}
                  disabled
                />
              </div>
            </div>

            {/* Section 2: Bio & Profile Photo */}
            <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#111111] border-b border-[rgba(17,17,17,0.08)] pb-3 flex items-center gap-2">
                <Camera size={18} className="text-[#111111]" /> 2. Profile Photo & About
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
                      className="w-16 h-16 rounded-full object-cover border border-[#111111]"
                      onError={(e) => {
                        (e.target as HTMLElement).style.opacity = '0.3';
                      }}
                    />
                    <div className="text-xs text-[#66645F]">
                      Live preview. If image fails to load, ensure the URL is publicly accessible.
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setProfilePhotoUrl('')}
                      className="pill-outline text-xs px-3 py-1 ml-auto"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111111] mb-1">
                  Bio / About Me ({bio.length}/1000)
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="w-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.15)] rounded-xl p-3 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                  placeholder="Share a brief overview of your technical background, research passions, and engineering focus..."
                />
              </div>
            </div>

            {/* Section 3: Normalized Skills */}
            <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#111111] border-b border-[rgba(17,17,17,0.08)] pb-3 flex items-center gap-2">
                <Layers size={18} className="text-[#111111]" /> 3. Skills & Proficiencies
              </h3>

              {/* Current Selected Skills */}
              <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 rounded-xl bg-[#FAF9F6] border border-[rgba(17,17,17,0.08)]">
                {selectedSkills.length === 0 ? (
                  <span className="text-xs text-[#92908A] italic">No skills added yet. Add from catalog below or type a custom skill.</span>
                ) : (
                  selectedSkills.map(skill => (
                    <div 
                      key={skill.name}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFFFFF] border border-[rgba(17,17,17,0.1)] text-xs text-[#111111]"
                    >
                      <span>{skill.name}</span>
                      <span className="text-[10px] text-[#111111] font-mono uppercase bg-[#FAF9F6] px-1.5 py-0.5 rounded-full font-semibold">
                        {skill.proficiency || 'INTERMEDIATE'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="text-[#92908A] hover:text-rose-600 transition-colors ml-1"
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
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="e.g. PyTorch, React, Rust"
                    className="w-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.15)] rounded-full px-4 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
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
                    onChange={(e) => setNewSkillProficiency(e.target.value as SkillProficiency)}
                    className="w-full bg-[#FAF9F6] border border-[rgba(17,17,17,0.15)] rounded-full px-4 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                    <option value="EXPERT">EXPERT</option>
                  </select>
                </div>
                <div className="sm:col-span-1">
                  <button type="button" onClick={handleAddSkill} className="pill-btn w-full text-xs py-2">
                    <Plus size={16} /> Add Skill
                  </button>
                </div>
              </div>

              {/* Suggested Catalog Skills */}
              {catalogSkills.length > 0 && (
                <div className="pt-2">
                  <div className="text-xs text-[#66645F] mb-2 font-medium">Curated skills catalog (click to add):</div>
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
                          className="text-xs px-3 py-1 rounded-full bg-[#FAF9F6] hover:bg-[#EBE9E3] text-[#111111] border border-[rgba(17,17,17,0.08)] transition-colors"
                        >
                          + {cs.name}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Technical Interests */}
            <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#111111] border-b border-[rgba(17,17,17,0.08)] pb-3 flex items-center gap-2">
                <Award size={18} className="text-[#111111]" /> 4. Technical Interests
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
                      className={`text-xs px-3.5 py-1.5 rounded-full transition-all border ${
                        active
                          ? 'bg-[#050505] border-[#050505] text-[#FFFFFF] font-medium shadow-sm'
                          : 'bg-[#FAF9F6] border-[rgba(17,17,17,0.08)] text-[#66645F] hover:text-[#111111] hover:bg-[#EBE9E3]'
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
                  onChange={(e) => setNewInterestName(e.target.value)}
                  placeholder="Custom interest (e.g. Edge AI, Quantization)..."
                  className="flex-1 bg-[#FAF9F6] border border-[rgba(17,17,17,0.15)] rounded-full px-4 py-2 text-sm text-[#111111] focus:outline-none focus:border-[#111111]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomInterest();
                    }
                  }}
                />
                <button type="button" onClick={handleAddCustomInterest} className="pill-outline text-xs px-5 py-2">
                  Add
                </button>
              </div>
            </div>

            {/* Section 5: Social Links */}
            <div className="rounded-2xl border border-[rgba(17,17,17,0.08)] bg-[#FFFFFF] p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-semibold text-[#111111] border-b border-[rgba(17,17,17,0.08)] pb-3 flex items-center gap-2">
                <LinkIcon size={18} className="text-[#111111]" /> 5. Professional & Social Links
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
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[rgba(17,17,17,0.08)]">
              <button type="button" onClick={handleCancel} className="pill-outline text-xs py-2 px-5">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="pill-btn flex items-center gap-2 text-xs py-2 px-6">
                <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};
export default Profile;
