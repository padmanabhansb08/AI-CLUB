import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { projectService } from '../services/content/projectService';
import { Search, ChevronRight, User } from 'lucide-react';
import { StateView } from '../components/common/StateView';
import { MyProjectTeams } from '../components/MyProjectTeams';

const CATEGORIES = [
  'All',
  'AI',
  'Machine Learning',
  'Generative AI',
  'Computer Vision',
  'NLP',
  'AI Agents',
  'Data Science',
  'Robotics',
  'Developer Tools'
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const STATUSES = ['All', 'Open', 'In Progress', 'Completed', 'Archived'];

export const Projects: React.FC = () => {
  const navigate = useNavigate();
  const { data: mockProjects, loading: loadingmockProjects, error: errormockProjects, retry: retrymockProjects } = useRepository(projectService);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  
  console.log('Projects rendering. mockProjects:', mockProjects?.length, 'loading:', loadingmockProjects, 'error:', errormockProjects);

  const filteredProjects = useMemo(() => {
    return mockProjects.filter((project) => {
      const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
      const matchesDifficulty = activeDifficulty === 'All' || project.difficulty === activeDifficulty;
      const matchesStatus = activeStatus === 'All' || project.status === activeStatus;
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        project.title?.toLowerCase().includes(searchLower) ||
        (project.shortDescription || (project as any).short_description || '').toLowerCase().includes(searchLower) ||
        project.category?.toLowerCase().includes(searchLower) ||
        (project.technologies || []).some(tech => tech.toLowerCase().includes(searchLower)) ||
        (project.tags || []).some(tag => tag.toLowerCase().includes(searchLower)) ||
        (project.skills && project.skills.some(skill => skill.toLowerCase().includes(searchLower)));
      
      return matchesCategory && matchesDifficulty && matchesStatus && matchesSearch;
    });
  }, [mockProjects, searchTerm, activeCategory, activeDifficulty, activeStatus]);

  console.log('filteredProjects:', filteredProjects.length);

  const featuredProjects = filteredProjects.filter(p => p.featured);
  const listProjects = filteredProjects.filter(p => !p.featured);

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('All');
    setActiveDifficulty('All');
    setActiveStatus('All');
  };

  const isFiltering = searchTerm !== '' || activeCategory !== 'All' || activeDifficulty !== 'All' || activeStatus !== 'All';

  return (
    <DashboardLayout pageTitle="Project Ideas">
      {/* Header */}
      <div className="projects-header">
        <div className="projects-title-block">
          <h2>PROJECT IDEAS</h2>
          <p>Problems worth solving. Ideas worth building.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="projects-filter-bar">
        <div className="search-and-count">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search projects"
            />
          </div>
          <div className="result-count">
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
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
            <label>Status:</label>
            <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} className="filter-select">
              {STATUSES.map(stat => <option key={stat} value={stat}>{stat}</option>)}
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
      {/* Content Area */}
      <StateView loading={loadingmockProjects} error={errormockProjects} retry={retrymockProjects}>
        {filteredProjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💡</div>
            <h3>No projects found.</h3>
            <p>Try changing your search or filters.</p>
            <button className="btn btn-secondary mt-4" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="projects-content">
            <MyProjectTeams />
            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <div className="featured-projects-section">
                <h3 className="section-label">Featured Projects</h3>
                <div className="featured-projects-grid">
                  {featuredProjects.map(project => (
                    <div 
                      key={project.id} 
                      className="featured-project-card"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="project-card-header">
                        <span className="category-label">{project.category.toUpperCase()}</span>
                        <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                          {project.status}
                        </span>
                      </div>
                      <h3 className="project-card-title">{project.title}</h3>
                      <p className="project-card-desc">{project.shortDescription}</p>
                      
                      <div className="project-card-meta">
                        <span className={`difficulty-badge diff-${project.difficulty.toLowerCase()}`}>
                          {project.difficulty}
                        </span>
                        <div className="tech-tags">
                          {(project.technologies || []).slice(0, 3).map(tech => (
                            <span key={tech} className="tag small-tag">{tech}</span>
                          ))}
                          {(project.technologies || []).length > 3 && (
                            <span className="tag small-tag">+{(project.technologies || []).length - 3}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="project-card-footer">
                        <span className="interested">
                          <User size={14} className="inline-icon" /> {project.interestedCount} interested (Demo)
                        </span>
                        <span className="view-link">Explore project <ChevronRight size={16} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of other projects */}
            {listProjects.length > 0 && (
              <div className="projects-grid-section">
                {featuredProjects.length > 0 && <h3 className="section-label mt-6">All Projects</h3>}
                <div className="projects-grid">
                  {listProjects.map(project => (
                    <div 
                      key={project.id} 
                      className="project-card"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <div className="project-header">
                        <h4>{project.title}</h4>
                        <span className={`difficulty-badge diff-${project.difficulty.toLowerCase()}`}>
                          {project.difficulty}
                        </span>
                      </div>
                      <div className="project-meta-top">
                        <span className="category-label">{project.category}</span>
                        <span className={`status-dot status-${project.status.toLowerCase().replace(' ', '-')}`}></span>
                        <span className="status-text">{project.status}</span>
                      </div>
                      <p className="project-desc">{project.shortDescription}</p>
                      <div className="project-tags">
                        {(project.technologies || []).slice(0, 3).map(tech => (
                          <span key={tech} className="tag">{tech}</span>
                        ))}
                      </div>
                      <div className="project-footer">
                        <span className="interested">
                          <User size={14} className="inline-icon" /> {project.interestedCount} interested
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </StateView>
    </DashboardLayout>
  );
};
