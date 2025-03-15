"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkApiHealth = exports.clearApiCache = exports.fetchWithRetry = exports.apiLogger = exports.LogLevel = void 0;
const axios_1 = __importDefault(require("axios"));
// Configure default logging levels
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["DEBUG"] = "debug";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/**
 * Enhanced logger with additional context for API operations
 */
exports.apiLogger = {
    error: (message, error, meta) => {
        console.error(`[API ERROR] ${message}`, meta
            ? `\nEndpoint: ${meta.method} ${meta.url}\nDuration: ${getDuration(meta)}ms\nRetries: ${meta.retryCount}`
            : '', error ? `\nDetails: ${error.message}\n${error.stack}` : '');
    },
    warn: (message, meta) => {
        console.warn(`[API WARNING] ${message}`, meta
            ? `\nEndpoint: ${meta.method} ${meta.url}\nDuration: ${getDuration(meta)}ms\nRetries: ${meta.retryCount}`
            : '');
    },
    info: (message, meta) => {
        if (process.env.NODE_ENV !== 'production') {
            console.info(`[API INFO] ${message}`, meta
                ? `\nEndpoint: ${meta.method} ${meta.url}\nDuration: ${getDuration(meta)}ms\nRetries: ${meta.retryCount}`
                : '');
        }
    },
    debug: (message, data, meta) => {
        if (process.env.NODE_ENV !== 'production' && process.env.REACT_APP_DEBUG === 'true') {
            console.debug(`[API DEBUG] ${message}`, meta
                ? `\nEndpoint: ${meta.method} ${meta.url}\nDuration: ${getDuration(meta)}ms\nRetries: ${meta.retryCount}`
                : '', data ? '\nData:' : '', data || '');
        }
    },
};
// Helper to calculate request duration
const getDuration = (meta) => {
    if (!meta.endTime)
        return 0;
    return meta.endTime - meta.startTime;
};
// Default configuration for retry behavior
const defaultRetryConfig = {
    maxRetries: 3,
    retryDelay: 1000,
    retryStatusCodes: [408, 429, 500, 502, 503, 504],
    cacheDuration: 5 * 60 * 1000, // 5 minutes
};
const apiCache = new Map();
/**
 * Generate a cache key from request details
 */
const generateCacheKey = (url, config) => {
    const params = config?.params ? JSON.stringify(config.params) : '';
    return `${config?.method || 'get'}-${url}-${params}`;
};
/**
 * Check if a cached response is still valid
 */
const isCacheValid = (entry, cacheDuration) => {
    return Date.now() - entry.timestamp < cacheDuration;
};
/**
 * Fetch data with retry logic, caching, and comprehensive error handling
 */
const fetchWithRetry = async (url, config) => {
    const finalConfig = { ...defaultRetryConfig, ...config };
    const { maxRetries, retryDelay, retryStatusCodes, cacheDuration, ...axiosConfig } = finalConfig;
    // Only use cache for GET requests
    const isGetRequest = !axiosConfig.method || axiosConfig.method.toLowerCase() === 'get';
    if (isGetRequest) {
        const cacheKey = generateCacheKey(url, axiosConfig);
        const cachedResponse = apiCache.get(cacheKey);
        // Return cached response if valid and we're not forcing a refresh
        if (cachedResponse &&
            isCacheValid(cachedResponse, cacheDuration || 0) &&
            !axiosConfig.headers?.['x-refresh']) {
            exports.apiLogger.debug(`Using cached response for ${url}`, null, {
                startTime: Date.now(),
                retryCount: 0,
                url,
                method: axiosConfig.method || 'GET',
            });
            return cachedResponse.data;
        }
    }
    let retries = 0;
    const meta = {
        startTime: Date.now(),
        retryCount: 0,
        url,
        method: axiosConfig.method || 'GET',
    };
    while (true) {
        try {
            exports.apiLogger.debug(`Making request to ${url}`, axiosConfig, meta);
            const response = await (0, axios_1.default)(url, axiosConfig);
            meta.endTime = Date.now();
            exports.apiLogger.debug(`Request to ${url} successful`, { status: response.status, headers: response.headers }, meta);
            // Cache successful GET responses
            if (isGetRequest) {
                const cacheKey = generateCacheKey(url, axiosConfig);
                apiCache.set(cacheKey, {
                    data: response.data,
                    timestamp: Date.now(),
                });
            }
            return response.data;
        }
        catch (error) {
            retries++;
            meta.retryCount = retries;
            const axiosError = error;
            const status = axiosError.response?.status;
            // Determine if we should retry based on status code and retry count
            if (status && retryStatusCodes.includes(status) && retries < maxRetries) {
                const delayMs = retryDelay * Math.pow(2, retries - 1); // Exponential backoff
                exports.apiLogger.warn(`Request to ${url} failed with status ${status}. Retrying (${retries}/${maxRetries}) after ${delayMs}ms`, meta);
                await new Promise((resolve) => setTimeout(resolve, delayMs));
                continue;
            }
            // Log detailed error information
            meta.endTime = Date.now();
            exports.apiLogger.error(`Request to ${url} failed after ${retries} retries`, error, meta);
            // Try to get data from cache even if expired as fallback
            if (isGetRequest) {
                const cacheKey = generateCacheKey(url, axiosConfig);
                const cachedResponse = apiCache.get(cacheKey);
                if (cachedResponse) {
                    exports.apiLogger.warn(`Using stale cached response for ${url} due to request failure`, meta);
                    return cachedResponse.data;
                }
            }
            // If we have network errors in offline mode, throw a specific error
            if (axiosError.code === 'ECONNABORTED' ||
                !navigator.onLine ||
                axiosError.message.includes('Network Error')) {
                throw new Error('Network unavailable. Please check your connection and try again.');
            }
            // Rethrow with more user-friendly message
            if (status === 404) {
                throw new Error(`The requested resource was not found (${url})`);
            }
            else if (status === 403) {
                throw new Error('You do not have permission to access this resource');
            }
            else if (status === 401) {
                throw new Error('Authentication required. Please log in again.');
            }
            else {
                throw new Error(`Request failed with status ${status || 'unknown'}: ${axiosError.message}`);
            }
        }
    }
};
exports.fetchWithRetry = fetchWithRetry;
/**
 * Clear API cache entries
 * @param urlPattern Optional regex pattern to match URLs to clear
 */
const clearApiCache = (urlPattern) => {
    if (!urlPattern) {
        apiCache.clear();
        return;
    }
    const keysToDelete = [];
    apiCache.forEach((_, key) => {
        const urlPart = key.split('-')[1]; // Extract URL from the key
        if (urlPattern.test(urlPart)) {
            keysToDelete.push(key);
        }
    });
    keysToDelete.forEach((key) => apiCache.delete(key));
};
exports.clearApiCache = clearApiCache;
/**
 * Get API health status
 * @returns Promise resolving to boolean indicating if API is available
 */
const checkApiHealth = async () => {
    try {
        await axios_1.default.get('/api/health', {
            timeout: 3000,
            headers: { 'Cache-Control': 'no-cache' },
        });
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.checkApiHealth = checkApiHealth;
//# sourceMappingURL=apiUtils.js.map