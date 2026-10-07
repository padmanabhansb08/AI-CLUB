import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { updateService } from '../services/content/updateService';
import { Search, ChevronRight, Clock } from 'lucide-react';
import { StateView } from '../components/common/StateView';

const CATEGORIES = [
  'All',
  'AI',
  'Generative AI',
  'Machine Learning',
  'AI Agents',
  'Research',
  'Developer',
  'Open Source',
  'Technology'
];

export const Updates: React.FC = () => {
  const navigate = useNavigate();
  const { data: mockUpdates, loading: loadingmockUpdates, error: errormockUpdates, retry: retrymockUpdates } = useRepository(updateService);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredUpdates = useMemo(() => {
    return mockUpdates.filter((update) => {
      const matchesCategory = activeCategory === 'All' || update.category === activeCategory;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        update.title.toLowerCase().includes(searchLower) ||
        update.summary.toLowerCase().includes(searchLower) ||
        update.category.toLowerCase().includes(searchLower) ||
        update.source.toLowerCase().includes(searchLower) ||
        (update.tags || []).some(tag => tag.toLowerCase().includes(searchLower));
      
      return matchesCategory && matchesSearch;
    });
  }, [mockUpdates, searchTerm, activeCategory]);

  const featuredUpdate = filteredUpdates.find(u => u.featured) || filteredUpdates[0];
  const listUpdates = filteredUpdates.filter(u => u.id !== featuredUpdate?.id);

  const resetFilters = () => {
    setSearchTerm('');
    setActiveCategory('All');
  };

  const isFiltering = searchTerm !== '' || activeCategory !== 'All';

  return (
    <DashboardLayout pageTitle="AI & Tech Updates">
      {/* Header */}
      <div className="updates-header">
        <div className="updates-title-block">
          <h2>AI & tech updates</h2>
          <p>Stay current with AI, research, tools, and the technologies shaping what comes next.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search updates..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search updates"
          />
        </div>
        <div className="category-filters">
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
              aria-pressed={activeCategory === cat} onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        {isFiltering && (
          <button className="btn-ghost clear-filters-btn" onClick={resetFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* Content Area */}
      <StateView loading={loadingmockUpdates} error={errormockUpdates} retry={retrymockUpdates}>
        {filteredUpdates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📰</div>
            <h3>No updates found.</h3>
            <p>Try a different search or category.</p>
            <button className="btn btn-secondary mt-4" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="updates-content">
            {/* Featured Update */}
            {featuredUpdate && (
              <div className="featured-update" onClick={() => navigate(`/updates/${featuredUpdate.id}`)}>
                <div className="featured-badge">FEATURED</div>
                <div className="update-meta">
                  <span className="category-label large">{featuredUpdate.category.toUpperCase()}</span>
                </div>
                <h3 className="update-title huge">{featuredUpdate.title}</h3>
                <p className="update-summary large">{featuredUpdate.summary}</p>
                
                <div className="update-footer">
                  <div className="update-source-info">
                    <span className="source-label">Source: {featuredUpdate.source}</span>
                    <span className="time-label"><Clock size={14} className="inline-icon" /> {featuredUpdate.publishedAt}</span>
                  </div>
                  <span className="view-link">Read update <ChevronRight size={16} /></span>
                </div>
              </div>
            )}

            {/* List of other updates */}
            <div className="updates-feed">
              {listUpdates.map(update => (
                <div 
                  key={update.id} 
                  className="update-feed-item"
                  onClick={() => navigate(`/updates/${update.id}`)}
                >
                  <div className="update-feed-content">
                    <span className="category-label">{update.category.toUpperCase()}</span>
                    <h4 className="update-title">{update.title}</h4>
                    <p className="update-summary line-clamp">{update.summary}</p>
                    
                    <div className="update-tags">
                      {(update.tags || []).slice(0, 3).map(tag => (
                        <span key={tag} className="tag small-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="update-feed-footer">
                    <div className="update-source-info">
                      <span className="source-label">Source: {update.source}</span>
                      <span className="time-label">{update.publishedAt}</span>
                    </div>
                    <span className="view-link text-sm">Read <ChevronRight size={14} /></span>
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
