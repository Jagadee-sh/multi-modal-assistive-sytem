import { createContext, useContext, useState } from 'react'

export interface Toast {
  id: string
  title: string
  description: string
  duration: number
  action?: React.ReactNode
}

export interface ToastState {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastState | undefined>(undefined)

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, ...toast }]);
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

