import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useRepository } from '../services/content/useRepository';
import { courseService } from '../services/content/courseService';
import { courseProgressService } from '../services/content/courseProgressService';
import type { TrackingMethod } from '../data/courses';
import { ArrowLeft, ExternalLink, CheckCircle, AlertCircle, Info, Clock, BarChart } from 'lucide-react';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: mockCourses } = useRepository(courseService);
  const { data: progressData, loading: loadingProgress, error: errorProgress } = useRepository(courseProgressService);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const course = mockCourses.find(c => c.id === id);

  if (!course) {
    return (
      <DashboardLayout pageTitle="Course Not Found">
        <div className="empty-state">
          <h3>Course not found</h3>
          <p>The course you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary mt-4" onClick={() => navigate('/courses')}>
            Back to Courses
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const renderTrackingExplanation = (method: TrackingMethod) => {
    switch (method) {
      case 'api':
      case 'oauth':
        return {
          title: 'Official Integration Available',
          description: `Progress for this course can be automatically tracked once you connect your ${course.provider} account.`,
          icon: <CheckCircle size={24} className="tracking-icon-auto" />,
          canConnect: true
        };
      case 'certificate':
        return {
          title: 'Certificate Verification',
          description: `Continuous progress tracking is not available, but you can verify completion by providing your final ${course.provider} certificate link.`,
          icon: <CheckCircle size={24} className="tracking-icon-cert" />,
          canConnect: false
        };
      case 'none':
      default:
        return {
          title: 'Tracking Unavailable',
          description: `Progress tracking is currently unsupported for ${course.provider}.`,
          icon: <AlertCircle size={24} className="tracking-icon-none" />,
          canConnect: false
        };
    }
  };

  const trackingInfo = renderTrackingExplanation(course.tracking.method);

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

  const pDisplay = getProgressDisplay(course.id);

  return (
    <DashboardLayout pageTitle="Course Details">
      <div className="detail-container article-container">
        <button className="back-btn" onClick={() => navigate('/courses')}>
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <article className="course-article">
          <header className="course-detail-header">
            <div className="course-detail-meta">
              <span className="course-provider-large">{course.provider}</span>
              <span className={`difficulty-badge ml-auto diff-${course.difficulty.toLowerCase()}`}>
                {course.difficulty}
              </span>
            </div>
            
            <h1 className="detail-title">{course.title}</h1>
            <p className="project-detail-subtitle">{course.description}</p>
            
            <div className="course-meta-grid">
              <div className="meta-item">
                <span className="meta-icon"><BarChart size={16} /></span>
                <div>
                  <div className="meta-label">Category</div>
                  <div className="meta-value">{course.category}</div>
                </div>
              </div>
              
              <div className="meta-item">
                <span className="meta-icon"><Clock size={16} /></span>
                <div>
                  <div className="meta-label">Duration</div>
                  <div className="meta-value">{course.duration}</div>
                </div>
              </div>
            </div>

            <div className="course-actions">
              {course.courseUrl && (
                <a 
                  href={course.courseUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-primary"
                >
                  Open Course <ExternalLink size={16} className="ml-2" />
                </a>
              )}
              {trackingInfo.canConnect && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowConnectModal(true)}
                >
                  Connect {course.provider}
                </button>
              )}
            </div>
          </header>

          <div className="course-detail-body">
            
            {/* Tracking Explanation Box */}
            <div className="tracking-explanation-box">
              <div className="tracking-explanation-header">
                {trackingInfo.icon}
                <h4>{trackingInfo.title}</h4>
              </div>
              <p>{trackingInfo.description}</p>
              
              <div className="tracking-technical-detail">
                <Info size={14} className="inline-icon mr-1" />
                Tracking method: <strong>{course.tracking.method === 'none' ? 'Not currently supported' : course.tracking.method.toUpperCase()}</strong>
              </div>
              
              {pDisplay && (
                <div className="tracking-technical-detail mt-2">
                  <strong>Current Progress:</strong> {pDisplay}
                </div>
              )}
            </div>

            {course.whyThisCourse && (
              <section className="detail-section">
                <h3>WHY THIS COURSE?</h3>
                <p>{course.whyThisCourse}</p>
              </section>
            )}

            <section className="detail-section">
              <h3>WHAT YOU WILL LEARN</h3>
              <p>{course.description}</p>
            </section>

            {course.topics && course.topics.length > 0 && (
              <section className="detail-section">
                <h3>COURSE TOPICS</h3>
                <ul className="feature-list">
                  {course.topics.map((topic, idx) => (
                    <li key={idx}>{topic}</li>
                  ))}
                </ul>
              </section>
            )}

            {course.skills && course.skills.length > 0 && (
              <section className="detail-section">
                <h3>SKILLS DEVELOPED</h3>
                <div className="tags-container">
                  {course.skills.map(skill => (
                    <span key={skill} className="tag tag-skill">{skill}</span>
                  ))}
                </div>
              </section>
            )}

          </div>
        </article>

        {/* Informational Modal for Connection */}
        {showConnectModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Integration Pending</h3>
              <p>Account connection will be available when this provider integration is fully configured on the backend.</p>
              <button className="btn btn-primary mt-4" onClick={() => setShowConnectModal(false)}>
                Close
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};
