import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LoggingService } from '../logging.service';

/**
 * API Security Service
 * 
 * This service provides methods for securing API endpoints and auditing API calls.
 * It includes input validation, rate limiting, and logging of API activity.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiSecurityService {
  // Track API call counts for rate limiting
  private apiCallCounts: Record<string, { count: number; timestamp: number }> = {};
  
  // Default rate limits
  private readonly defaultRateLimit = 100; // calls per minute
  private readonly rateLimitWindow = 60000; // 1 minute in milliseconds

  // Custom rate limits for specific endpoints
  private readonly endpointRateLimits: Record<string, number> = {
    '/api/auth': 10,        // Limit auth attempts
    '/api/user/password': 5 // Limit password change attempts
  };

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService
  ) {}

  /**
   * Make a secure API call with input validation, rate limiting, and auditing
   * 
   * @param method The HTTP method
   * @param url The API endpoint URL
   * @param data The request body (for POST, PUT, PATCH)
   * @param options Additional HTTP options
   * @returns An Observable of the API response
   */
  secureApiCall<T>(
    method: string,
    url: string,
    data?: any,
    options: {
      headers?: HttpHeaders;
      params?: HttpParams;
      responseType?: any;
      withCredentials?: boolean;
    } = {}
  ): Observable<T> {
    // Check rate limiting
    if (!this.checkRateLimit(url)) {
      this.loggingService.warn(
        `Rate limit exceeded for ${url}`,
        { method },
        'ApiSecurityService'
      );
      return throwError(() => new Error('Rate limit exceeded'));
    }

    // Validate input data
    if (data && !this.validateInput(data)) {
      this.loggingService.warn(
        `Invalid input data for ${url}`,
        { method, data },
        'ApiSecurityService'
      );
      return throwError(() => new Error('Invalid input data'));
    }

    // Log the API call
    this.loggingService.info(
      `API call: ${method} ${url}`,
      { method, url },
      'ApiSecurityService'
    );

    // Make the API call with the appropriate HTTP method
    let request: Observable<T>;
    
    switch (method.toUpperCase()) {
      case 'GET':
        request = this.http.get<T>(url, options);
        break;
      case 'POST':
        request = this.http.post<T>(url, data, options);
        break;
      case 'PUT':
        request = this.http.put<T>(url, data, options);
        break;
      case 'DELETE':
        request = this.http.delete<T>(url, options);
        break;
      case 'PATCH':
        request = this.http.patch<T>(url, data, options);
        break;
      default:
        return throwError(() => new Error(`Unsupported HTTP method: ${method}`));
    }

    // Add auditing and error handling
    return request.pipe(
      tap(response => {
        this.loggingService.debug(
          `API response: ${method} ${url}`,
          { status: 'success' },
          'ApiSecurityService'
        );
      }),
      catchError(error => {
        this.loggingService.error(
          `API error: ${method} ${url}`,
          { error, status: error.status },
          'ApiSecurityService'
        );
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if a request is within rate limits
   * 
   * @param url The API endpoint URL
   * @returns True if the request is within rate limits
   */
  private checkRateLimit(url: string): boolean {
    const now = Date.now();
    const endpoint = this.getEndpointPath(url);
    
    // Get the rate limit for this endpoint
    const rateLimit = this.endpointRateLimits[endpoint] || this.defaultRateLimit;
    
    // Initialize or update the call count
    if (!this.apiCallCounts[endpoint]) {
      this.apiCallCounts[endpoint] = { count: 1, timestamp: now };
      return true;
    }
    
    const record = this.apiCallCounts[endpoint];
    
    // Reset the counter if the window has passed
    if (now - record.timestamp > this.rateLimitWindow) {
      record.count = 1;
      record.timestamp = now;
      return true;
    }
    
    // Check if we're over the limit
    if (record.count >= rateLimit) {
      return false;
    }
    
    // Increment the counter
    record.count++;
    return true;
  }

  /**
   * Extract the endpoint path from a URL
   * 
   * @param url The full URL
   * @returns The endpoint path
   */
  private getEndpointPath(url: string): string {
    try {
      const parsedUrl = new URL(url, window.location.origin);
      return parsedUrl.pathname;
    } catch (e) {
      // If URL parsing fails, return the URL as is
      return url;
    }
  }

  /**
   * Validate input data to prevent injection attacks
   * 
   * @param data The input data to validate
   * @returns True if the data is valid
   */
  private validateInput(data: any): boolean {
    // Basic validation - can be extended with more specific rules
    if (data === null || data === undefined) {
      return false;
    }
    
    if (typeof data === 'string') {
      // Check for common injection patterns
      const dangerousPatterns = [
        /(<script>|<\/script>)/i,  // Script tags
        /(javascript:)/i,          // JavaScript protocol
        /(\b(union|select|insert|update|delete|drop)\b.*\b(from|into|table)\b)/i // SQL injection
      ];
      
      return !dangerousPatterns.some(pattern => pattern.test(data));
    }
    
    if (typeof data === 'object') {
      // Recursively validate object properties
      return Object.values(data).every(value => this.validateInput(value));
    }
    
    // Numbers, booleans, etc. are considered safe
    return true;
  }

  /**
   * Sanitize URL parameters to prevent injection
   * 
   * @param params The URL parameters to sanitize
   * @returns Sanitized URL parameters
   */
  sanitizeUrlParams(params: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(params)) {
      // Remove potentially dangerous characters
      sanitized[key] = value.replace(/[<>"'&]/g, '');
    }
    
    return sanitized;
  }
}