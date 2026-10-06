import React from 'react';
import { Users, CheckCircle2, XCircle, Clock, Percent } from 'lucide-react';
import type { EventAttendanceData } from '../../types/events';

interface RegistrationStatsProps {
  stats: EventAttendanceData['stats'];
}

export const RegistrationStats: React.FC<RegistrationStatsProps> = ({ stats }) => {
  const capacity = stats.capacity;
  const remaining = capacity ? Math.max(0, capacity - stats.totalRegistrations) : null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
      {/* Registrations */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Registrations</span>
          <Users size={16} className="text-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-zinc-100">{stats.totalRegistrations}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {capacity ? `${remaining} spots remaining` : 'Unlimited capacity'}
          </div>
        </div>
      </div>

      {/* Present */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Present</span>
          <CheckCircle2 size={16} className="text-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats.present}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Marked present</div>
        </div>
      </div>

      {/* Late */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Late</span>
          <Clock size={16} className="text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-amber-400">{stats.late}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Marked late arrival</div>
        </div>
      </div>

      {/* Absent */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Absent</span>
          <XCircle size={16} className="text-rose-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-rose-400">{stats.absent}</div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {stats.notMarked > 0 ? `${stats.notMarked} unrecorded` : 'Recorded absent'}
          </div>
        </div>
      </div>

      {/* Attendance Rate */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 flex flex-col justify-between col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-zinc-400 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Turnout Rate</span>
          <Percent size={16} className="text-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {stats.attendanceRate.toFixed(1)}%
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">Present + Late ratio</div>
        </div>
      </div>
    </div>
  );
};
