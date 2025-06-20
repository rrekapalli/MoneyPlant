import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggingService } from '../logging.service';

/**
 * CSRF Protection Service
 * 
 * This service provides methods for protecting against Cross-Site Request Forgery (CSRF) attacks.
 * It manages CSRF tokens and ensures they are included in HTTP requests.
 */
@Injectable({
  providedIn: 'root'
})
export class CSRFService {
  private csrfToken: string | null = null;
  private readonly tokenHeaderName = 'X-CSRF-Token';
  private readonly cookieName = 'XSRF-TOKEN';

  constructor(
    private http: HttpClient,
    private loggingService: LoggingService
  ) {}

  /**
   * Initialize CSRF protection
   * This should be called during application startup
   * 
   * @param tokenUrl The URL to fetch the CSRF token from
   * @returns An Observable that resolves when the token is fetched
   */
  initialize(tokenUrl: string = '/api/csrf-token'): Observable<boolean> {
    return this.fetchToken(tokenUrl).pipe(
      map(() => true),
      catchError(error => {
        this.loggingService.error(
          'Failed to initialize CSRF protection',
          error,
          'CSRFService'
        );
        return of(false);
      })
    );
  }

  /**
   * Fetch a new CSRF token from the server
   * 
   * @param tokenUrl The URL to fetch the token from
   * @returns An Observable that resolves when the token is fetched
   */
  fetchToken(tokenUrl: string): Observable<string> {
    return this.http.get<{ token: string }>(tokenUrl).pipe(
      tap(response => {
        this.csrfToken = response.token;
        this.loggingService.info(
          'CSRF token fetched successfully',
          null,
          'CSRFService'
        );
      }),
      map(response => response.token),
      catchError(error => {
        this.loggingService.error(
          'Failed to fetch CSRF token',
          error,
          'CSRFService'
        );
        return of('');
      })
    );
  }

  /**
   * Get the current CSRF token
   * 
   * @returns The current CSRF token or null if not initialized
   */
  getToken(): string | null {
    return this.csrfToken;
  }

  /**
   * Get HTTP headers with the CSRF token
   * 
   * @param headers Optional existing headers to add the token to
   * @returns HTTP headers with the CSRF token
   */
  getTokenHeaders(headers?: HttpHeaders): HttpHeaders {
    if (!this.csrfToken) {
      this.loggingService.warn(
        'Attempted to get CSRF headers but no token is available',
        null,
        'CSRFService'
      );
      return headers || new HttpHeaders();
    }

    const newHeaders = headers || new HttpHeaders();
    return newHeaders.set(this.tokenHeaderName, this.csrfToken);
  }

  /**
   * Extract the CSRF token from cookies
   * This is useful when the server sets the token as a cookie
   * 
   * @returns The extracted token or null if not found
   */
  extractTokenFromCookies(): string | null {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.cookieName) {
        this.csrfToken = decodeURIComponent(value);
        return this.csrfToken;
      }
    }
    return null;
  }

  /**
   * Validate if a request should include CSRF protection
   * 
   * @param method The HTTP method
   * @param url The request URL
   * @returns True if the request should be protected
   */
  shouldProtectRequest(method: string, url: string): boolean {
    // Only protect state-changing methods
    const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (!protectedMethods.includes(method.toUpperCase())) {
      return false;
    }

    // Don't protect requests to other domains
    try {
      const requestUrl = new URL(url, window.location.origin);
      return requestUrl.origin === window.location.origin;
    } catch (e) {
      // If URL parsing fails, assume it's a relative URL and protect it
      return true;
    }
  }
}
