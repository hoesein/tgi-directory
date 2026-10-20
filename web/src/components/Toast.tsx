import { useEffect } from 'react';
import { useToastStore } from '../store/toastStore';

const TOAST_MS = 2500;

/** Renders the app-wide toast; mounted once in App. */
export default function Toast() {
  const { message, id, hide } = useToastStore();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(hide, TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [message, id, hide]);

  if (!message) return null;
  return (
    <div className="app-toast" role="status" key={id}>
      {message}
    </div>
  );
}
