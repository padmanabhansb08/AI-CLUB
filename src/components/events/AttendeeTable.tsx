import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  Search, 
  CheckSquare, 
  Square, 
  Loader2 
} from 'lucide-react';
import { EventStatusBadge } from './EventStatusBadge';
import type { AttendeeItem, AttendanceStatus } from '../../types/events';

interface AttendeeTableProps {
  attendees: AttendeeItem[];
  onMarkSingle: (memberId: string, status: AttendanceStatus) => Promise<void>;
  onMarkBulk: (memberIds: string[], status: AttendanceStatus) => Promise<void>;
  loading?: boolean;
}

export const AttendeeTable: React.FC<AttendeeTableProps> = ({
  attendees,
  onMarkSingle,
  onMarkBulk,
  loading = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PRESENT' | 'ABSENT' | 'LATE' | 'NOT_MARKED'>('ALL');
  const [actionLoading, setActionLoading] = useState(false);

  // Filter attendees by search and attendance status
  const filteredAttendees = attendees.filter((a) => {
    const matchesSearch =
      a.full_name.toLowerCase().includes(search.toLowerCase()) ||
      a.register_number.toLowerCase().includes(search.toLowerCase()) ||
      a.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || a.attendance_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAttendees.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAttendees.map((a) => a.member_id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (status: AttendanceStatus) => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading(true);
      await onMarkBulk(selectedIds, status);
      setSelectedIds([]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSingleClick = async (memberId: string, status: AttendanceStatus) => {
    try {
      setActionLoading(true);
      await onMarkSingle(memberId, status);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-zinc-400">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span>Loading attendees...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search + Filter + Bulk Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attendees by name, reg number, or dept..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs md:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['ALL', 'NOT_MARKED', 'PRESENT', 'LATE', 'ABSENT'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === s
                  ? 'bg-zinc-700 text-zinc-100 border border-zinc-600'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk Action Toolbar if items selected */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 animate-in fade-in duration-200">
          <div className="text-xs text-emerald-300 font-medium">
            <strong>{selectedIds.length}</strong> attendee{selectedIds.length > 1 ? 's' : ''} selected
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('PRESENT')}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-semibold text-xs hover:bg-emerald-400 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Check size={14} />
              <span>Mark Present</span>
            </button>
            <button
              onClick={() => handleBulkAction('LATE')}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-600/40 font-semibold text-xs hover:bg-amber-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Clock size={14} />
              <span>Mark Late</span>
            </button>
            <button
              onClick={() => handleBulkAction('ABSENT')}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-600/40 font-semibold text-xs hover:bg-rose-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <X size={14} />
              <span>Mark Absent</span>
            </button>
          </div>
        </div>
      )}

      {/* Attendees Table / Cards */}
      {filteredAttendees.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-500 text-sm">
          No registered attendees match your criteria.
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <table className="w-full text-left text-xs md:text-sm text-zinc-300">
              <thead className="bg-zinc-800/50 text-zinc-400 font-semibold border-b border-zinc-800 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-zinc-400 hover:text-zinc-200"
                      title="Select all"
                    >
                      {selectedIds.length === filteredAttendees.length && filteredAttendees.length > 0 ? (
                        <CheckSquare size={16} className="text-emerald-400" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Register No.</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Registered At</th>
                  <th className="p-3.5">Reg Status</th>
                  <th className="p-3.5 text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                {filteredAttendees.map((a) => {
                  const isSelected = selectedIds.includes(a.member_id);
                  const regDate = new Date(a.registered_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr
                      key={a.registration_id}
                      className={`hover:bg-zinc-800/30 transition-colors ${
                        isSelected ? 'bg-emerald-950/15' : ''
                      }`}
                    >
                      <td className="p-3.5">
                        <button
                          onClick={() => toggleSelectOne(a.member_id)}
                          className="text-zinc-400 hover:text-zinc-200"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-emerald-400" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="p-3.5 font-sans font-medium text-zinc-100">
                        {a.full_name}
                      </td>
                      <td className="p-3.5 text-zinc-400">{a.register_number}</td>
                      <td className="p-3.5 text-zinc-400">
                        {a.department} {a.class_section ? `(${a.class_section})` : ''}
                      </td>
                      <td className="p-3.5 text-zinc-400">{regDate}</td>
                      <td className="p-3.5">
                        <EventStatusBadge status={a.registration_status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5 font-sans">
                          {/* Present button */}
                          <button
                            onClick={() => handleSingleClick(a.member_id, 'PRESENT')}
                            disabled={actionLoading || a.attendance_status === 'PRESENT'}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
                              a.attendance_status === 'PRESENT'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600'
                                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-emerald-300 hover:border-emerald-700'
                            }`}
                            title="Mark Present"
                          >
                            <Check size={13} />
                            <span>Present</span>
                          </button>

                          {/* Late button */}
                          <button
                            onClick={() => handleSingleClick(a.member_id, 'LATE')}
                            disabled={actionLoading || a.attendance_status === 'LATE'}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
                              a.attendance_status === 'LATE'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-600'
                                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-amber-300 hover:border-amber-700'
                            }`}
                            title="Mark Late"
                          >
                            <Clock size={13} />
                            <span>Late</span>
                          </button>

                          {/* Absent button */}
                          <button
                            onClick={() => handleSingleClick(a.member_id, 'ABSENT')}
                            disabled={actionLoading || a.attendance_status === 'ABSENT'}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 ${
                              a.attendance_status === 'ABSENT'
                                ? 'bg-rose-950/80 text-rose-300 border-rose-600'
                                : 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60 hover:text-rose-300 hover:border-rose-700'
                            }`}
                            title="Mark Absent"
                          >
                            <X size={13} />
                            <span>Absent</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Representation */}
          <div className="md:hidden space-y-3">
            {filteredAttendees.map((a) => {
              const isSelected = selectedIds.includes(a.member_id);
              return (
                <div
                  key={a.registration_id}
                  className={`p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3 ${
                    isSelected ? 'border-emerald-700/80 bg-emerald-950/10' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => toggleSelectOne(a.member_id)}
                        className="text-zinc-400 hover:text-zinc-200"
                      >
                        {isSelected ? (
                          <CheckSquare size={18} className="text-emerald-400" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                      <div>
                        <h4 className="font-semibold text-zinc-100 text-sm">{a.full_name}</h4>
                        <span className="text-xs text-zinc-500 font-mono">
                          {a.register_number} • {a.department}
                        </span>
                      </div>
                    </div>
                    <EventStatusBadge status={a.attendance_status} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/60">
                    <span>
                      Registered:{' '}
                      {new Date(a.registered_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <EventStatusBadge status={a.registration_status} />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => handleSingleClick(a.member_id, 'PRESENT')}
                      disabled={actionLoading || a.attendance_status === 'PRESENT'}
                      className={`py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 ${
                        a.attendance_status === 'PRESENT'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <Check size={12} /> Present
                    </button>
                    <button
                      onClick={() => handleSingleClick(a.member_id, 'LATE')}
                      disabled={actionLoading || a.attendance_status === 'LATE'}
                      className={`py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 ${
                        a.attendance_status === 'LATE'
                          ? 'bg-amber-950 text-amber-300 border-amber-600'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <Clock size={12} /> Late
                    </button>
                    <button
                      onClick={() => handleSingleClick(a.member_id, 'ABSENT')}
                      disabled={actionLoading || a.attendance_status === 'ABSENT'}
                      className={`py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 ${
                        a.attendance_status === 'ABSENT'
                          ? 'bg-rose-950 text-rose-300 border-rose-600'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      <X size={12} /> Absent
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
