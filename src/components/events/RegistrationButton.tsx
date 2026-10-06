import React from 'react';
import { Check, XCircle, AlertCircle, Clock, Loader2, UserCheck } from 'lucide-react';
import type { EventItem } from '../../types/events';

interface RegistrationButtonProps {
  event: EventItem;
  onRegister: () => Promise<void>;
  onCancelRegistration?: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

export const RegistrationButton: React.FC<RegistrationButtonProps> = ({
  event,
  onRegister,
  onCancelRegistration,
  loading = false,
  className = '',
}) => {
  const isCancelled = event.status === 'cancelled';
  const isCompleted = event.status === 'completed';
  const isRegistered = event.currentStudentRegistrationStatus === 'REGISTERED';
  const isAttended = event.currentStudentRegistrationStatus === 'ATTENDED';

  const regCount = Number(event.registration_count || 0);
  const capacity = event.capacity ? Number(event.capacity) : null;
  const isFull = capacity !== null && regCount >= capacity;

  const now = Date.now();
  const regOpen = event.registration_open_at ? new Date(event.registration_open_at).getTime() : null;
  const regClose = event.registration_close_at ? new Date(event.registration_close_at).getTime() : null;

  const notYetOpen = regOpen !== null && now < regOpen;
  const hasClosed = regClose !== null && now > regClose;

  if (isCancelled) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-xl bg-zinc-800/80 text-zinc-500 border border-zinc-700/60 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
      >
        <XCircle size={16} />
        <span>Event Cancelled</span>
      </button>
    );
  }

  if (isCompleted) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-xl bg-zinc-800/80 text-zinc-500 border border-zinc-700/60 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
      >
        <Check size={16} />
        <span>Event Completed</span>
      </button>
    );
  }

  if (isAttended) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-xl bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 font-medium text-sm flex items-center justify-center gap-2 cursor-default ${className}`}
      >
        <UserCheck size={16} />
        <span>Attended</span>
      </button>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled
          className="px-4 py-2.5 rounded-xl bg-emerald-950/60 text-emerald-300 border border-emerald-700/60 font-medium text-sm flex items-center justify-center gap-2 cursor-default"
        >
          <Check size={16} />
          <span>Registered</span>
        </button>
        {onCancelRegistration && (
          <button
            onClick={onCancelRegistration}
            disabled={loading}
            className="px-3 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-700/60 hover:border-rose-800/60 text-xs font-medium transition-colors"
            title="Cancel Registration"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Cancel'}
          </button>
        )}
      </div>
    );
  }

  if (notYetOpen) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-xl bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
        title={`Opens on ${new Date(event.registration_open_at!).toLocaleString()}`}
      >
        <Clock size={16} />
        <span>Registration Not Open</span>
      </button>
    );
  }

  if (hasClosed) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-xl bg-zinc-800/60 text-zinc-500 border border-zinc-700/40 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
      >
        <Clock size={16} />
        <span>Registration Closed</span>
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-800/60 font-medium text-sm flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
      >
        <AlertCircle size={16} />
        <span>Event Full</span>
      </button>
    );
  }

  return (
    <button
      onClick={onRegister}
      disabled={loading}
      className={`px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-semibold text-sm shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Registering...</span>
        </>
      ) : (
        <span>Register Now</span>
      )}
    </button>
  );
};
