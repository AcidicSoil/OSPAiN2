/**
 * Application configuration
 */

// API URLs
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';
export const OLLAMA_API_URL = import.meta.env.VITE_OLLAMA_API_URL || 'http://localhost:11434';

// Feature flags
export const FEATURES = {
  ENABLE_KNOWLEDGE_GRAPH: true,
  ENABLE_SECURE_CHAT: true,
  ENABLE_MODEL_MANAGEMENT: true,
  ENABLE_EXPERIMENTAL_FEATURES: import.meta.env.DEV || false
};

// Application settings
export const APP_CONFIG = {
  DEFAULT_MODEL: 'llama3',
  MAX_HISTORY_LENGTH: 100,
  DEFAULT_THEME: 'dark',
  SESSION_TIMEOUT_MS: 1800000, // 30 minutes
  DEBOUNCE_MS: 300,
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_FILE_TYPES: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ]
};

// Error messages
export const ERROR_MESSAGES = {
  API_UNREACHABLE: 'Cannot connect to API. Please check your network connection and try again.',
  AUTHENTICATION_FAILED: 'Authentication failed. Please sign in again.',
  FILE_TOO_LARGE: `File size exceeds maximum limit of ${APP_CONFIG.MAX_FILE_SIZE_MB}MB.`,
  UNSUPPORTED_FILE_TYPE: 'File type not supported.',
  GENERAL_ERROR: 'An error occurred. Please try again later.'
};

// Analytics configuration
export const ANALYTICS_CONFIG = {
  ENABLED: import.meta.env.PROD,
  ANONYMIZE_IP: true,
  TRACK_EXCEPTIONS: true
}; 