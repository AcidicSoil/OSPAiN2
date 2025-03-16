import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Toast variant types
export type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

// Toast position types
export type ToastPosition = 
  'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 
  'top-center' | 'bottom-center';

// Toast action interface
export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}

// Toast props interface
export interface ToastProps {
  id: string;
  message: React.ReactNode;
  variant?: ToastVariant;
  duration?: number; // in milliseconds, 0 = no auto-close
  onClose: (id: string) => void;
  action?: ToastAction;
  showCloseButton?: boolean;
  className?: string;
  icon?: React.ReactNode;
  testId?: string;
}

// Individual Toast component
export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  variant = 'default',
  duration = 5000,
  onClose,
  action,
  showCloseButton = true,
  className = '',
  icon,
  testId = 'toast',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Handle automatic closing
  useEffect(() => {
    // If duration is 0, don't auto-close
    if (duration === 0) return;

    let timer: NodeJS.Timeout;

    if (isVisible && !isPaused) {
      timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Allow exit animation to complete
      }, duration);
    }
    
    return () => clearTimeout(timer);
  }, [id, duration, onClose, isVisible, isPaused]);

  // Handle manual closing
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // Allow exit animation to complete
  };
  
  // Variant-specific styling
  const variantClasses = {
    default: 'bg-gray-800 text-white',
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-600 text-white',
  };
  
  // Default icons based on variant
  const defaultIcons = {
    default: null,
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };
  
  const displayIcon = icon || defaultIcons[variant];
  
  // Animation classes
  const animationClasses = isVisible 
    ? 'transform translate-y-0 opacity-100' 
    : 'transform translate-y-2 opacity-0';

  return (
    <div 
      className={`fixed rounded-lg shadow-lg overflow-hidden ${variantClasses[variant]} ${animationClasses} transition-all duration-300 ${className}`}
      role="alert"
      aria-live="assertive"
      data-testid={testId}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center p-4">
        {displayIcon && (
          <div className="flex-shrink-0 mr-3">
            {displayIcon}
          </div>
        )}
        
        <div className="flex-grow mr-2">
          {message}
        </div>
        
        {action && (
          <button
            className={`ml-2 px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              action.variant === 'primary' 
                ? 'bg-white text-gray-800 hover:bg-gray-100' 
                : action.variant === 'secondary'
                ? 'bg-transparent border border-white text-white hover:bg-white/10'
                : 'underline text-white hover:text-gray-200'
            }`}
            onClick={action.onClick}
            data-testid={`${testId}-action`}
          >
            {action.label}
          </button>
        )}
        
        {showCloseButton && (
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-white hover:bg-white/10 focus:ring-2 focus:ring-white"
            aria-label="Close"
            onClick={handleClose}
            data-testid={`${testId}-close`}
          >
            <span className="sr-only">Close</span>
            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Toast container props
export interface ToastContainerProps {
  position?: ToastPosition;
  className?: string;
  testId?: string;
}

// Toast container component
export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'top-right',
  className = '',
  testId = 'toast-container',
}) => {
  const [containerRoot, setContainerRoot] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  // Create container element
  useEffect(() => {
    let containerElement = document.getElementById('toast-container');
    
    if (!containerElement) {
      containerElement = document.createElement('div');
      containerElement.id = 'toast-container';
      document.body.appendChild(containerElement);
    }
    
    setContainerRoot(containerElement);
    setMounted(true);
    
    return () => {
      if (containerElement && containerElement.childNodes.length === 0) {
        document.body.removeChild(containerElement);
      }
    };
  }, []);

  // Position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };

  // Container content
  const containerContent = (
    <div 
      className={`fixed z-50 flex flex-col gap-2 w-fit max-w-md ${positionClasses[position]} ${className}`}
      data-testid={testId}
    >
      {/* Toast children will be added through the useToast hook */}
    </div>
  );

  if (!mounted || !containerRoot) {
    return null;
  }

  return createPortal(containerContent, containerRoot);
};

// Unique ID generator
const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Toast context
type ToastContextType = {
  addToast: (props: Omit<ToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
  updateToast: (id: string, props: Partial<Omit<ToastProps, 'id' | 'onClose'>>) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Toast provider props
export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
}

// Toast provider component
export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = 'top-right',
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  // Add a new toast
  const addToast = (props: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, onClose: removeToast, ...props }]);
    return id;
  };

  // Remove a toast by id
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Remove all toasts
  const removeAllToasts = () => {
    setToasts([]);
  };

  // Update an existing toast
  const updateToast = (id: string, props: Partial<Omit<ToastProps, 'id' | 'onClose'>>) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, ...props } : toast
      )
    );
  };

  return (
    <ToastContext.Provider
      value={{ addToast, removeToast, removeAllToasts, updateToast }}
    >
      {children}
      <ToastContainer position={position}>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

// Custom hook for using the toast system
export const useToast = () => {
  const context = React.useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

// Convenience functions
export const toast = {
  show: (
    message: React.ReactNode,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'message'>>
  ) => {
    const context = React.useContext(ToastContext);
    if (!context) {
      throw new Error('toast.show must be used within a ToastProvider');
    }
    return context.addToast({ message, ...options });
  },
  
  success: (
    message: React.ReactNode,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'message' | 'variant'>>
  ) => {
    const context = React.useContext(ToastContext);
    if (!context) {
      throw new Error('toast.success must be used within a ToastProvider');
    }
    return context.addToast({ message, variant: 'success', ...options });
  },
  
  error: (
    message: React.ReactNode,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'message' | 'variant'>>
  ) => {
    const context = React.useContext(ToastContext);
    if (!context) {
      throw new Error('toast.error must be used within a ToastProvider');
    }
    return context.addToast({ message, variant: 'error', ...options });
  },
  
  warning: (
    message: React.ReactNode,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'message' | 'variant'>>
  ) => {
    const context = React.useContext(ToastContext);
    if (!context) {
      throw new Error('toast.warning must be used within a ToastProvider');
    }
    return context.addToast({ message, variant: 'warning', ...options });
  },
  
  info: (
    message: React.ReactNode,
    options?: Partial<Omit<ToastProps, 'id' | 'onClose' | 'message' | 'variant'>>
  ) => {
    const context = React.useContext(ToastContext);
    if (!context) {
      throw new Error('toast.info must be used within a ToastProvider');
    }
    return context.addToast({ message, variant: 'info', ...options });
  },
  
  remove: (id: string) => {
    const context = React.useContext(ToastContext);
    if (!context) {
      throw new Error('toast.remove must be used within a ToastProvider');
    }
    context.removeToast(id);
  },
  
  removeAll: () => {
    const context = React.useContext(ToastContext);
    if (!context) {
      throw new Error('toast.removeAll must be used within a ToastProvider');
    }
    context.removeAllToasts();
  },
};

export default Toast; 