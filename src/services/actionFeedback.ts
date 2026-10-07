export const feedbackEvent = 'ai-club-action-error';
export function notifyError(message: string) {
  window.dispatchEvent(new CustomEvent(feedbackEvent, { detail: { message, kind: 'error' } }));
}
export function notifySuccess(message: string) {
  window.dispatchEvent(new CustomEvent(feedbackEvent, { detail: { message, kind: 'success' } }));
}
