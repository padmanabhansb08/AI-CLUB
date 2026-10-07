import { useEffect, useState } from "react";
import { feedbackEvent } from "../../services/actionFeedback";
export function ActionFeedback() {
  const [feedback, setFeedback] = useState<{ message: string; kind: 'error' | 'success' } | null>(null);
  useEffect(() => {
    const onError = (event: Event) =>
      setFeedback((event as CustomEvent<{ message: string; kind: 'error' | 'success' }>).detail);
    window.addEventListener(feedbackEvent, onError);
    return () => window.removeEventListener(feedbackEvent, onError);
  }, []);
  useEffect(() => {
    if (feedback?.kind !== 'success') return;
    const timer = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(timer);
  }, [feedback]);
  if (!feedback) return null;
  return (
    <div role={feedback.kind === 'error' ? 'alert' : 'status'} className="action-feedback">
      <div>
        <strong>{feedback.kind === 'error' ? 'Unable to complete this action' : 'Saved successfully'}</strong>
        <p>{feedback.message}</p>
      </div>
      <button onClick={() => setFeedback(null)} aria-label="Dismiss message">
        ×
      </button>
    </div>
  );
}
