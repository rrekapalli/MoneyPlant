import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LoginResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: any;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    // Check for token in URL parameters (OAuth2 callback)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth2 error:', error);
      this.logout();
      return;
    }

    if (token) {
      // Store token and clear URL parameters
      this.setToken(token);
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Validate token with backend
      this.validateToken(token).subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.logout();
        }
      });
    } else {
      // Check for existing token
      const existingToken = this.getToken();
      if (existingToken) {
        // Validate existing token with backend
        this.validateToken(existingToken).subscribe({
          next: (user) => {
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
          },
          error: () => {
            this.logout();
          }
        });
      }
    }
  }

  private validateToken(token: string): Observable<AuthUser> {
    return this.http.get<AuthUser>('/api/auth/validate', {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    });
  }

  loginWithEmail(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/email-login', { email })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setToken(response.token);
            if (response.user) {
              this.currentUserSubject.next(response.user);
              this.isAuthenticatedSubject.next(true);
            }
          }
        }),
        catchError(error => {
          console.error('Login error:', error);
          // Handle different error response formats
          let errorMessage = 'Login failed. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          return of({
            success: false,
            message: errorMessage
          });
        })
      );
  }

  loginWithOAuth(provider: 'google' | 'microsoft'): void {
    const oauthUrl = `/oauth2/authorization/${provider}`;
    window.location.href = oauthUrl;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  isLoggedIn(): boolean {
    // Check email authentication
    const result = this.isAuthenticatedSubject.value;
    console.log('AuthService.isLoggedIn() - result:', result);
    return result;
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  // Handle OAuth callback
  handleOAuthCallback(): Observable<AuthUser> {
    return this.http.get<AuthUser>('/api/auth/oauth-callback')
      .pipe(
        tap(user => {
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          this.router.navigate(['/dashboard']);
        })
      );
  }

  // Refresh token
  refreshToken(): Observable<LoginResponse> {
    const token = this.getToken();
    if (!token) {
      return of({ success: false, message: 'No token available' });
    }

    return this.http.post<LoginResponse>('/api/auth/refresh', { token })
      .pipe(
        tap(response => {
          if (response.success && response.token) {
            this.setToken(response.token);
          }
        })
      );
  }
} 