import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Globe, Users, AlertCircle, Loader2 } from 'lucide-react';
import { EVENT_TYPES, type EventItem, type EventTypeEnum } from '../../types/events';

interface EventFormProps {
  initialData?: Partial<EventItem>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any, shouldPublish?: boolean) => Promise<void>;
  title?: string;
}

export const EventForm: React.FC<EventFormProps> = ({
  initialData,
  isOpen,
  onClose,
  onSubmit,
  title = 'Create Event',
}) => {
  // Format ISO strings to datetime-local format (YYYY-MM-DDTHH:mm)
  const formatForInput = (isoString?: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      return localISOTime;
    } catch {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    event_type: (initialData?.event_type || 'WORKSHOP') as EventTypeEnum,
    start_at: formatForInput(initialData?.start_at),
    end_at: formatForInput(initialData?.end_at),
    location: initialData?.location || '',
    meeting_url: initialData?.meeting_url || '',
    organizer: initialData?.organizer || 'AI CLUB',
    capacity: initialData?.capacity ? String(initialData.capacity) : '100',
    registration_open_at: formatForInput(initialData?.registration_open_at),
    registration_close_at: formatForInput(initialData?.registration_close_at),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.start_at) {
      newErrors.start_at = 'Start date and time is required';
    }

    if (!formData.end_at) {
      newErrors.end_at = 'End date and time is required';
    } else if (formData.start_at && new Date(formData.end_at) <= new Date(formData.start_at)) {
      newErrors.end_at = 'End date/time must be strictly after start date/time';
    }

    if (!formData.location.trim() && !formData.meeting_url.trim()) {
      newErrors.location = 'Provide either a physical location or a virtual meeting URL';
    }

    if (formData.meeting_url && !formData.meeting_url.startsWith('http://') && !formData.meeting_url.startsWith('https://')) {
      newErrors.meeting_url = 'Meeting URL must begin with http:// or https://';
    }

    if (formData.capacity) {
      const cap = Number(formData.capacity);
      if (isNaN(cap) || cap < 1 || !Number.isInteger(cap)) {
        newErrors.capacity = 'Capacity must be a positive integer';
      }
    }

    if (formData.registration_open_at && formData.registration_close_at) {
      if (new Date(formData.registration_close_at) <= new Date(formData.registration_open_at)) {
        newErrors.registration_close_at = 'Registration close must be after registration open';
      }
    }

    if (formData.registration_close_at && formData.start_at) {
      if (new Date(formData.registration_close_at) > new Date(formData.start_at)) {
        newErrors.registration_close_at = 'Registration close cannot occur after event starts';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (publish = false) => {
    setSubmitError(null);
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        event_type: formData.event_type,
        start_at: new Date(formData.start_at).toISOString(),
        end_at: new Date(formData.end_at).toISOString(),
        location: formData.location.trim() || null,
        meeting_url: formData.meeting_url.trim() || null,
        organizer: formData.organizer.trim() || null,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        registration_open_at: formData.registration_open_at
          ? new Date(formData.registration_open_at).toISOString()
          : null,
        registration_close_at: formData.registration_close_at
          ? new Date(formData.registration_close_at).toISOString()
          : null,
        status: publish ? 'published' : initialData?.status || 'draft',
      };

      await onSubmit(payload, publish);
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-6 text-zinc-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-bold text-zinc-100">{title}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Fill in all event details and registration windows.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {submitError && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-400" />
            <span>{submitError}</span>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="space-y-4 text-xs"
        >
          {/* Title */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Event Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AI / ML Workshop: From Zero to LLMs"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            {errors.title && <p className="text-rose-400 mt-1">{errors.title}</p>}
          </div>

          {/* Type & Organizer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Event Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value as EventTypeEnum })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">Organizer</label>
              <input
                type="text"
                value={formData.organizer}
                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                placeholder="e.g. AI CLUB Core Team"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1">
              Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of topics, speaker bios, and prerequisites..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            {errors.description && <p className="text-rose-400 mt-1">{errors.description}</p>}
          </div>

          {/* Schedule: Start & End */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div>
              <label className="block font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                <Calendar size={13} className="text-emerald-400" />
                Start Date & Time <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.start_at}
                onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              {errors.start_at && <p className="text-rose-400 mt-1">{errors.start_at}</p>}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                <Clock size={13} className="text-emerald-400" />
                End Date & Time <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.end_at}
                onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              {errors.end_at && <p className="text-rose-400 mt-1">{errors.end_at}</p>}
            </div>
          </div>

          {/* Location & Meeting URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-zinc-400" />
                Physical Venue / Room
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. AI Lab, Mechanical Block 3rd Floor"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              {errors.location && <p className="text-rose-400 mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
                <Globe size={13} className="text-cyan-400" />
                Virtual Meeting URL
              </label>
              <input
                type="url"
                value={formData.meeting_url}
                onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                placeholder="e.g. https://meet.google.com/xyz-abc"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              {errors.meeting_url && <p className="text-rose-400 mt-1">{errors.meeting_url}</p>}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block font-medium text-zinc-300 mb-1 flex items-center gap-1.5">
              <Users size={13} className="text-zinc-400" />
              Capacity (Max Attendees)
            </label>
            <input
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="e.g. 100"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            {errors.capacity && <p className="text-rose-400 mt-1">{errors.capacity}</p>}
          </div>

          {/* Registration Window */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Registration Opens At
              </label>
              <input
                type="datetime-local"
                value={formData.registration_open_at}
                onChange={(e) => setFormData({ ...formData, registration_open_at: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-zinc-300 mb-1">
                Registration Closes At
              </label>
              <input
                type="datetime-local"
                value={formData.registration_close_at}
                onChange={(e) => setFormData({ ...formData, registration_close_at: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
              {errors.registration_close_at && (
                <p className="text-rose-400 mt-1">{errors.registration_close_at}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>Save as Draft</span>
            </button>
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition-colors shadow-lg shadow-emerald-950/40 flex items-center gap-1.5"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              <span>{initialData?.status === 'published' ? 'Save Changes' : 'Publish Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
