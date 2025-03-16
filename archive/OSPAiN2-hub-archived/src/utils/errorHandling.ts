/**
 * Error handling utilities for OSPAiN2-Hub
 * Provides standardized error handling, logging, and display
 */

// Custom error classes
export class AppError extends Error {
  code: string;
  details?: Record<string, any>;
  isOperational: boolean;

  constructor(
    message: string,
    code: string = 'APP_ERROR',
    details?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational; // True for expected operational errors, false for bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'NETWORK_ERROR', details);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  fieldErrors: Record<string, string>;
  
  constructor(message: string, fieldErrors: Record<string, string>, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = this.constructor.name;
    this.fieldErrors = fieldErrors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'AUTH_ERROR', details);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, details?: Record<string, any>) {
    const message = id 
      ? `${resource} with ID ${id} not found` 
      : `${resource} not found`;
    super(message, 'NOT_FOUND', details);
    this.name = this.constructor.name;
  }
}

export class PermissionError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'PERMISSION_ERROR', details);
    this.name = this.constructor.name;
  }
}

// Error logger
interface LogOptions {
  level?: 'info' | 'warn' | 'error';
  tags?: string[];
  user?: string;
  component?: string;
}

export const logError = (error: Error, options: LogOptions = {}) => {
  const {
    level = 'error',
    tags = [],
    user = 'anonymous',
    component = 'app'
  } = options;

  // Extract error details
  const errorDetails = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    code: (error as AppError).code,
    details: (error as AppError).details,
    isOperational: (error as AppError).isOperational,
    timestamp: new Date().toISOString(),
    tags,
    user,
    component
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console[level](
      `[${errorDetails.timestamp}] [${component}] ${error.name}: ${error.message}`,
      errorDetails
    );
  }

  // In production, we could send to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Here you would integrate with a logging service
    // Example: logService.captureException(error, errorDetails);
  }

  return errorDetails;
};

// Error handler - for use with async/await
export const handleAsync = async <T>(
  promise: Promise<T>,
  errorMessage = 'Operation failed'
): Promise<[T | null, AppError | null]> => {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    const appError = error instanceof AppError
      ? error
      : new AppError(
          error instanceof Error ? error.message : errorMessage,
          'UNKNOWN_ERROR',
          { originalError: error },
          false
        );
    
    logError(appError);
    return [null, appError];
  }
};

// Error display helpers
export interface ErrorDisplayOptions {
  showDetails?: boolean;
  showStack?: boolean;
  actionText?: string;
  actionFn?: () => void;
}

export const getErrorMessage = (error: Error | AppError | unknown, options: ErrorDisplayOptions = {}): {
  title: string;
  message: string;
  details?: Record<string, any>;
  actionText?: string;
  actionFn?: () => void;
} => {
  // Default values
  let title = 'Error';
  let message = 'An unexpected error occurred. Please try again.';
  let details = undefined;
  
  // Extract error information
  if (error instanceof AppError) {
    title = error.code.replace(/_/g, ' ');
    message = error.message;
    details = options.showDetails ? error.details : undefined;
  } else if (error instanceof Error) {
    title = error.name;
    message = error.message;
  }
  
  return {
    title,
    message,
    details,
    actionText: options.actionText,
    actionFn: options.actionFn
  };
};

// Validation helpers
export const validateRequired = (value: any, fieldName: string): string | null => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

export const validateMinLength = (value: string, minLength: number, fieldName: string): string | null => {
  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateForm = (
  values: Record<string, any>,
  validationRules: Record<string, (value: any) => string | null>
): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  Object.keys(validationRules).forEach(field => {
    const error = validationRules[field](values[field]);
    if (error) {
      errors[field] = error;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// React error boundary fallback component generator
export const createErrorFallback = (options: {
  title?: string;
  message?: string;
  retryLabel?: string;
  contactLabel?: string;
  contactEmail?: string;
}) => {
  const {
    title = 'Something went wrong',
    message = 'We encountered an unexpected error. Please try again or contact support.',
    retryLabel = 'Try again',
    contactLabel = 'Contact support',
    contactEmail = 'support@example.com'
  } = options;
  
  return ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
    const errorDetails = error instanceof AppError ? error.details : undefined;
    const isDev = process.env.NODE_ENV === 'development';
    
    return {
      title,
      message: error.message || message,
      details: isDev ? errorDetails : undefined,
      stack: isDev ? error.stack : undefined,
      reset: resetErrorBoundary,
      retryLabel,
      contactLabel,
      contactEmail
    };
  };
};

// Error retry utility with exponential backoff
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
    onRetry?: (attempt: number, delay: number, error: Error) => void;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 300,
    maxDelay = 5000,
    factor = 2,
    onRetry = () => {}
  } = options;
  
  let attempt = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      delay = Math.min(delay * factor, maxDelay);
      
      // Add some randomness to prevent all clients retrying simultaneously
      const jitter = delay * 0.1 * Math.random();
      const nextDelay = delay + jitter;
      
      if (onRetry && error instanceof Error) {
        onRetry(attempt, nextDelay, error);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, nextDelay));
    }
  }
}; 