import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StateView } from '../components/common/StateView';
import { memberService } from '../services/content/memberService';

export const Members = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [skill, setSkill] = useState('');
  const [interest, setInterest] = useState('');
  
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchMembers();
  }, [pagination.page, department, year, skill, interest]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await memberService.getPublicMembers(
        pagination.page, 
        pagination.limit, 
        search, 
        department, 
        year, 
        skill, 
        interest
      );
      setMembers(res.data || []);
      setPagination(res.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 });
      setError(null);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchMembers();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="border-b border-gray-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-gray-100">Member Directory</h1>
        <p className="text-gray-400 mt-2">Discover and connect with AI CLUB members.</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, bio, skills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium">
              Search
            </button>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPagination({...pagination, page: 1}); }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="AI&DS">AI&DS</option>
            </select>

            <select
              value={year}
              onChange={(e) => { setYear(e.target.value); setPagination({...pagination, page: 1}); }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Years</option>
              <option value="1">1st Year</option>
              <option value="2">2nd Year</option>
              <option value="3">3rd Year</option>
              <option value="4">4th Year</option>
            </select>

            <input
              type="text"
              placeholder="Filter by Skill"
              value={skill}
              onChange={(e) => { setSkill(e.target.value); }}
              onBlur={() => { setPagination({...pagination, page: 1}); fetchMembers(); }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            
            <input
              type="text"
              placeholder="Filter by Interest"
              value={interest}
              onChange={(e) => { setInterest(e.target.value); }}
              onBlur={() => { setPagination({...pagination, page: 1}); fetchMembers(); }}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </form>
      </div>

      <StateView loading={loading} error={error} empty={members.length === 0} emptyMessage="No members match your search criteria.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <Link key={member.id} to={`/members/${member.id}`} className="block bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-100">{member.full_name}</h3>
                  <div className="text-sm font-mono text-blue-400 mt-1">
                    {member.department} • Year {member.year}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                {member.bio || 'No bio provided.'}
              </p>
              
              <div className="space-y-2">
                {member.skills && member.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {member.skills.slice(0, 3).map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded uppercase tracking-wider">
                        {s}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-800 border border-gray-700 text-gray-500 text-xs rounded uppercase tracking-wider">
                        +{member.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}
                
                {member.technical_interests && member.technical_interests.length > 0 && (
                  <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                    Interests: {member.technical_interests.slice(0, 3).join(', ')}
                    {member.technical_interests.length > 3 ? '...' : ''}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8">
            <button 
              onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Previous
            </button>
            <span className="text-gray-400 font-mono text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button 
              onClick={() => setPagination({...pagination, page: Math.min(pagination.totalPages, pagination.page + 1)})}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-700 rounded bg-gray-800 text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </StateView>
    </div>
  );
};
