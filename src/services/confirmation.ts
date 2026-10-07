export const confirmationEvent = 'aiclub:confirmation';
export interface ConfirmationRequest { message: string; resolve: (accepted: boolean) => void }
export function confirmAction(message: string): Promise<boolean> {
  return new Promise(resolve => window.dispatchEvent(new CustomEvent<ConfirmationRequest>(confirmationEvent, { detail: { message, resolve } })));
}
