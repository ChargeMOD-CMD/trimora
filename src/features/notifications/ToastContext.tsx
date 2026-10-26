import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState { toasts: Toast[] }

type ToastAction =
  | { type: 'ADD'; payload: Toast }
  | { type: 'REMOVE'; payload: string };

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD': return { toasts: [...state.toasts, action.payload] };
    case 'REMOVE': return { toasts: state.toasts.filter(t => t.id !== action.payload) };
    default: return state;
  }
}

interface ToastContextType {
  toasts: Toast[];
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const toast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    dispatch({ type: 'ADD', payload: { id, type, title, message, duration } });
    if (duration > 0) {
      setTimeout(() => dispatch({ type: 'REMOVE', payload: id }), duration);
    }
  }, []);

  const remove = useCallback((id: string) => dispatch({ type: 'REMOVE', payload: id }), []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, remove }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
