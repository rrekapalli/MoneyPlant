import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CSRFService } from './csrf.service';

/**
 * CSRF Interceptor
 * 
 * This interceptor automatically adds CSRF tokens to outgoing HTTP requests
 * that require CSRF protection.
 */
@Injectable()
export class CSRFInterceptor implements HttpInterceptor {
  constructor(private csrfService: CSRFService) {}

  /**
   * Intercept HTTP requests and add CSRF token if needed
   * 
   * @param request The outgoing request
   * @param next The next interceptor in the chain
   * @returns An Observable of the HTTP event stream
   */
  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Check if the request should be protected
    if (this.csrfService.shouldProtectRequest(request.method, request.url)) {
      // Get the CSRF token
      const token = this.csrfService.getToken();
      
      // If we have a token, add it to the request
      if (token) {
        request = request.clone({
          setHeaders: {
            'X-CSRF-Token': token
          }
        });
      }
    }
    
    // Pass the request to the next handler
    return next.handle(request);
  }
}