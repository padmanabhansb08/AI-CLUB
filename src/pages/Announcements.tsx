import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StateView } from '../components/common/StateView';
import { announcementService } from '../services/content/announcementService';
import type { Announcement } from '../services/content/announcementService';
import { Megaphone } from 'lucide-react';

export const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      setError(null);
      const res = await announcementService.getVisibleAnnouncements();
      setAnnouncements(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'important': return 'text-amber-800 bg-amber-50 border-amber-200';
      default: return 'text-[#66645F] bg-[#FAF9F6] border-[rgba(17,17,17,0.08)]';
    }
  };

  return (
    <DashboardLayout pageTitle="Announcements">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <div className="flex justify-between items-end border-b border-[rgba(17,17,17,0.08)] pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111111] flex items-center gap-2">
              <Megaphone size={24} className="text-[#111111]" /> Operational Announcements
            </h1>
            <p className="text-[#66645F] mt-1 text-sm">Official operational notices, semester schedules, and club bulletins.</p>
          </div>
        </div>

        <StateView loading={loading} error={error as any} retry={fetchAnnouncements} empty={announcements.length === 0} emptyMessage="No announcements at this time.">
          <div className="space-y-4">
            {announcements.map((item) => (
              <Link 
                key={item.id} 
                to={`/announcements/${item.id}`}
                className={`block p-6 rounded-2xl border transition-all ${item.read ? 'bg-[#FFFFFF] border-[rgba(17,17,17,0.08)] hover:shadow-md' : 'bg-[#FFFFFF] border-[#111111] shadow-sm hover:shadow-md'}`}
              >
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!item.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#050505] flex-shrink-0"></span>
                    )}
                    <h2 className="text-xl font-bold text-[#111111]">
                      {item.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-full border ${getPriorityColor(item.priority)} uppercase tracking-wider font-semibold text-[10px]`}>
                      {item.priority}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full border border-[rgba(17,17,17,0.08)] bg-[#FAF9F6] text-[#66645F] uppercase tracking-wider font-semibold text-[10px]">
                      {item.category}
                    </span>
                  </div>
                </div>
                <p className="text-[#66645F] line-clamp-2 text-sm mt-2 leading-relaxed">
                  {item.body}
                </p>
                <div className="flex items-center gap-4 mt-4 text-xs text-[#92908A] font-mono">
                  <span>{new Date(item.publishedAt || item.createdAt).toLocaleDateString()}</span>
                  {item.expiresAt && (
                    <span>Expires: {new Date(item.expiresAt).toLocaleDateString()}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </StateView>
      </div>
    </DashboardLayout>
  );
};
export default Announcements;
