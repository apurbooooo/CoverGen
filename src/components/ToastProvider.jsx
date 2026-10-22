import { useCallback, useState, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastContext } from '../context/ToastContext.js';

const iconMap = {
  success: <CheckCircle size={18} color="var(--color-success)" />,
  error: <XCircle size={18} color="var(--color-error)" />,
  info: <Info size={18} color="var(--color-primary)" />,
};

/**
 * Toast notification provider and renderer.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            role="alert"
          >
            <div className="toast-icon" aria-hidden="true">
              {iconMap[toast.type]}
            </div>
            <div className="toast-body">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              {toast.message && <div className="toast-message">{toast.message}</div>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '2px', display: 'flex', alignItems: 'center' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
