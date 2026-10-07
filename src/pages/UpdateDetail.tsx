import React from 'react';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { updateService } from '../services/content/updateService';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export const UpdateDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mockUpdates } = useRepository(updateService);
  
  const update = mockUpdates.find(u => u.id === id);

  if (!update) {
    return (
      <DashboardLayout pageTitle="Update Not Found">
        <div className="empty-state">
          <h3>Update not found</h3>
          <p>The article you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/updates')}>
            Back to Updates
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Find related updates (same category or overlapping tags)
  const relatedUpdates = mockUpdates
    .filter(u => u.id !== update.id && (
      u.category === update.category || 
      u.tags.some(tag => update.tags.includes(tag))
    ))
    .slice(0, 3);

  return (
    <DashboardLayout pageTitle="AI & Tech Updates">
      <div className="detail-container article-container">
        <button className="back-btn" onClick={() => navigate('/updates')}>
          <ArrowLeft size={16} /> Back to Updates
        </button>

        <article className="update-article">
          <header className="article-header">
            <span className="category-label large">{update.category.toUpperCase()}</span>
            <h1 className="detail-title article-title">{update.title}</h1>
            
            <div className="article-meta">
              <span className="source-label">{update.source}</span>
              <span className="time-label">{update.publishedAt} &middot; {update.readingTime}</span>
            </div>
          </header>

          <div className="article-body">
            <div className="article-summary-box">
              <h3 className="summary-heading">SUMMARY</h3>
              <p>{update.summary}</p>
            </div>
            
            <div 
              className="article-content-html"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(update.content) }}
            />

            <div className="article-tags-section">
              <h3 className="tags-heading">TAGS</h3>
              <div className="tags-container">
                {update.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            
            <div className="article-actions">
              <a 
                href={update.sourceUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary"
                onClick={(e) => !update.sourceUrl && e.preventDefault()}
              >
                Read Original Source <ExternalLink size={16} className="ml-2" />
              </a>
            </div>
          </div>
        </article>

        {relatedUpdates.length > 0 && (
          <section className="related-updates-section">
            <h3 className="related-heading">RELATED UPDATES</h3>
            <div className="related-updates-grid">
              {relatedUpdates.map(related => (
                <div 
                  key={related.id} 
                  className="related-card"
                  onClick={() => {
                    navigate(`/updates/${related.id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <span className="category-label">{related.category}</span>
                  <h4>{related.title}</h4>
                  <span className="time-label text-sm">{related.publishedAt}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};
