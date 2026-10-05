import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { courseService } from '../services/content/courseService';
import { courseProgressService } from '../services/content/courseProgressService';
import type { TrackingMethod } from '../data/courses';
import { Search, ChevronRight, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { StateView } from '../components/common/StateView';

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const TRACKING_OPTIONS = ['All', 'Automatically Tracked', 'Certificate Verified', 'Not Connected'];

export const Courses: React.FC = () => {
  const navigate = useNavigate();
  const { data: mockCourses, loading: loadingmockCourses, error: errormockCourses, retry: retrymockCourses } = useRepository(courseService);
  const { data: progressData, loading: loadingProgress, error: errorProgress } = useRepository(courseProgressService);
  const CATEGORIES = useMemo(() => {
      console.log('mockCourses in useMemo:', mockCourses);
      return ['All', ...Array.from(new Set(mockCourses.map(c => c.category))).sort()];
  }, [mockCourses]);
  const PROVIDERS = useMemo(() => ['All', ...Array.from(new Set(mockCourses.map(c => c.provider))).sort()], [mockCourses]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeProvider, setActiveProvider] = useState('All');
  const [activeTracking, setActiveTracking] = useState('All');

  const filteredCourses = useMemo(() => {
    console.log('mockCourses before filter:', JSON.stringify(mockCourses));
    return mockCourses.filter(course => {
      const matchesCategory = activeCategory === 'All' || course.category === activeCategory;
      const matchesDifficulty = activeDifficulty === 'All' || course.difficulty === activeDifficulty;
      const matchesProvider = activeProvider === 'All' || course.provider === activeProvider;
      
      let matchesTracking = true;
      if (activeTracking !== 'All') {
        const isAuto = course.tracking.method === 'api' || course.tracking.method === 'oauth';
        const isCert = course.tracking.method === 'certificate';
        const isNone = course.tracking.method === 'none';

        if (activeTracking === 'Automatically Tracked') matchesTracking = isAuto;
        else if (activeTracking === 'Certificate Verified') matchesTracking = isCert;
        else if (activeTracking === 'Not Connected') matchesTracking = isNone;
      }

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.provider.toLowerCase().includes(searchLower) ||
        course.category.toLowerCase().includes(searchLower) ||
        course.skills.some(skill => skill.toLowerCase().includes(searchLower));

      return matchesCategory && matchesDifficulty && matchesProvider && matchesTracking && matchesSearch;
    });
  }, [mockCourses, searchTerm, activeCategory, activeDifficulty, activeProvider, activeTracking]);

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('All');
    setActiveDifficulty('All');
    setActiveProvider('All');
    setActiveTracking('All');
  };

  const isFiltering = searchTerm !== '' || activeCategory !== 'All' || activeDifficulty !== 'All' || activeProvider !== 'All' || activeTracking !== 'All';

  const getProgressDisplay = (courseId: string) => {
    if (errorProgress) {
      return "Progress tracking error";
    }
    if (loadingProgress) {
      return "Loading progress...";
    }
    const progress = progressData.find(p => p.course_id === courseId);
    if (!progress) return null;
    
    if (progress.progress_percent === null) {
      return "Progress unavailable";
    }
    if (progress.progress_percent === 0) {
      return "0% (Not Started)";
    }
    if (progress.progress_percent === 100) {
      return "Completed (100%)";
    }
    return `${progress.progress_percent}%`;
  };

  const renderTrackingStatus = (method: TrackingMethod) => {
    if (method === 'api' || method === 'oauth') {
      return (
        <span className="tracking-status tracking-auto">
          <CheckCircle size={14} className="mr-1" /> Integration Available
        </span>
      );
    }
    if (method === 'certificate') {
      return (
        <span className="tracking-status tracking-cert">
          <CheckCircle size={14} className="mr-1" /> Certificate Verification
        </span>
      );
    }
    return (
      <span className="tracking-status tracking-none">
        <AlertCircle size={14} className="mr-1" /> Tracking Unavailable
      </span>
    );
  };

  return (
    <DashboardLayout pageTitle="External Courses">
      {/* Header */}
      <div className="courses-header">
        <div className="courses-title-block">
          <h2>EXTERNAL COURSES</h2>
          <p>Learning opportunities selected for AI Club members.</p>
          <div className="info-note">
            <Info size={14} className="mr-2 inline-icon" />
            Courses are hosted by external platforms. Progress tracking depends on the provider's available integration.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="courses-filter-bar">
        <div className="search-and-count">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search courses"
            />
          </div>
          <div className="result-count">
            {filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'} found
          </div>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label>Category:</label>
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="filter-select">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="filter-group">
            <label>Difficulty:</label>
            <select value={activeDifficulty} onChange={(e) => setActiveDifficulty(e.target.value)} className="filter-select">
              {DIFFICULTIES.map(diff => <option key={diff} value={diff}>{diff}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Provider:</label>
            <select value={activeProvider} onChange={(e) => setActiveProvider(e.target.value)} className="filter-select">
              {PROVIDERS.map(prov => <option key={prov} value={prov}>{prov}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label>Tracking:</label>
            <select value={activeTracking} onChange={(e) => setActiveTracking(e.target.value)} className="filter-select">
              {TRACKING_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {isFiltering && (
            <button className="btn-ghost clear-filters-btn" onClick={resetFilters}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <StateView loading={loadingmockCourses} error={errormockCourses} retry={retrymockCourses}>
        {filteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No courses found.</h3>
            <p>Try changing your search or filters.</p>
            <button className="btn btn-secondary mt-4" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map(course => (
              <div 
                key={course.id} 
                className={`course-card ${course.featured ? 'featured-course' : ''}`}
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <div className="course-header">
                  <span className="course-provider">{course.provider}</span>
                  <span className={`difficulty-badge diff-${course.difficulty.toLowerCase()}`}>
                    {course.difficulty}
                  </span>
                </div>
                
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">{course.description}</p>
                
                <div className="course-meta">
                  <span className="category-label">{course.category}</span>
                  <span className="duration-label">&middot; {course.duration}</span>
                </div>
                
                <div className="course-footer">
                  <div className="tracking-info">
                    {renderTrackingStatus(course.tracking.method)}
                    {(() => {
                       const pDisplay = getProgressDisplay(course.id);
                       return pDisplay ? <div className="progress-display text-sm mt-1"><strong>Progress:</strong> {pDisplay}</div> : null;
                    })()}
                  </div>
                  <span className="view-link text-sm">View Course <ChevronRight size={14} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </StateView>
    </DashboardLayout>
  );
};
