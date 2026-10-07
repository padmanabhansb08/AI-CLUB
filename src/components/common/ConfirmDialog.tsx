import { useEffect, useState } from 'react';
import { confirmationEvent, type ConfirmationRequest } from '../../services/confirmation';
import { useDialog } from '../../hooks/useDialog';

export function ConfirmDialog() {
  const [request, setRequest] = useState<ConfirmationRequest | null>(null);
  const answer = (accepted: boolean) => { request?.resolve(accepted); setRequest(null); };
  const ref = useDialog(!!request, () => answer(false));
  useEffect(() => {
    const receive = (event: Event) => setRequest(previous => {
      previous?.resolve(false);
      return (event as CustomEvent<ConfirmationRequest>).detail;
    });
    window.addEventListener(confirmationEvent, receive);
    return () => window.removeEventListener(confirmationEvent, receive);
  }, []);
  if (!request) return null;
  return <div className="confirmation-backdrop">
    <div ref={ref} role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message" tabIndex={-1} className="confirmation-dialog">
      <h2 id="confirmation-title">Confirm this change</h2>
      <p id="confirmation-message">{request.message}</p>
      <div className="confirmation-actions">
        <button type="button" onClick={() => answer(false)}>Keep as it is</button>
        <button type="button" className="confirm-primary" onClick={() => answer(true)}>Confirm</button>
      </div>
    </div>
  </div>;
}
