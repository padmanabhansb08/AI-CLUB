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
        className={`px-4 py-2.5 rounded-full bg-[#FAF9F6] text-[#92908A] border border-[rgba(17,17,17,0.1)] font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
      >
        <XCircle size={15} />
        <span>Event Cancelled</span>
      </button>
    );
  }

  if (isCompleted) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-full bg-[#FAF9F6] text-[#92908A] border border-[rgba(17,17,17,0.1)] font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
      >
        <Check size={15} />
        <span>Event Completed</span>
      </button>
    );
  }

  if (isAttended) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-medium text-xs flex items-center justify-center gap-2 cursor-default ${className}`}
      >
        <UserCheck size={15} />
        <span>Attended</span>
      </button>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled
          className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium text-xs flex items-center justify-center gap-2 cursor-default"
        >
          <Check size={15} />
          <span>Registered</span>
        </button>
        {onCancelRegistration && (
          <button
            onClick={onCancelRegistration}
            disabled={loading}
            className="px-3.5 py-2 rounded-full bg-[#FAF9F6] hover:bg-rose-50 text-[#66645F] hover:text-rose-700 border border-[rgba(17,17,17,0.1)] hover:border-rose-200 text-xs font-medium transition-colors"
            title="Cancel Registration"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : 'Cancel'}
          </button>
        )}
      </div>
    );
  }

  if (notYetOpen) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-full bg-[#FAF9F6] text-[#92908A] border border-[rgba(17,17,17,0.1)] font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
        title={`Opens on ${new Date(event.registration_open_at!).toLocaleString()}`}
      >
        <Clock size={15} />
        <span>Registration Not Open</span>
      </button>
    );
  }

  if (hasClosed) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-full bg-[#FAF9F6] text-[#92908A] border border-[rgba(17,17,17,0.1)] font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
      >
        <Clock size={15} />
        <span>Registration Closed</span>
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        disabled
        className={`px-4 py-2.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium text-xs flex items-center justify-center gap-2 cursor-not-allowed ${className}`}
      >
        <AlertCircle size={15} />
        <span>Event Full</span>
      </button>
    );
  }

  return (
    <button
      onClick={onRegister}
      disabled={loading}
      className={`pill-btn px-6 py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={15} className="animate-spin" />
          <span>Registering...</span>
        </>
      ) : (
        <span>Register Now</span>
      )}
    </button>
  );
};
