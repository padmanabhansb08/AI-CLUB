import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StateView } from '../components/common/StateView';
import { announcementService } from '../services/content/announcementService';
import type { Announcement } from '../services/content/announcementService';

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getVisibleAnnouncements();
      setAnnouncements(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'important': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-800 border-gray-700';
    }
  };

  const getCategoryColor = () => {
    return 'text-gray-300 bg-gray-800 border-gray-700';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-100">Announcements</h1>
          <p className="text-gray-400 mt-2">Important operational updates and notices from the club.</p>
        </div>
      </div>

      <StateView loading={loading} error={error as any} empty={announcements.length === 0} emptyMessage="No announcements at this time.">
        <div className="space-y-4">
          {announcements.map((item) => (
            <Link 
              key={item.id} 
              to={`/announcements/${item.id}`}
              className={`block p-5 rounded-lg border transition-colors ${item.read ? 'bg-gray-900 border-gray-800 hover:border-gray-700' : 'bg-gray-800/80 border-blue-900/30 hover:border-blue-800/50'}`}
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  )}
                  <h2 className={`text-xl font-semibold ${item.read ? 'text-gray-300' : 'text-gray-100'}`}>
                    {item.title}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                  <span className={`px-2 py-1 rounded border ${getPriorityColor(item.priority)} uppercase tracking-wider font-semibold`}>
                    {item.priority}
                  </span>
                  <span className={`px-2 py-1 rounded border ${getCategoryColor()} uppercase tracking-wider font-semibold`}>
                    {item.category}
                  </span>
                </div>
              </div>
              <p className="text-gray-400 line-clamp-2 text-sm mt-2">
                {item.body}
              </p>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500 font-mono">
                <span>{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span>
                {item.expiresAt && (
                  <span className="text-gray-600">Expires: {new Date(item.expiresAt).toLocaleDateString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </StateView>
    </div>
  );
};
