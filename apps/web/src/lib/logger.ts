/**
 * Production-ready logging utility for consistent, sanitized logging
 * Controls log levels and sanitizes sensitive information based on environment
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  modulePrefix?: string;
  sanitizeKeys?: string[];
}

// Define proper types for objects that can be logged
type LoggableData = Record<string, unknown> | unknown[] | null | undefined;

class Logger {
  private static instance: Logger;
  private isDevelopment: boolean;
  private defaultSanitizeKeys = [
    'password', 'token', 'secret', 'authorization', 'key', 'auth', 
    'session', 'jwt', 'email', 'phone', 'address', 'ip', 'creditcard'
  ];

  private constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Sanitizes an object by masking sensitive fields
   */
  private sanitizeObject(obj: LoggableData, keysToSanitize: string[] = []): LoggableData {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Combine default and custom keys to sanitize
    const allKeysToSanitize = [...this.defaultSanitizeKeys, ...keysToSanitize];
    
    // Create a deep copy to avoid modifying the original
    const result = Array.isArray(obj) ? [...obj] : { ...obj } as Record<string, unknown>;
    
    // Handle arrays differently from objects
    if (Array.isArray(result)) {
      return result.map(item => this.sanitizeObject(item as LoggableData, keysToSanitize));
    }
    
    // Now we know result is a Record<string, unknown>
    const objectResult = result as Record<string, unknown>;
    
    for (const key in objectResult) {
      // Check if this key should be sanitized (case insensitive check)
      const shouldSanitize = allKeysToSanitize.some(k => 
        key.toLowerCase().includes(k.toLowerCase())
      );
      
      if (shouldSanitize && objectResult[key]) {
        // Mask the value based on its type
        if (typeof objectResult[key] === 'string') {
          const stringValue = objectResult[key] as string;
          objectResult[key] = stringValue.length > 8 
            ? `${stringValue.substring(0, 3)}***${stringValue.substring(stringValue.length - 3)}`
            : '******';
        } else if (typeof objectResult[key] === 'number') {
          objectResult[key] = '******';
        } else if (typeof objectResult[key] === 'boolean') {
          // Don't mask booleans
          objectResult[key] = objectResult[key];
        } else {
          objectResult[key] = '[REDACTED]';
        }
      } else if (typeof objectResult[key] === 'object' && objectResult[key] !== null) {
        // Recursively sanitize nested objects
        objectResult[key] = this.sanitizeObject(objectResult[key] as LoggableData, keysToSanitize);
      }
    }
    
    return objectResult;
  }

  /**
   * Sanitizes error objects to ensure no sensitive data is logged
   */
  private formatError(error: unknown): Record<string, unknown> {
    // Handle standard Error objects
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        // For specific error types with additional properties
        ...('cause' in error ? { cause: this.formatError((error as { cause: unknown }).cause) } : {}),
      };
    }
    
    // Handle non-Error objects
    if (typeof error === 'object' && error !== null) {
      return this.sanitizeObject(error as LoggableData) as Record<string, unknown>;
    }
    
    return { value: error };
  }

  /**
   * Core logging method that handles sanitization and log level control
   */
  private log(level: LogLevel, message: string, data?: LoggableData, options?: LoggerOptions): void {
    // Skip debug logs in production
    if (level === 'debug' && !this.isDevelopment) return;
    
    const modulePrefix = options?.modulePrefix ? `[${options.modulePrefix}] ` : '';
    const sanitizedData = data ? this.sanitizeObject(data, options?.sanitizeKeys) : undefined;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message: `${modulePrefix}${message}`,
      ...(sanitizedData !== undefined ? { data: sanitizedData } : {})
    };
    
    switch (level) {
      case 'debug':
        console.debug(logEntry);
        break;
      case 'info':
        console.info(logEntry);
        break;
      case 'warn':
        console.warn(logEntry);
        break;
      case 'error':
        console.error(logEntry);
        break;
    }
  }

  /**
   * Logs debug information (only in development)
   */
  public debug(message: string, data?: LoggableData, options?: LoggerOptions): void {
    this.log('debug', message, data, options);
  }

  /**
   * Logs general information
   */
  public info(message: string, data?: LoggableData, options?: LoggerOptions): void {
    this.log('info', message, data, options);
  }

  /**
   * Logs warnings
   */
  public warn(message: string, data?: LoggableData, options?: LoggerOptions): void {
    this.log('warn', message, data, options);
  }

  /**
   * Logs errors with special error object handling
   */
  public error(message: string, error?: unknown, options?: LoggerOptions): void {
    if (error) {
      this.log('error', message, this.formatError(error), options);
    } else {
      this.log('error', message, undefined, options);
    }
  }

  /**
   * Create a logger instance for a specific module/component
   * @param moduleName - Name of the module/component
   * @returns Logger instance with module prefix
   */
  public static createModuleLogger(moduleName: string) {
    return {
      debug: (message: string, data?: LoggableData) => {
        Logger.getInstance().debug(`[${moduleName}] ${message}`, data);
      },
      info: (message: string, data?: LoggableData) => {
        Logger.getInstance().info(`[${moduleName}] ${message}`, data);
      },
      warn: (message: string, data?: LoggableData) => {
        Logger.getInstance().warn(`[${moduleName}] ${message}`, data);
      },
      error: (message: string, data?: LoggableData, options?: LoggerOptions) => {
        Logger.getInstance().error(`[${moduleName}] ${message}`, data, options);
      }
    };
  }
}

// Export a singleton instance
export const logger = Logger.getInstance(); 