import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Configure default logging levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// API request metadata
interface RequestMeta {
  startTime: number;
  endTime?: number;
  retryCount: number;
  url: string;
  method: string;
}

/**
 * Enhanced logger with additional context for API operations
 */
export const apiLogger = {
  error: (message: string, error?: any, meta?: RequestMeta) => {
    console.error(
      `[API ERROR] ${message}`,
      meta
        ? `\nEndpoint: ${meta.method} ${meta.url}\nDuration: ${getDuration(meta)}ms\nRetries: ${meta.retryCount}`
        : '',
      error ? `\nDetails: ${error.message}\n${error.stack}` : '',
    );
  },

  warn: (message: string, meta?: RequestMeta) => {
    console.warn(
      `[API WARNING] ${message}`,
      meta
        ? `\nEndpoint: ${meta.method} ${meta.url}\nDuration: ${getDuration(meta)}ms\nRetries: ${meta.retryCount}`
        : '',
    );
  },

  info: (message: string, meta?: RequestMeta) => {
    if (process.env.NODE_ENV !== 'production') {
      console.info(
        `[API INFO] ${message}`,
        meta
          ? `\nEndpoint: ${meta.method} ${meta.url}\nDuration: ${getDuration(meta)}ms\nRetries: ${meta.retryCount}`
          : '',
      );
    }
  },

  debug: (message: string, data?: any, meta?: RequestMeta) => {
    if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_DEBUG === 'true') {
      console.debug(
        `[API DEBUG] ${message}`,
        meta
          ? `\nEndpoint: ${meta.method} ${meta.url}\nDuration: ${getDuration(meta)}ms\nRetries: ${meta.retryCount}`
          : '',
        data ? '\nData:' : '',
        data || '',
      );
    }
  },
};

// Helper to calculate request duration
const getDuration = (meta: RequestMeta): number => {
  if (!meta.endTime) return 0;
  return meta.endTime - meta.startTime;
};

/**
 * Configuration specific to retry and caching behavior
 */
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryStatusCodes: number[];
  cacheDuration: number; // in milliseconds
}

/**
 * Configuration for fetch requests with retry logic
 */
export interface FetchConfig extends Partial<RetryConfig>, AxiosRequestConfig {}

// Default configuration for retry behavior
const defaultRetryConfig: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
  cacheDuration: 5 * 60 * 1000, // 5 minutes
};

// Simple in-memory cache
interface CacheEntry {
  data: any;
  timestamp: number;
}

const apiCache = new Map<string, CacheEntry>();

/**
 * Generate a cache key from request details
 */
const generateCacheKey = (url: string, config?: AxiosRequestConfig): string => {
  const params = config?.params ? JSON.stringify(config.params) : '';
  return `${config?.method || 'get'}-${url}-${params}`;
};

/**
 * Check if a cached response is still valid
 */
const isCacheValid = (entry: CacheEntry, cacheDuration: number): boolean => {
  return Date.now() - entry.timestamp < cacheDuration;
};

/**
 * Fetch data with retry logic, caching, and comprehensive error handling
 */
export const fetchWithRetry = async <T>(url: string, config?: FetchConfig): Promise<T> => {
  const finalConfig = { ...defaultRetryConfig, ...config };
  const { maxRetries, retryDelay, retryStatusCodes, cacheDuration, ...axiosConfig } = finalConfig;

  // Only use cache for GET requests
  const isGetRequest = !axiosConfig.method || axiosConfig.method.toLowerCase() === 'get';

  if (isGetRequest) {
    const cacheKey = generateCacheKey(url, axiosConfig);
    const cachedResponse = apiCache.get(cacheKey);

    // Return cached response if valid and we're not forcing a refresh
    if (
      cachedResponse &&
      isCacheValid(cachedResponse, cacheDuration || 0) &&
      !axiosConfig.headers?.['x-refresh']
    ) {
      apiLogger.debug(`Using cached response for ${url}`, null, {
        startTime: Date.now(),
        retryCount: 0,
        url,
        method: axiosConfig.method || 'GET',
      });
      return cachedResponse.data;
    }
  }

  let retries = 0;
  const meta: RequestMeta = {
    startTime: Date.now(),
    retryCount: 0,
    url,
    method: axiosConfig.method || 'GET',
  };

  while (true) {
    try {
      apiLogger.debug(`Making request to ${url}`, axiosConfig, meta);

      const response: AxiosResponse<T> = await axios(url, axiosConfig);

      meta.endTime = Date.now();
      apiLogger.debug(
        `Request to ${url} successful`,
        { status: response.status, headers: response.headers },
        meta,
      );

      // Cache successful GET responses
      if (isGetRequest) {
        const cacheKey = generateCacheKey(url, axiosConfig);
        apiCache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
        });
      }

      return response.data;
    } catch (error) {
      retries++;
      meta.retryCount = retries;

      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;

      // Determine if we should retry based on status code and retry count
      if (status && retryStatusCodes.includes(status) && retries < maxRetries) {
        const delayMs = retryDelay * Math.pow(2, retries - 1); // Exponential backoff

        apiLogger.warn(
          `Request to ${url} failed with status ${status}. Retrying (${retries}/${maxRetries}) after ${delayMs}ms`,
          meta,
        );

        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      // Log detailed error information
      meta.endTime = Date.now();
      apiLogger.error(`Request to ${url} failed after ${retries} retries`, error, meta);

      // Try to get data from cache even if expired as fallback
      if (isGetRequest) {
        const cacheKey = generateCacheKey(url, axiosConfig);
        const cachedResponse = apiCache.get(cacheKey);

        if (cachedResponse) {
          apiLogger.warn(`Using stale cached response for ${url} due to request failure`, meta);
          return cachedResponse.data;
        }
      }

      // If we have network errors in offline mode, throw a specific error
      if (
        axiosError.code === 'ECONNABORTED' ||
        !navigator.onLine ||
        axiosError.message.includes('Network Error')
      ) {
        throw new Error('Network unavailable. Please check your connection and try again.');
      }

      // Rethrow with more user-friendly message
      if (status === 404) {
        throw new Error(`The requested resource was not found (${url})`);
      } else if (status === 403) {
        throw new Error('You do not have permission to access this resource');
      } else if (status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else {
        throw new Error(`Request failed with status ${status || 'unknown'}: ${axiosError.message}`);
      }
    }
  }
};

/**
 * Clear API cache entries
 * @param urlPattern Optional regex pattern to match URLs to clear
 */
export const clearApiCache = (urlPattern?: RegExp): void => {
  if (!urlPattern) {
    apiCache.clear();
    return;
  }

  const keysToDelete: string[] = [];

  apiCache.forEach((_, key) => {
    const urlPart = key.split('-')[1]; // Extract URL from the key
    if (urlPattern.test(urlPart)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => apiCache.delete(key));
};

/**
 * Get API health status
 * @returns Promise resolving to boolean indicating if API is available
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await axios.get('/api/health', {
      timeout: 3000,
      headers: { 'Cache-Control': 'no-cache' },
    });
    return true;
  } catch (error) {
    return false;
  }
};
