import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Search } from 'lucide-react';
import { memberService } from '../../services/content/memberService';
import type { Member } from '../../data/members';

export const AdminMembers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [activeYear, setActiveYear] = useState('All');
  const [activeClass, setActiveClass] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const res = await memberService.getMembers(1, 1000, searchTerm, activeDepartment === 'All' ? undefined : activeDepartment);
      
      let filtered = res.data;
      if (activeYear !== 'All') {
        filtered = filtered.filter((m: Member) => m.year && m.year.toString() === activeYear);
      }
      if (activeClass !== 'All') {
        filtered = filtered.filter((m: Member) => m.classSection === activeClass);
      }
      if (activeStatus !== 'All') {
        filtered = filtered.filter((m: Member) => (m.status || 'Active') === activeStatus);
      }
      setMembers(filtered || []);
      setLoading(false);
    };
    
    // Add debounce for search
    const timer = setTimeout(() => {
      fetchMembers();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, activeDepartment, activeYear, activeClass, activeStatus]);

  const departments = ['All', 'CS', 'IT', 'ECE', 'EEE', 'MECH'];
  const years = ['All', '1', '2', '3', '4'];
  const classes = ['All', 'A', 'B', 'C', 'D'];

  const resetFilters = () => {
    setSearchTerm('');
    setActiveDepartment('All');
    setActiveYear('All');
    setActiveClass('All');
    setActiveStatus('All');
  };

  const isFiltering = searchTerm !== '' || activeDepartment !== 'All' || activeYear !== 'All' || activeClass !== 'All' || activeStatus !== 'All';

  return (
    <AdminLayout pageTitle="Members">
      <div className="admin-section">
        <p className="text-secondary mb-6">View and manage AI Club member information.</p>
        
        {/* Filters */}
        <div className="courses-filter-bar">
          <div className="search-and-count">
            <div className="search-container">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search Members..." 
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="result-count">
              {loading ? 'Loading...' : `${members.length} members found`}
            </div>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label>Department:</label>
              <select value={activeDepartment} onChange={(e) => setActiveDepartment(e.target.value)} className="filter-select">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Year:</label>
              <select value={activeYear} onChange={(e) => setActiveYear(e.target.value)} className="filter-select">
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Class:</label>
              <select value={activeClass} onChange={(e) => setActiveClass(e.target.value)} className="filter-select">
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select value={activeStatus} onChange={(e) => setActiveStatus(e.target.value)} className="filter-select">
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {isFiltering && (
              <button className="btn-ghost clear-filters-btn" onClick={resetFilters}>
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-state">
            <h3>Loading members...</h3>
          </div>
        ) : members.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No members found</h3>
            <p>Try changing your search or filters.</p>
            <button className="btn btn-secondary mt-4" onClick={resetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Register Number</th>
                  <th>Department</th>
                  <th>Class</th>
                  <th>Year</th>
                  <th>College Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member: any) => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-cell">
                        <div className="member-avatar">{member.full_name ? member.full_name.charAt(0) : 'U'}</div>
                        <span>{member.full_name}</span>
                      </div>
                    </td>
                    <td>{member.register_number}</td>
                    <td>{member.department}</td>
                    <td>{member.class_section}</td>
                    <td>{member.year}</td>
                    <td>{member.college_email}</td>
                    <td>{member.phone}</td>
                    <td>{member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${member.status === 'Active' || !member.status ? 'status-open' : 'status-completed'}`}>
                        {member.status || 'Active'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/members/${member.id}`} className="view-link">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
