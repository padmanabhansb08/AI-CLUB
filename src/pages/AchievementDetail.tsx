import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { achievementService } from '../services/content/achievementService';
import { ArrowLeft, ExternalLink, Calendar, Building, Code, Users, User as UserIcon } from 'lucide-react';

export const AchievementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mockAchievements } = useRepository(achievementService);
  
  const achievement = mockAchievements.find(a => a.id === id);

  if (!achievement) {
    return (
      <DashboardLayout pageTitle="Achievement Not Found">
        <div className="empty-state">
          <h3>Achievement not found</h3>
          <p>The achievement you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/achievements')}>
            Back to Achievements
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Achievement Details">
      <div className="detail-container">
        <button className="back-btn" onClick={() => navigate('/achievements')}>
          <ArrowLeft size={16} /> Back to Achievements
        </button>

        <article className="achievement-detail-content">
          <header className="detail-header">
            <span className="category-label large">{achievement.category.toUpperCase()}</span>
            <h1 className="detail-title">{achievement.title}</h1>
            
            <div className="detail-meta-grid">
              <div className="meta-item">
                <span className="meta-icon">
                  {achievement.type === 'team' ? <Users size={16} /> : <UserIcon size={16} />}
                </span>
                <div>
                  <div className="meta-label">{achievement.type === 'team' ? 'Team' : 'Student'}</div>
                  <div className="meta-value">{achievement.type === 'team' ? achievement.teamName : achievement.studentName}</div>
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon"><Calendar size={16} /></span>
                <div>
                  <div className="meta-label">Date</div>
                  <div className="meta-value">{achievement.date || achievement.year}</div>
                </div>
              </div>

              {(achievement.organization || achievement.eventName) && (
                <div className="meta-item">
                  <span className="meta-icon"><Building size={16} /></span>
                  <div>
                    <div className="meta-label">Event / Organization</div>
                    <div className="meta-value">
                      {achievement.eventName ? achievement.eventName : achievement.organization}
                      {achievement.eventName && achievement.organization && ` (${achievement.organization})`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </header>

          <div className="detail-body">
            {achievement.type === 'team' && achievement.teamMembers && (
              <section className="detail-section">
                <h3>Team Members</h3>
                <ul className="member-list">
                  {achievement.teamMembers.map((member, index) => (
                    <li key={index}>{member}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className="detail-section">
              <h3>About</h3>
              <p className="detail-description">{achievement.description}</p>
            </section>

            {achievement.technologies && achievement.technologies.length > 0 && (
              <section className="detail-section">
                <h3>Technologies</h3>
                <div className="tech-tags">
                  <span className="meta-icon tag-icon"><Code size={16} /></span>
                  <div className="tags-container">
                    {achievement.technologies.map(tech => (
                      <span key={tech} className="tag">{tech}</span>
                    ))}
                  </div>
                </div>
              </section>
            )}
            
            {(achievement.projectUrl || achievement.externalUrl) && (
              <section className="detail-section action-section">
                {achievement.projectUrl && (
                  <a href={achievement.projectUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    View Project <ExternalLink size={16} className="ml-2" />
                  </a>
                )}
                {achievement.externalUrl && (
                  <a href={achievement.externalUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    External Link <ExternalLink size={16} className="ml-2" />
                  </a>
                )}
              </section>
            )}
          </div>
        </article>
      </div>
    </DashboardLayout>
  );
};
