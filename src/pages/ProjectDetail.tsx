import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { projectService } from '../services/content/projectService';
import { ArrowLeft, Check, Book, ExternalLink, FileText, Link as LinkIcon, User } from 'lucide-react';
import { ProjectTeamsSection } from '../components/ProjectTeamsSection';

export const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mockProjects } = useRepository(projectService);
  const [interested, setInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  
  const handleInterest = async () => {
    if (!project) return;
    try {
      setInterestLoading(true);
      if (!interested) {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/me/projects/${project.id}/interest`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setInterested(!interested);
    } catch (err) {
      console.error(err);
    } finally {
      setInterestLoading(false);
    }
  };
  const project = mockProjects.find(p => p.id === id);

  if (!project) {
    return (
      <DashboardLayout pageTitle="Project Not Found">
        <div className="empty-state">
          <h3>Project not found</h3>
          <p>The project idea you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/projects')}>
            Back to Projects
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Find related projects (same category, domain, or overlapping tags)
  const relatedProjects = mockProjects
    .filter(p => p.id !== project.id && (
      p.category === project.category || 
      (p.domain && project.domain && p.domain === project.domain) ||
      (p.tags || []).some(tag => (project.tags || []).includes(tag))
    ))
    .slice(0, 3);

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'github': return <LinkIcon size={16} />;
      case 'documentation': return <Book size={16} />;
      case 'research paper': return <FileText size={16} />;
      default: return <LinkIcon size={16} />;
    }
  };

  return (
    <DashboardLayout pageTitle="Project Details">
      <div className="detail-container article-container">
        <button className="back-btn" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <article className="project-article">
          <header className="project-detail-header">
            <div className="project-detail-meta">
              <span className="category-label large">{project.category.toUpperCase()}</span>
              {project.domain && <span className="domain-label">&middot; {project.domain}</span>}
              <span className={`status-badge ml-auto status-${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </div>
            
            <h1 className="detail-title">{project.title}</h1>
            <p className="project-detail-subtitle">{project.shortDescription}</p>
            
            <div className="project-detail-actions">
              <button 
                className={`btn ${interested ? 'btn-secondary interested-active' : 'btn-primary'}`}
                onClick={handleInterest}
                disabled={interestLoading}
              >
                {interested ? <><Check size={16} className="mr-2" /> Interested ✓</> : (interestLoading ? 'Loading...' : 'I\'m Interested')}
              </button>
              <span className="interested-count">
                <User size={14} className="inline-icon" /> {project.interestedCount + (interested ? 1 : 0)} members interested (Demo)
              </span>
            </div>
          </header>

          <div className="project-detail-body">
            
            <section className="detail-section">
              <h3>OVERVIEW</h3>
              <p>{project.description}</p>
            </section>

            {project.problem && (
              <section className="detail-section">
                <h3>THE PROBLEM</h3>
                <p>{project.problem}</p>
              </section>
            )}

            {project.approach && (
              <section className="detail-section">
                <h3>PROPOSED APPROACH</h3>
                <p>{project.approach}</p>
              </section>
            )}

            {project.features && project.features.length > 0 && (
              <section className="detail-section">
                <h3>KEY FEATURES</h3>
                <ul className="feature-list">
                  {project.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="detail-section">
              <h3>TECHNOLOGIES</h3>
              <div className="tags-container">
                {(project.technologies || []).map(tech => (
                  <span key={tech} className="tag">{tech}</span>
                ))}
              </div>
            </section>

            <section className="detail-section">
              <h3>DIFFICULTY</h3>
              <span className={`difficulty-badge diff-${project.difficulty.toLowerCase()}`}>
                {project.difficulty}
              </span>
            </section>

            {project.expectedOutcome && (
              <section className="detail-section">
                <h3>EXPECTED OUTCOME</h3>
                <p>{project.expectedOutcome}</p>
              </section>
            )}

            {project.skills && project.skills.length > 0 && (
              <section className="detail-section">
                <h3>SKILLS YOU WILL LEARN</h3>
                <div className="tags-container">
                  {project.skills.map(skill => (
                    <span key={skill} className="tag tag-skill">{skill}</span>
                  ))}
                </div>
              </section>
            )}

            {project.resources && project.resources.length > 0 && (
              <section className="detail-section">
                <h3>RESOURCES</h3>
                <div className="resources-list">
                  {project.resources.map((resource, idx) => (
                    <a key={idx} href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-item">
                      <div className="resource-icon">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div className="resource-info">
                        <span className="resource-title">{resource.title}</span>
                        <span className="resource-type">{resource.type}</span>
                      </div>
                      <ExternalLink size={14} className="resource-link-icon" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section className="detail-section">
              <h3>PROJECT STATUS</h3>
              <span className={`status-badge status-${project.status.toLowerCase().replace(' ', '-')}`}>
                {project.status}
              </span>
            </section>
            
            <ProjectTeamsSection projectId={project.id} projectStatus={project.status} />

          </div>
        </article>

        {relatedProjects.length > 0 && (
          <section className="related-projects-section">
            <h3 className="related-heading">RELATED PROJECTS</h3>
            <div className="related-updates-grid">
              {relatedProjects.map(related => (
                <div 
                  key={related.id} 
                  className="related-card"
                  onClick={() => {
                    setInterested(false);
                    navigate(`/projects/${related.id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className="flex-between">
                    <span className="category-label">{related.category}</span>
                    <span className={`difficulty-badge diff-${related.difficulty.toLowerCase()}`}>
                      {related.difficulty}
                    </span>
                  </div>
                  <h4>{related.title}</h4>
                  <div className="tech-tags mt-2">
                    {(related.technologies || []).slice(0, 2).map(tech => (
                      <span key={tech} className="tag small-tag">{tech}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};
