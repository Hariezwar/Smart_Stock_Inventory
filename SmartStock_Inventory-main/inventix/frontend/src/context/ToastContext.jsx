import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import clsx from 'clsx';

const ToastContext = createContext();

const icons = {
  success: <CheckCircle className="w-5 h-5 text-[#1A3D63]" />,
  error: <XCircle className="w-5 h-5 text-[#0A1931]" />,
  warning: <AlertTriangle className="w-5 h-5 text-[#1A3D63]" />,
  info: <Info className="w-5 h-5 text-[#1A3D63]" />,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="surface-strong pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3 min-w-[280px] max-w-sm animate-in slide-in-from-right-5 duration-300">
            <span className="shrink-0 mt-0.5">{icons[t.type]}</span>
            <p className="text-sm text-[color:var(--text)] flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="shrink-0 text-[color:var(--muted)] hover:text-[color:var(--text)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
