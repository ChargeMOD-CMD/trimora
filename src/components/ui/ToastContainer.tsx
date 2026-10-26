import React from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useToast, Toast } from '../../features/notifications/ToastContext';

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'var(--color-success)',
  error: 'var(--color-error)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { remove } = useToast();
  const Icon = iconMap[toast.type];

  return (
    <div className={`toast toast-${toast.type}`}>
      <Icon size={18} color={colorMap[toast.type]} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1 }}>
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <button
        onClick={() => remove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0, marginLeft: 8, flexShrink: 0 }}
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
    </div>
  );
}
