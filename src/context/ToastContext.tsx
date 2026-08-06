import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export type ToastVariant = 'default' | 'success' | 'error';

interface ToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: ToastState | null;
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VISIBLE_DURATION_MS = 2200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = 'default') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    idRef.current += 1;
    setToast({ id: idRef.current, message, variant });
    timeoutRef.current = setTimeout(() => setToast(null), VISIBLE_DURATION_MS);
  }, []);

  const value = useMemo(() => ({ toast, showToast }), [toast, showToast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
