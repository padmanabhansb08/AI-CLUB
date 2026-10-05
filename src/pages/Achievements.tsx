import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { achievementService } from '../services/content/achievementService';

import { Search, ChevronRight, Users, User as UserIcon } from 'lucide-react';
import { StateView } from '../components/common/StateView';

const CATEGORIES = [
  'All',
  'Hackathons',
  'Research',
  'Projects',
  'Certifications',
  'Open Source',
  'Competitions',
  'Other'
];

export const Achievements: React.FC = () => {
  const { data: mockAchievements, loading: loadingmockAchievements, error: errormockAchievements, retry: retrymockAchievements } = useRepository(achievementService);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredAchievements = useMemo(() => {
    return mockAchievements.filter((achievement) => {
      const matchesCategory = activeCategory === 'All' || achievement.category === activeCategory;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        achievement.title.toLowerCase().includes(searchLower) ||
        achievement.description.toLowerCase().includes(searchLower) ||
        (achievement.studentName && achievement.studentName.toLowerCase().includes(searchLower)) ||
        (achievement.teamName && achievement.teamName.toLowerCase().includes(searchLower)) ||
        (achievement.eventName && achievement.eventName.toLowerCase().includes(searchLower)) ||
        (achievement.organization && achievement.organization.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, activeCategory]);

  const featuredAchievement = filteredAchievements.find(a => a.featured) || filteredAchievements[0];
  const listAchievements = filteredAchievements.filter(a => a.id !== featuredAchievement?.id);

  // Summary stats (mock)
  const totalAchievements = mockAchievements.length;
  const featuredMembers = new Set(
    mockAchievements.flatMap(a => a.type === 'team' ? (a.teamMembers || []) : (a.studentName ? [a.studentName] : []))
  ).size;
  const thisYear = mockAchievements.filter(a => a.year === '2026').length;

  return (
    <DashboardLayout pageTitle="Achievements">
      {/* Header */}
      <div className="achievements-header">
        <div className="achievements-title-block">
          <h2>ACHIEVEMENTS</h2>
          <p>Recognizing the people, projects, and milestones shaping AI Club.</p>
        </div>
        
        <div className="achievements-summary">
          <div className="summary-stat">
            <span className="stat-value">{totalAchievements}</span>
            <span className="stat-label">Total Achievements</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{featuredMembers}</span>
            <span className="stat-label">Featured Members</span>
          </div>
          <div className="summary-stat">
            <span className="stat-value">{thisYear}</span>
            <span className="stat-label">This Year</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search achievements..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search achievements"
          />
        </div>
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <StateView loading={loadingmockAchievements} error={errormockAchievements} retry={retrymockAchievements}>
        {filteredAchievements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No achievements found.</h3>
            <p>Try changing your search or filter.</p>
            <button className="btn btn-secondary mt-4" onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="achievements-content">
            {/* Featured Achievement */}
            {featuredAchievement && (
              <div className="featured-achievement" onClick={() => navigate(`/achievements/${featuredAchievement.id}`)}>
                <div className="featured-badge">Featured</div>
                <div className="achievement-meta">
                  <span className="category-label">{featuredAchievement.category.toUpperCase()}</span>
                  <span className="year-label">{featuredAchievement.year}</span>
                </div>
                <h3 className="achievement-title">{featuredAchievement.title}</h3>
                
                <div className="student-info">
                  {featuredAchievement.type === 'team' ? (
                    <><Users size={16} /> Team {featuredAchievement.teamName}</>
                  ) : (
                    <><UserIcon size={16} /> {featuredAchievement.studentName}</>
                  )}
                </div>
                
                <p className="achievement-desc">{featuredAchievement.description}</p>
                
                <div className="achievement-footer">
                  <span className="event-label">
                    {featuredAchievement.eventName || featuredAchievement.organization || 'AI Club Project'}
                  </span>
                  <span className="view-link">View achievement <ChevronRight size={16} /></span>
                </div>
              </div>
            )}

            {/* List of other achievements */}
            <div className="achievements-list-layout">
              {listAchievements.map(achievement => (
                <div 
                  key={achievement.id} 
                  className="achievement-list-item"
                  onClick={() => navigate(`/achievements/${achievement.id}`)}
                >
                  <div className="achievement-meta">
                    <span className="category-label">{achievement.category.toUpperCase()}</span>
                  </div>
                  <h4 className="achievement-title">{achievement.title}</h4>
                  
                  <div className="student-info">
                    {achievement.type === 'team' ? (
                      <><Users size={14} /> Team {achievement.teamName}</>
                    ) : (
                      <><UserIcon size={14} /> {achievement.studentName}</>
                    )}
                  </div>
                  
                  <p className="achievement-desc line-clamp">{achievement.description}</p>
                  
                  <div className="achievement-footer">
                    <span className="event-label text-sm">
                      {achievement.eventName || achievement.organization || 'AI Club Project'} &middot; {achievement.year}
                    </span>
                    <span className="view-link text-sm">View <ChevronRight size={14} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </StateView>
    </DashboardLayout>
  );
};
