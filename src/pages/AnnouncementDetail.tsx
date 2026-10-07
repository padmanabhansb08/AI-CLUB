import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StateView } from '../components/common/StateView';
import { announcementService } from '../services/content/announcementService';
import type { Announcement } from '../services/content/announcementService';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ArrowLeft } from 'lucide-react';

export const AnnouncementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAnnouncement(id);
    }
  }, [id]);

  const loadAnnouncement = async (announcementId: string) => {
    try {
      setLoading(true);
      const data = await announcementService.getById(announcementId);
      setAnnouncement(data);
      
      // Mark as read natively
      if (!data.read) {
        await announcementService.markAsRead(announcementId);
        setAnnouncement(prev => prev ? { ...prev, read: true } : prev);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load announcement');
    } finally {
      setLoading(false);
    }
  };

  if (!loading && !announcement) {
    return (
      <DashboardLayout pageTitle="Announcement Not Found">
        <div className="text-center py-16 space-y-4">
          <h2 className="text-2xl font-bold text-[#111111]">Announcement not found</h2>
          <button onClick={() => navigate('/announcements')} className="pill-btn text-xs py-2 px-5">
            Return to announcements
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'important': return 'text-amber-800 bg-amber-50 border-amber-200';
      default: return 'text-[#66645F] bg-[#FAF9F6] border-[rgba(17,17,17,0.08)]';
    }
  };

  return (
    <DashboardLayout pageTitle={announcement?.title || 'Announcement Detail'}>
      <div className="max-w-3xl mx-auto space-y-6 pb-12">
        <Link to="/announcements" className="text-xs font-semibold text-[#66645F] hover:text-[#111111] inline-flex items-center gap-1.5 transition-colors">
          <ArrowLeft size={14} /> Back to announcements
        </Link>

        <StateView loading={loading} error={error as any}>
          {announcement && (
            <div className="bg-[#FFFFFF] border border-[rgba(17,17,17,0.08)] rounded-3xl p-8 shadow-sm">
              <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-[rgba(17,17,17,0.08)] pb-6">
                <span className={`px-2.5 py-1 text-xs rounded-full border ${getPriorityColor(announcement.priority)} uppercase tracking-wider font-semibold`}>
                  {announcement.priority}
                </span>
                <span className="px-2.5 py-1 text-xs rounded-full border border-[rgba(17,17,17,0.08)] text-[#66645F] bg-[#FAF9F6] uppercase tracking-wider font-semibold">
                  {announcement.category}
                </span>
                <div className="ml-auto text-xs font-mono text-[#92908A]">
                  {new Date(announcement.publishedAt || announcement.createdAt).toLocaleString()}
                </div>
              </div>

              <h1 className="text-3xl font-extrabold text-[#111111] mb-6 tracking-tight leading-snug">{announcement.title}</h1>
              
              <div className="max-w-none text-sm text-[#66645F] leading-relaxed whitespace-pre-wrap">
                {announcement.body}
              </div>
            </div>
          )}
        </StateView>
      </div>
    </DashboardLayout>
  );
};
export default AnnouncementDetail;
