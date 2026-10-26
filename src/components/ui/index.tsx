import React, { ReactNode, ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2, X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

// ─── BUTTON ────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline-accent';
  size?: 'sm' | 'md' | 'lg' | 'icon' | 'icon-lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading = false, leftIcon, rightIcon,
  fullWidth, children, disabled, className = '', ...props
}, ref) => {
  const sizeClass = { sm: 'btn-sm', md: '', lg: 'btn-lg', icon: 'btn-icon', 'icon-lg': 'btn-icon btn-icon-lg' }[size];
  const classes = ['btn', `btn-${variant}`, sizeClass, fullWidth ? 'w-full' : '', className].filter(Boolean).join(' ');
  return (
    <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});
Button.displayName = 'Button';

// ─── STAR RATING ──────────────────────────────────────────────────
export function StarRating({ rating, max = 5, size = 14 }: { rating: number; max?: number; size?: number }) {
  return (
    <div className="star-rating" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill={filled ? 'currentColor' : 'none'} opacity={partial ? 0.5 : 1}>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </div>
  );
}

// ─── BADGE ────────────────────────────────────────────────────────
interface BadgeProps { variant?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'gold'; children: ReactNode; className?: string; }
export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return <span className={`badge badge-${variant} ${className}`}>{children}</span>;
}

// ─── AVATAR ───────────────────────────────────────────────────────
interface AvatarProps { src?: string; name: string; size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'; className?: string; }
export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase();
  const sizeMap = { sm: 32, md: 40, lg: 56, xl: 80, '2xl': 120 };
  const fontMap = { sm: 11, md: 14, lg: 18, xl: 24, '2xl': 36 };
  const px = sizeMap[size];

  if (src) {
    return (
      <img src={src} alt={name} className={`avatar avatar-${size} ${className}`}
        style={{ width: px, height: px, minWidth: px }}
        onError={(e) => { const t = e.target as HTMLImageElement; t.style.display = 'none'; t.nextElementSibling?.removeAttribute('style'); }} />
    );
  }
  return (
    <div className={`avatar-placeholder avatar-${size} ${className}`}
      style={{ width: px, height: px, minWidth: px, fontSize: fontMap[size] }}>
      {initials}
    </div>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────
export function Skeleton({ width, height, className = '', rounded, style }: { width?: string | number; height?: string | number; className?: string; rounded?: boolean; style?: React.CSSProperties }) {
  return (
    <div className={`skeleton ${className}`}
      style={{ width: width || '100%', height: height || 16, borderRadius: rounded ? 9999 : undefined, ...style }}
      aria-hidden="true" />
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────
interface EmptyStateProps { icon?: ReactNode; title: string; description?: string; action?: ReactNode; }
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state animate-fade-in">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="empty-state-title">{title}</div>
      {description && <p style={{ fontSize: 'var(--text-sm)', maxWidth: 400, color: 'var(--color-text-muted)' }}>{description}</p>}
      {action}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────
interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg'; }
export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null;
  const maxWidth = { sm: 400, md: 560, lg: 760 }[size];
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal-content" style={{ maxWidth }}>
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-5) var(--space-6)', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>{title}</h2>
            <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
        )}
        <div style={{ padding: 'var(--space-6)' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────
interface ConfirmDialogProps { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; confirmLabel?: string; confirmVariant?: 'primary' | 'danger'; loading?: boolean; }
export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', confirmVariant = 'primary', loading }: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>{message}</p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, ...(color ? { background: color } : {}) }} />
    </div>
  );
}

// ─── SWITCH ───────────────────────────────────────────────────────
interface SwitchProps { checked: boolean; onChange: (checked: boolean) => void; id?: string; label?: string; }
export function Switch({ checked, onChange, id, label }: SwitchProps) {
  const uid = id || `switch-${Math.random().toString(36).substr(2, 5)}`;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
      <label className="switch" htmlFor={uid}>
        <input type="checkbox" id={uid} checked={checked} onChange={e => onChange(e.target.checked)} />
        <span className="switch-track" />
      </label>
      {label && <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer' }} onClick={() => onChange(!checked)}>{label}</span>}
    </div>
  );
}

// ─── INPUT ────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; hint?: string; leftIcon?: ReactNode; rightIcon?: ReactNode; required?: boolean;
}
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, hint, leftIcon, rightIcon, required, id, className = '', ...props }, ref) => {
  const uid = id || `input-${Math.random().toString(36).substr(2, 5)}`;
  return (
    <div className="input-group">
      {label && <label className={`input-label${required ? ' required' : ''}`} htmlFor={uid}>{label}</label>}
      <div className={`input-wrapper${leftIcon ? ' input-icon-left' : ''}${rightIcon ? ' input-icon-right' : ''}`}>
        {leftIcon && <div className="input-icon">{leftIcon}</div>}
        <input ref={ref} id={uid} className={`input${error ? ' error' : ''} ${className}`} {...props} />
        {rightIcon && <div className="input-icon" style={{ left: 'auto', right: 'var(--space-3)' }}>{rightIcon}</div>}
      </div>
      {error && <span className="input-error" role="alert">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
});
Input.displayName = 'Input';

// ─── TEXTAREA ─────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string; hint?: string; required?: boolean;
}
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, hint, required, id, ...props }, ref) => {
  const uid = id || `textarea-${Math.random().toString(36).substr(2, 5)}`;
  return (
    <div className="input-group">
      {label && <label className={`input-label${required ? ' required' : ''}`} htmlFor={uid}>{label}</label>}
      <textarea ref={ref} id={uid} className={`input${error ? ' error' : ''}`} {...props} />
      {error && <span className="input-error" role="alert">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
});
Textarea.displayName = 'Textarea';

// ─── SELECT ───────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string; error?: string; options: { value: string; label: string }[]; required?: boolean; hint?: string;
}
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, hint, options, required, id, ...props }, ref) => {
  const uid = id || `select-${Math.random().toString(36).substr(2, 5)}`;
  return (
    <div className="input-group">
      {label && <label className={`input-label${required ? ' required' : ''}`} htmlFor={uid}>{label}</label>}
      <select ref={ref} id={uid} className={`input${error ? ' error' : ''}`} {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span className="input-error" role="alert">{error}</span>}
      {hint && !error && <span className="input-hint">{hint}</span>}
    </div>
  );
});
Select.displayName = 'Select';

// ─── CHIP / TAG ───────────────────────────────────────────────────
interface ChipProps { label: string; active?: boolean; onClick?: () => void; }
export function Chip({ label, active, onClick }: ChipProps) {
  return (
    <button type="button" className={`chip${active ? ' active' : ''}`} onClick={onClick}>{label}</button>
  );
}

// ─── LOADING SPINNER ──────────────────────────────────────────────
export function LoadingSpinner({ size = 24, color }: { size?: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-8)' }}>
      <Loader2 size={size} className="animate-spin" color={color || 'var(--color-accent)'} />
    </div>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────────
export function Divider({ label }: { label?: string }) {
  if (label) {
    return <div className="divider-text"><span>{label}</span></div>;
  }
  return <div className="divider" />;
}

// ─── KPI CARD ─────────────────────────────────────────────────────
interface KpiCardProps { label: string; value: string | number; icon?: ReactNode; change?: number; changeLabel?: string; }
export function KpiCard({ label, value, icon, change, changeLabel }: KpiCardProps) {
  return (
    <div className="kpi-card animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div className="kpi-label">{label}</div>
        {icon && <div style={{ color: 'var(--color-accent)', background: 'var(--color-accent-light)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)' }}>{icon}</div>}
      </div>
      <div className="kpi-value">{value}</div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span className={`kpi-change ${change >= 0 ? 'positive' : 'negative'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
          {changeLabel && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'success' | 'warning' | 'error' | 'accent' | 'default' | 'gold'; label: string }> = {
    pending: { variant: 'warning', label: 'Pending' },
    confirmed: { variant: 'accent', label: 'Confirmed' },
    checked_in: { variant: 'gold', label: 'Checked In' },
    in_progress: { variant: 'gold', label: 'In Progress' },
    completed: { variant: 'success', label: 'Completed' },
    cancelled: { variant: 'default', label: 'Cancelled' },
    no_show: { variant: 'error', label: 'No Show' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'default', label: 'Inactive' },
    paid: { variant: 'success', label: 'Paid' },
    unpaid: { variant: 'warning', label: 'Unpaid' },
    deposit_paid: { variant: 'accent', label: 'Deposit Paid' },
    refunded: { variant: 'default', label: 'Refunded' },
  };
  const info = map[status] || { variant: 'default', label: status };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
