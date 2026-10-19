import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/*
  Avisos cortos ("Imagen copiada", "No se pudo compartir"): una píldora oscura
  arriba, igual que la de "Agregado" del pedido (CartContext), con el ícono en
  el color del tipo de aviso. Se va sola a los tres segundos.
*/

const ICONOS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 shrink-0 text-wa-light" aria-hidden="true" />,
  error: <XCircle className="h-5 w-5 shrink-0 text-red-400" aria-hidden="true" />,
  info: <Info className="h-5 w-5 shrink-0 text-brand-orange" aria-hidden="true" />,
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed left-1/2 top-4 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full border border-white/10 bg-brand-bg/95 px-5 py-3 text-white shadow-2xl backdrop-blur-md animate-rise"
          >
            {ICONOS[toast.type]}
            <p className="text-sm font-bold leading-tight">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast debe usarse dentro de ToastProvider');
  return context;
};
