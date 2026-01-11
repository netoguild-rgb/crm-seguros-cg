import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// Toast Context
const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast deve ser usado dentro de um ToastProvider');
    }
    return context;
};

// Individual Toast Component
const Toast = ({ id, type, title, message, onClose }) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onClose(id), 300);
        }, 4000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    const icons = {
        success: <CheckCircle className="text-emerald-500" size={22} />,
        error: <XCircle className="text-red-500" size={22} />,
        warning: <AlertTriangle className="text-amber-500" size={22} />,
        info: <Info className="text-blue-500" size={22} />,
    };

    const borderColors = {
        success: 'border-l-emerald-500',
        error: 'border-l-red-500',
        warning: 'border-l-amber-500',
        info: 'border-l-blue-500',
    };

    const bgGradients = {
        success: 'from-emerald-50 to-white',
        error: 'from-red-50 to-white',
        warning: 'from-amber-50 to-white',
        info: 'from-blue-50 to-white',
    };

    return (
        <div
            className={`
        relative flex items-start gap-3 p-4 pr-10
        bg-gradient-to-r ${bgGradients[type]}
        rounded-xl shadow-card-hover border-l-4 ${borderColors[type]}
        backdrop-blur-lg
        min-w-[320px] max-w-[420px]
        transform transition-all duration-300 ease-out
        ${isExiting
                    ? 'opacity-0 translate-x-full'
                    : 'opacity-100 translate-x-0 animate-fade-in-right'
                }
      `}
            style={{
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.5) inset'
            }}
        >
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
                {icons[type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {title && (
                    <h4 className="text-sm font-bold text-slate-800 mb-0.5">
                        {title}
                    </h4>
                )}
                <p className="text-sm text-slate-600 leading-relaxed">
                    {message}
                </p>
            </div>

            {/* Close Button */}
            <button
                onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => onClose(id), 300);
                }}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 transition-colors text-slate-400 hover:text-slate-600"
            >
                <X size={16} />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-xl overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r ${type === 'success' ? 'from-emerald-400 to-emerald-600' :
                            type === 'error' ? 'from-red-400 to-red-600' :
                                type === 'warning' ? 'from-amber-400 to-amber-600' :
                                    'from-blue-400 to-blue-600'
                        }`}
                    style={{
                        animation: 'shrink 4s linear forwards'
                    }}
                />
            </div>

            <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast {...toast} onClose={removeToast} />
                </div>
            ))}
        </div>
    );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback(({ type = 'info', title, message }) => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, type, title, message }]);
        return id;
    }, []);

    const toast = {
        success: (message, title) => addToast({ type: 'success', title, message }),
        error: (message, title) => addToast({ type: 'error', title, message }),
        warning: (message, title) => addToast({ type: 'warning', title, message }),
        info: (message, title) => addToast({ type: 'info', title, message }),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

export default Toast;
