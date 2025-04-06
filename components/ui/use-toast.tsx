// Simple use-toast hook implementation
import { useState, useCallback } from 'react';

type ToastVariant = 'default' | 'destructive';

interface ToastProps {
  id: number;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: ToastProps) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, title, description, variant }]);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  return { toast, toasts };
}