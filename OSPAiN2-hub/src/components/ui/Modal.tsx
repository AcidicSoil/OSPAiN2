import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { ErrorDisplay } from './ErrorDisplay';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';
type ModalVariant = 'default' | 'info' | 'success' | 'warning' | 'error';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  variant?: ModalVariant;
  closeOnClickOutside?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
  preventScroll?: boolean;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  closeButtonClassName?: string;
  backdropClassName?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  initialFocusRef?: React.RefObject<HTMLElement>;
  onAfterOpen?: () => void;
  testId?: string;
  error?: Error;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  variant = 'default',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  preventScroll = true,
  className = '',
  contentClassName = '',
  headerClassName = '',
  footerClassName = '',
  closeButtonClassName = '',
  backdropClassName = '',
  ariaLabelledBy = 'modal-title',
  ariaDescribedBy = 'modal-description',
  initialFocusRef,
  onAfterOpen,
  testId = 'modal',
  error
}) => {
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const prevActiveElement = useRef<Element | null>(null);

  // Portal creation
  useEffect(() => {
    let modalRootElement = document.getElementById('modal-root');
    
    if (!modalRootElement) {
      modalRootElement = document.createElement('div');
      modalRootElement.id = 'modal-root';
      document.body.appendChild(modalRootElement);
    }
    
    setModalRoot(modalRootElement);
    setMounted(true);
    
    return () => {
      // Clean up only if we created the modal root
      if (modalRootElement && modalRootElement.childNodes.length === 0) {
        document.body.removeChild(modalRootElement);
      }
    };
  }, []);

  // Handle modal open/close effects
  useEffect(() => {
    if (!isOpen) return;
    
    prevActiveElement.current = document.activeElement;
    
    // Set focus on initial element or modal itself
    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else if (modalRef.current) {
      modalRef.current.focus();
    }
    
    // Call onAfterOpen callback
    onAfterOpen?.();
    
    // Prevent body scroll when modal is open
    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      // Restore focus when modal closes
      if (prevActiveElement.current && 'focus' in prevActiveElement.current) {
        (prevActiveElement.current as HTMLElement).focus();
      }
      
      // Restore scroll
      if (preventScroll) {
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, initialFocusRef, onAfterOpen, preventScroll]);

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeOnEsc && event.key === 'Escape') {
        onClose();
      }
      
      // Trap focus within modal
      if (event.key === 'Tab') {
        if (!modalRef.current) return;
        
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        
        if (event.shiftKey && document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Handle click outside
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnClickOutside && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4 h-[calc(100vh-2rem)]',
  };

  // Variant classes
  const variantClasses = {
    default: 'bg-background border border-border',
    info: 'bg-blue-50 border border-blue-200',
    success: 'bg-green-50 border border-green-200',
    warning: 'bg-yellow-50 border border-yellow-200',
    error: 'bg-red-50 border border-red-200',
  };

  // Header classes based on variant
  const headerVariantClasses = {
    default: 'border-b border-border',
    info: 'border-b border-blue-200 bg-blue-100 text-blue-800',
    success: 'border-b border-green-200 bg-green-100 text-green-800',
    warning: 'border-b border-yellow-200 bg-yellow-100 text-yellow-800',
    error: 'border-b border-red-200 bg-red-100 text-red-800',
  };

  // Footer classes based on variant
  const footerVariantClasses = {
    default: 'border-t border-border',
    info: 'border-t border-blue-200 bg-blue-50',
    success: 'border-t border-green-200 bg-green-50',
    warning: 'border-t border-yellow-200 bg-yellow-50',
    error: 'border-t border-red-200 bg-red-50',
  };

  // Modal content
  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 ${backdropClassName}`}
      onClick={handleBackdropClick}
      data-testid={`${testId}-backdrop`}
      aria-modal="true"
      role="dialog"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    >
      <div
        ref={modalRef}
        className={`relative ${sizeClasses[size]} w-full rounded-lg shadow-xl ${variantClasses[variant]} ${className}`}
        tabIndex={-1}
        data-testid={testId}
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <ErrorDisplay
            error={error}
            variant="card"
            onDismiss={onClose}
            className="m-0"
          />
        ) : (
          <>
            {/* Modal header */}
            {(title || showCloseButton) && (
              <div
                className={`flex items-center justify-between rounded-t-lg p-4 ${headerVariantClasses[variant]} ${headerClassName}`}
                id={ariaLabelledBy}
              >
                {title && (
                  <h3 className="text-xl font-semibold">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    className={`ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full bg-transparent text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 ${closeButtonClassName}`}
                    onClick={onClose}
                    aria-label="Close"
                    data-testid={`${testId}-close-button`}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            {/* Modal content */}
            <div 
              className={`p-4 ${contentClassName}`} 
              id={ariaDescribedBy}
              data-testid={`${testId}-content`}
            >
              {children}
            </div>
            
            {/* Modal footer */}
            {footer && (
              <div 
                className={`flex items-center justify-end rounded-b-lg p-4 ${footerVariantClasses[variant]} ${footerClassName}`}
                data-testid={`${testId}-footer`}
              >
                {footer}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  // Backdrop
  const backdropElement = (
    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
  );

  // If not mounted or not open, don't render anything
  if (!mounted || !isOpen || !modalRoot) {
    return null;
  }
  
  // Render the modal using a portal
  return createPortal(
    <>
      {backdropElement}
      {modalContent}
    </>,
    modalRoot
  );
};

// Convenience component for modal with confirm/cancel buttons
export interface ConfirmModalProps extends Omit<ModalProps, 'footer'> {
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'success' | 'danger';
  isConfirmLoading?: boolean;
  isConfirmDisabled?: boolean;
}

// Confirm modal is a specialized version of Modal that includes confirm/cancel buttons
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  onConfirm,
  onClose,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'primary',
  isConfirmLoading = false,
  isConfirmDisabled = false,
  ...modalProps
}) => {
  const handleConfirm = () => {
    onConfirm();
  };
  
  const footer = (
    <>
      <Button
        variant="secondary"
        onClick={onClose}
        className="mr-2"
        data-testid="confirm-modal-cancel"
      >
        {cancelLabel}
      </Button>
      <Button
        variant={confirmVariant === 'primary' ? 'primary' : 
                confirmVariant === 'success' ? 'success' : 'danger'}
        onClick={handleConfirm}
        isLoading={isConfirmLoading}
        disabled={isConfirmDisabled}
        data-testid="confirm-modal-confirm"
      >
        {confirmLabel}
      </Button>
    </>
  );
  
  return (
    <Modal
      onClose={onClose}
      footer={footer}
      {...modalProps}
    />
  );
};

export default Modal; 