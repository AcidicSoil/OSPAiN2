/**
 * mcp-servers/shared/security.ts
 *
 * Security utilities for MCP servers, including rate limiting,
 * IP restrictions, and audit logging.
 */

import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

// Types
export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests in the window
  message?: string; // Message to return when rate limit is exceeded
  statusCode?: number; // Status code to return when rate limit is exceeded
  skipSuccessfulRequests?: boolean; // Whether to skip counting successful requests
}

export interface IPRestrictionOptions {
  allowedIPs?: string[]; // List of allowed IPs
  blockedIPs?: string[]; // List of blocked IPs
  message?: string; // Message to return when IP is restricted
  statusCode?: number; // Status code to return when IP is restricted
}

export interface AuditOptions {
  logDirectory: string; // Directory to store audit logs
  logFilename?: string; // Filename for audit logs (default: audit.log)
  logFormat?: string; // Format for audit log entries
  events?: string[]; // Events to audit
}

// Memory store for rate limiting
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limits
const rateLimitStore: RateLimitStore = {};

/**
 * Rate limiting middleware
 *
 * Limits the number of requests from a specific IP within a time window
 */
export function rateLimit(options: RateLimitOptions) {
  const windowMs = options.windowMs || 60000; // Default: 1 minute
  const maxRequests = options.maxRequests || 100; // Default: 100 requests per minute
  const message =
    options.message || "Too many requests, please try again later.";
  const statusCode = options.statusCode || 429; // Default: 429 Too Many Requests
  const skipSuccessfulRequests = options.skipSuccessfulRequests || false;

  // Clean up expired entries every minute
  setInterval(() => {
    const now = Date.now();
    Object.keys(rateLimitStore).forEach((key) => {
      if (rateLimitStore[key].resetTime <= now) {
        delete rateLimitStore[key];
      }
    });
  }, 60000);

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    // Initialize rate limit entry if not exists
    if (!rateLimitStore[key]) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Reset count if window has expired
    if (rateLimitStore[key].resetTime <= now) {
      rateLimitStore[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    rateLimitStore[key].count++;

    // Set rate limit headers
    const remaining = Math.max(0, maxRequests - rateLimitStore[key].count);
    const reset = Math.ceil((rateLimitStore[key].resetTime - now) / 1000);

    res.setHeader("X-RateLimit-Limit", maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", remaining.toString());
    res.setHeader("X-RateLimit-Reset", reset.toString());

    // Check if rate limit exceeded
    if (rateLimitStore[key].count > maxRequests) {
      return res.status(statusCode).json({
        success: false,
        error: message,
      });
    }

    // Skip counting successful requests if enabled
    if (skipSuccessfulRequests) {
      const originalEnd = res.end;
      res.end = function (
        this: Response,
        chunk?: any,
        encoding?: any,
        callback?: () => void
      ): Response {
        if (res.statusCode < 400) {
          rateLimitStore[key].count--;
        }
        return originalEnd.call(this, chunk, encoding, callback);
      } as typeof res.end;
    }

    next();
  };
}

/**
 * IP restriction middleware
 *
 * Restricts access to specific IPs or blocks specific IPs
 */
export function ipRestriction(options: IPRestrictionOptions) {
  const allowedIPs = options.allowedIPs || [];
  const blockedIPs = options.blockedIPs || [];
  const message = options.message || "IP address is restricted.";
  const statusCode = options.statusCode || 403; // Default: 403 Forbidden

  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;

    // Check if IP is blocked
    if (blockedIPs.length > 0 && blockedIPs.includes(ip)) {
      return res.status(statusCode).json({
        success: false,
        error: message,
      });
    }

    // Check if allowed IPs are specified and the IP is not allowed
    if (allowedIPs.length > 0 && !allowedIPs.includes(ip)) {
      return res.status(statusCode).json({
        success: false,
        error: message,
      });
    }

    next();
  };
}

/**
 * Audit logging middleware
 *
 * Logs security-relevant events to a file
 */
export function auditLog(options: AuditOptions) {
  const logDirectory = options.logDirectory;
  const logFilename = options.logFilename || "audit.log";
  const logFormat =
    options.logFormat ||
    "${timestamp} [${ip}] ${method} ${url} ${statusCode} ${responseTime}ms";
  const events = options.events || ["request", "error", "auth"];

  // Ensure log directory exists
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
  }

  // Ensure we have a valid log path
  const logPath = path.join(logDirectory, logFilename || "audit.log");

  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Log request if enabled
    if (events.includes("request")) {
      const timestamp = new Date().toISOString();
      const ip = req.ip || "0.0.0.0"; // Provide default value
      const method = req.method;
      const url = req.originalUrl;
      const userAgent = req.get("user-agent") || "unknown";

      // Prepare log entry
      const logData = {
        timestamp,
        ip,
        method,
        url,
        userAgent,
        headers: req.headers,
        params: req.params,
        query: req.query,
        body: req.body,
        event: "request",
      };

      // Append to log file (fix by ensuring logPath is a string)
      if (logPath) {
        fs.appendFileSync(logPath, JSON.stringify(logData) + "\n");
      }
    }

    // Capture response data
    const originalEnd = res.end;
    res.end = function (
      this: Response,
      chunk?: any,
      encoding?: any,
      callback?: () => void
    ): Response {
      res.end = originalEnd;
      const result = res.end(chunk, encoding, callback);

      const responseTime = Date.now() - startTime;
      const timestamp = new Date().toISOString();
      const ip = req.ip || "0.0.0.0"; // Provide default value
      const method = req.method;
      const url = req.originalUrl || ""; // Provide default value
      const statusCode = res.statusCode;
      const contentLength = res.get("content-length") || "0";

      // Log error if enabled and status code is 4xx or 5xx
      if (events.includes("error") && statusCode >= 400) {
        const logData = {
          timestamp,
          ip,
          method,
          url,
          statusCode,
          responseTime,
          contentLength,
          event: "error",
        };

        // Append to log file (fix by ensuring logPath is a string)
        if (logPath) {
          fs.appendFileSync(logPath, JSON.stringify(logData) + "\n");
        }
      }

      // Create formatted log entry for request completion
      let logEntry = "";
      if (logFormat) {
        // Using a safer approach with regex replacements
        logEntry = logFormat
          .replace(/\$\{timestamp\}/g, timestamp)
          .replace(/\$\{ip\}/g, ip)
          .replace(/\$\{method\}/g, method || "")
          .replace(/\$\{url\}/g, url)
          .replace(/\$\{statusCode\}/g, statusCode.toString())
          .replace(/\$\{responseTime\}/g, responseTime.toString())
          .replace(/\$\{contentLength\}/g, contentLength);
      }

      console.log(logEntry);

      return result;
    } as typeof res.end;

    next();
  };
}

/**
 * Validate input parameters against expected schema
 */
export function validateInput(schema: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    const params = {
      ...req.params,
      ...req.query,
      ...req.body,
    };

    // Simple validation example
    // In production, you would use a proper schema validation library
    const errors: string[] = [];

    Object.keys(schema).forEach((key) => {
      const field = schema[key];

      // Check if required field is present
      if (
        field.required &&
        (params[key] === undefined || params[key] === null)
      ) {
        errors.push(`Field '${key}' is required`);
        return;
      }

      // Skip further validation if field is not present and not required
      if (params[key] === undefined || params[key] === null) {
        return;
      }

      // Check type
      if (field.type && typeof params[key] !== field.type) {
        errors.push(`Field '${key}' must be of type ${field.type}`);
      }

      // Check array
      if (field.type === "array" && !Array.isArray(params[key])) {
        errors.push(`Field '${key}' must be an array`);
      }

      // Check minimum value
      if (field.min !== undefined && params[key] < field.min) {
        errors.push(`Field '${key}' must be at least ${field.min}`);
      }

      // Check maximum value
      if (field.max !== undefined && params[key] > field.max) {
        errors.push(`Field '${key}' must be at most ${field.max}`);
      }

      // Check regex pattern
      if (field.pattern && !new RegExp(field.pattern).test(params[key])) {
        errors.push(`Field '${key}' must match pattern ${field.pattern}`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        errors,
      });
    }

    next();
  };
}

/**
 * Security middleware collection for MCP servers
 */
export function securityMiddleware(options: {
  rateLimit?: RateLimitOptions;
  ipRestriction?: IPRestrictionOptions;
  audit?: AuditOptions;
}) {
  const middleware = [];

  if (options.rateLimit) {
    middleware.push(rateLimit(options.rateLimit));
  }

  if (options.ipRestriction) {
    middleware.push(ipRestriction(options.ipRestriction));
  }

  if (options.audit) {
    middleware.push(auditLog(options.audit));
  }

  return middleware;
}
