import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { WatchlistItem } from '../entities/watchlist-item';
import { Watchlist } from '../entities/watchlist';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {
  private readonly endpoint = '/watchlists';

  constructor(private apiService: MockApiService) {}

  /**
   * Get all watchlists
   * @returns An Observable of Watchlist array
   */
  getWatchlists(): Observable<Watchlist[]> {
    return this.apiService.get<Watchlist[]>(this.endpoint);
  }

  /**
   * Get a specific watchlist by ID
   * @param id The watchlist ID
   * @returns An Observable of Watchlist
   */
  getWatchlistById(id: string): Observable<Watchlist> {
    return this.apiService.get<Watchlist>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new watchlist
   * @param watchlist The watchlist to create
   * @returns An Observable of the created Watchlist
   */
  createWatchlist(watchlist: Omit<Watchlist, 'id'>): Observable<Watchlist> {
    return this.apiService.post<Watchlist>(this.endpoint, watchlist);
  }

  /**
   * Update an existing watchlist
   * @param id The watchlist ID
   * @param watchlist The updated watchlist data
   * @returns An Observable of the updated Watchlist
   */
  updateWatchlist(id: string, watchlist: Partial<Watchlist>): Observable<Watchlist> {
    return this.apiService.put<Watchlist>(`${this.endpoint}/${id}`, watchlist);
  }

  /**
   * Delete a watchlist
   * @param id The watchlist ID
   * @returns An Observable of the operation result
   */
  deleteWatchlist(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Add a symbol to a watchlist
   * @param watchlistId The watchlist ID
   * @param symbol The symbol to add
   * @returns An Observable of the updated Watchlist
   */
  addSymbol(watchlistId: string, symbol: string): Observable<Watchlist> {
    return this.apiService.post<Watchlist>(`${this.endpoint}/${watchlistId}/symbols`, { symbol });
  }

  /**
   * Remove a symbol from a watchlist
   * @param watchlistId The watchlist ID
   * @param symbol The symbol to remove
   * @returns An Observable of the updated Watchlist
   */
  removeSymbol(watchlistId: string, symbol: string): Observable<Watchlist> {
    return this.apiService.delete<Watchlist>(`${this.endpoint}/${watchlistId}/symbols/${symbol}`);
  }
}
