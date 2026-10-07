import { useState } from "react";
import { eventService, type EventType } from "../services/content/eventService";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";

const localDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
export function AdminEventForm({
  event,
  onSaved,
  onCancel,
}: {
  event?: EventType;
  onSaved: (id: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    event_type: event?.event_type || "Workshop",
    start_at: localDate(event?.start_at),
    end_at: localDate(event?.end_at),
    location: event?.location || "",
    meeting_url: event?.meeting_url || "",
    organizer: event?.organizer || "",
    capacity: event?.capacity?.toString() || "",
    registration_open_at: localDate(event?.registration_open_at),
    registration_close_at: localDate(event?.registration_close_at),
    status: event?.status || "draft",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const change = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (new Date(form.end_at) <= new Date(form.start_at)) {
      setError("The event must end after it starts.");
      return;
    }
    if (
      form.registration_open_at &&
      form.registration_close_at &&
      new Date(form.registration_open_at) >=
        new Date(form.registration_close_at)
    ) {
      setError("Registration must close after it opens.");
      return;
    }
    setBusy(true);
    try {
      const payload: Partial<EventType> = {
        ...form,
        status: form.status as EventType["status"],
        start_at: new Date(form.start_at).toISOString(),
        end_at: new Date(form.end_at).toISOString(),
        capacity: form.capacity ? Number(form.capacity) : null,
        registration_open_at: form.registration_open_at
          ? new Date(form.registration_open_at).toISOString()
          : null,
        registration_close_at: form.registration_close_at
          ? new Date(form.registration_close_at).toISOString()
          : null,
      };
      const result = event
        ? await eventService.updateEvent(event.id, payload)
        : await eventService.createEvent(payload);
      onSaved(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The event was not saved.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="event-editor"
      aria-label={event ? "Edit event" : "Create event"}
    >
      <h2 style={{ marginBottom: 24 }}>
        {event ? "Edit event" : "Create an event"}
      </h2>
      <Input
        label="Event title"
        required
        minLength={2}
        value={form.title}
        onChange={(e) => change("title", e.target.value)}
      />
      <label className="event-field">
        Description
        <textarea
          required
          minLength={2}
          value={form.description}
          onChange={(e) => change("description", e.target.value)}
          rows={5}
        />
      </label>
      <div className="event-editor-grid">
        <Input
          label="Event type"
          required
          value={form.event_type}
          onChange={(e) => change("event_type", e.target.value)}
        />
        <label className="event-field">
          Status
          <select
            value={form.status}
            onChange={(e) => change("status", e.target.value)}
          >
            {["draft", "published", "cancelled", "completed"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Starts (local time)"
          type="datetime-local"
          required
          value={form.start_at}
          onChange={(e) => change("start_at", e.target.value)}
        />
        <Input
          label="Ends (local time)"
          type="datetime-local"
          required
          value={form.end_at}
          onChange={(e) => change("end_at", e.target.value)}
        />
        <Input
          label="Location"
          value={form.location}
          onChange={(e) => change("location", e.target.value)}
        />
        <Input
          label="Meeting URL"
          type="url"
          value={form.meeting_url}
          onChange={(e) => change("meeting_url", e.target.value)}
        />
        <Input
          label="Organizer"
          value={form.organizer}
          onChange={(e) => change("organizer", e.target.value)}
        />
        <Input
          label="Capacity (blank for unlimited)"
          type="number"
          min={1}
          step={1}
          value={form.capacity}
          onChange={(e) => change("capacity", e.target.value)}
        />
        <Input
          label="Registration opens (optional)"
          type="datetime-local"
          value={form.registration_open_at}
          onChange={(e) => change("registration_open_at", e.target.value)}
        />
        <Input
          label="Registration closes (optional)"
          type="datetime-local"
          value={form.registration_close_at}
          onChange={(e) => change("registration_close_at", e.target.value)}
        />
      </div>
      {error && (
        <p className="form-error mb-4" role="alert">
          {error}
        </p>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <Button type="submit" isLoading={busy}>
          Save event
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
