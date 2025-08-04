import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, mergeMap, retryWhen } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Performs a GET request to the API
   * @param path The API endpoint path
   * @param params Optional query parameters
   * @returns An Observable of the response
   */
  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${path}`, { params })
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
              console.log(`GET Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Performs a POST request to the API
   * @param path The API endpoint path
   * @param body The request body
   * @returns An Observable of the response
   */
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${path}`, body)
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
              console.log(`POST Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Performs a PUT request to the API
   * @param path The API endpoint path
   * @param body The request body
   * @returns An Observable of the response
   */
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${path}`, body)
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
              console.log(`PUT Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Performs a DELETE request to the API
   * @param path The API endpoint path
   * @returns An Observable of the response
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${path}`)
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
              console.log(`Attempt ${retryAttempt}: retrying in ${retryAttempt * 1000}ms`);
              // Retry after 1s, 2s, then 3s
              return timer(retryAttempt * 1000);
            })
          )
        ),
        catchError(this.handleError)
      );
  }

  /**
   * Handles HTTP errors
   * @param error The HTTP error
   * @returns An Observable with the error
   */
  private handleError(error: any): Observable<never> {
    console.error('API error', error);
    return throwError(() => error);
  }
}
