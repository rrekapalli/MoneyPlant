import { HttpHandlerFn, HttpRequest } from '@angular/common/http';

/**
 * CSRF Interceptor Function
 * 
 * This interceptor function adds CSRF tokens to outgoing HTTP requests
 * that require CSRF protection.
 * 
 * @param req The outgoing request
 * @param next The next handler in the chain
 * @returns The HTTP response
 */
export function csrfInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn) {
  // Only protect state-changing methods
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!protectedMethods.includes(req.method)) {
    return next(req);
  }

  // Don't protect requests to other domains
  try {
    const requestUrl = new URL(req.url, window.location.origin);
    if (requestUrl.origin !== window.location.origin) {
      return next(req);
    }
  } catch (e) {
    // If URL parsing fails, assume it's a relative URL and protect it
  }

  // Get CSRF token from cookie
  const token = getCsrfTokenFromCookie();
  
  if (token) {
    // Clone the request and add the CSRF token header
    const modifiedReq = req.clone({
      setHeaders: {
        'X-CSRF-Token': token
      }
    });
    return next(modifiedReq);
  }
  
  // If no token is found, proceed without protection
  return next(req);
}

/**
 * Get the CSRF token from cookies
 * 
 * @returns The CSRF token or null if not found
 */
function getCsrfTokenFromCookie(): string | null {
  const cookieName = 'XSRF-TOKEN';
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
}