import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'default' | 'filled' | 'outline' | 'unstyled';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label for the input field */
  label?: string;
  /** Size of the input */
  size?: InputSize;
  /** Visual variant of the input */
  variant?: InputVariant;
  /** Helper text to show below the input */
  helperText?: string;
  /** Error message to show below the input */
  error?: string;
  /** Icon to display at the start of the input */
  startIcon?: ReactNode;
  /** Icon to display at the end of the input */
  endIcon?: ReactNode;
  /** Full width input that takes 100% of container width */
  fullWidth?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to display a loading indicator */
  isLoading?: boolean;
  /** Callback when text is cleared using the clear button */
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  size = 'md',
  variant = 'default',
  helperText,
  error,
  startIcon,
  endIcon,
  fullWidth = false,
  className = '',
  id,
  disabled = false,
  required = false,
  isLoading = false,
  onClear,
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  // Base classes
  const baseClasses = 'rounded focus:outline-none transition-colors';
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };
  
  // Variant classes
  const variantClasses = {
    default: 'bg-input-bg border border-input-border focus:border-primary focus:ring-1 focus:ring-primary',
    filled: 'bg-carbon-100 dark:bg-carbon-700 border-transparent focus:bg-input-bg focus:border-primary',
    outline: 'bg-transparent border border-input-border focus:border-primary focus:ring-1 focus:ring-primary',
    unstyled: 'border-none shadow-none bg-transparent'
  };
  
  // Error state
  const errorClasses = error 
    ? 'border-error focus:border-error focus:ring-error text-error' 
    : '';
  
  // Disabled state
  const disabledClasses = disabled 
    ? 'opacity-60 cursor-not-allowed bg-carbon-100' 
    : '';
  
  // Width
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Manage padding when icons are present
  const iconPaddingClasses = startIcon ? 'pl-10' : '';
  
  // Clear button control
  const showClearButton = props.value && props.value.toString().length > 0 && onClear && !disabled;
  
  return (
    <div className={`input-container ${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block mb-1 text-sm font-medium text-text-primary"
        >
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      {/* Input wrapper */}
      <div className="relative">
        {/* Start icon */}
        {startIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
            {startIcon}
          </div>
        )}
        
        {/* Input element */}
        <input
          id={inputId}
          ref={ref}
          disabled={disabled || isLoading}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`
            ${baseClasses}
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${errorClasses}
            ${disabledClasses}
            ${widthClasses}
            ${iconPaddingClasses}
            ${showClearButton || endIcon || isLoading ? 'pr-10' : ''}
            text-text-primary placeholder:text-text-tertiary
          `}
          {...props}
        />
        
        {/* End icon or loading spinner or clear button */}
        {(endIcon || isLoading || showClearButton) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center text-text-tertiary">
            {isLoading && (
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            
            {!isLoading && showClearButton && (
              <button
                type="button"
                onClick={onClear}
                className="text-text-tertiary hover:text-text-primary"
                aria-label="Clear input"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            
            {!isLoading && !showClearButton && endIcon}
          </div>
        )}
      </div>
      
      {/* Helper text or error message */}
      {(helperText || error) && (
        <div 
          id={error ? `${inputId}-error` : `${inputId}-helper`}
          className={`text-sm mt-1 ${error ? 'text-error' : 'text-text-secondary'}`}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input; 