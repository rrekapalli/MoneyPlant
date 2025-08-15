import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, mergeMap, retryWhen } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../security/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EnginesApiService {
  // Engines module runs on port 8081 with context path /engines
  private enginesApiUrl = environment.enginesApiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Gets the HTTP headers with authentication token
   * @returns HttpHeaders with Authorization header if token exists
   */
  private getHeaders(): HttpHeaders {
    try {
      const token = this.authService?.getToken();
      const headers = new HttpHeaders();
      
      if (token) {
        return headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    } catch (error) {
      console.warn('Error getting auth token, proceeding without authentication:', error);
      return new HttpHeaders();
    }
  }

  /**
   * Performs a GET request to the engines API
   * @param path The API endpoint path
   * @param params Optional query parameters
   * @returns An Observable of the response
   */
  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${this.enginesApiUrl}${path}`, { 
      params,
      headers: this.getHeaders()
    })
      .pipe(
        retryWhen(errors => 
          errors.pipe(
            // Retry up to 3 times
            mergeMap((error, i) => {
              const retryAttempt = i + 1;
              // If we've tried 3 times and still failing, throw the error
              if (retryAttempt > 3) {
                return throwError(() => error);
              }
              console.log(`Engines API GET Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Performs a POST request to the engines API
   * @param path The API endpoint path
   * @param body The request body
   * @returns An Observable of the response
   */
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.enginesApiUrl}${path}`, body, {
      headers: this.getHeaders()
    })
      .pipe(
        retryWhen(errors => 
          errors.pipe(
            // Retry up to 3 times
            mergeMap((error, i) => {
              const retryAttempt = i + 1;
              // If we've tried 3 times and still failing, throw the error
              if (retryAttempt > 3) {
                return throwError(() => error);
              }
              console.log(`Engines API POST Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Performs a PUT request to the engines API
   * @param path The API endpoint path
   * @param body The request body
   * @returns An Observable of the response
   */
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.enginesApiUrl}${path}`, body, {
      headers: this.getHeaders()
    })
      .pipe(
        retryWhen(errors => 
          errors.pipe(
            // Retry up to 3 times
            mergeMap((error, i) => {
              const retryAttempt = i + 1;
              // If we've tried 3 times and still failing, throw the error
              if (retryAttempt > 3) {
                return throwError(() => error);
              }
              console.log(`Engines API PUT Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Performs a DELETE request to the engines API
   * @param path The API endpoint path
   * @returns An Observable of the response
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.enginesApiUrl}${path}`, {
      headers: this.getHeaders()
    })
      .pipe(
        retryWhen(errors => 
          errors.pipe(
            // Retry up to 3 times
            mergeMap((error, i) => {
              const retryAttempt = i + 1;
              // If we've tried 3 times and still failing, throw the error
              if (retryAttempt > 3) {
                return throwError(() => error);
              }
              console.log(`Engines API DELETE Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Performs a PATCH request to the engines API
   * @param path The API endpoint path
   * @param body The request body
   * @returns An Observable of the response
   */
  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.enginesApiUrl}${path}`, body, {
      headers: this.getHeaders()
    })
      .pipe(
        retryWhen(errors => 
          errors.pipe(
            // Retry up to 3 times
            mergeMap((error, i) => {
              const retryAttempt = i + 1;
              // If we've tried 3 times and still failing, throw the error
              if (retryAttempt > 3) {
                return throwError(() => error);
              }
              console.log(`Engines API PATCH Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Handles errors from HTTP requests
   * @param error The error to handle
   * @returns An Observable that throws the error
   */
  private handleError(error: any): Observable<never> {
    console.error('Engines API error:', error);
    
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else if (error.status) {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.statusText}`;
      if (error.error && error.error.message) {
        errorMessage += ` - ${error.error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
