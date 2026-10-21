import { useCallback, useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    setToasts((current) => [...current, toast]);
    setTimeout(() => removeToast(id), 3000);
  }, [removeToast]);

  return {
    toasts,
    success: (message) => pushToast(message, 'success'),
    error: (message) => pushToast(message, 'error'),
    info: (message) => pushToast(message, 'info'),
    removeToast,
  };
}
