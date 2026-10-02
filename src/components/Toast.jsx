import { useCallback, useState } from 'react';

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}

export function useToast() {
  const [message, setMessage] = useState('');
  const show = useCallback((text, ms = 1800) => {
    setMessage(text);
    window.clearTimeout(show._t);
    show._t = window.setTimeout(() => setMessage(''), ms);
  }, []);
  return [message, show];
}

export default Toast;