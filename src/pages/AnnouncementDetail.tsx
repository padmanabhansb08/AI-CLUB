import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { StateView } from '../components/common/StateView';
import { announcementService } from '../services/content/announcementService';
import type { Announcement } from '../services/content/announcementService';

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
        // Force a tiny local update so it shows as read instantly without reload
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
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-200">Announcement not found</h2>
        <button onClick={() => navigate('/announcements')} className="mt-4 text-blue-400 hover:text-blue-300">
          Return to announcements
        </button>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'important': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/announcements" className="text-sm font-mono text-gray-500 hover:text-gray-300 uppercase tracking-widest inline-flex items-center gap-2">
        &larr; Back to announcements
      </Link>

      <StateView loading={loading} error={error as any}>
        {announcement && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <div className="flex flex-wrap items-center gap-3 mb-6 border-b border-gray-800 pb-6">
              <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(announcement.priority)} uppercase tracking-wider font-semibold`}>
                {announcement.priority}
              </span>
              <span className="px-2 py-1 text-xs rounded border text-gray-300 bg-gray-800 border-gray-700 uppercase tracking-wider font-semibold">
                {announcement.category}
              </span>
              <div className="ml-auto text-sm font-mono text-gray-500">
                {new Date(announcement.publishedAt || announcement.createdAt).toLocaleString()}
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-100 mb-8">{announcement.title}</h1>
            
            <div className="prose prose-invert prose-blue max-w-none">
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {announcement.body}
              </p>
            </div>
          </div>
        )}
      </StateView>
    </div>
  );
};
