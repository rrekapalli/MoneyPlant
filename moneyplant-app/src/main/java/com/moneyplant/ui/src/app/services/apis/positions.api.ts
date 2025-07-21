import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Position } from '../entities/position';
import { PositionsSummary } from '../entities/positions-summary';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class PositionsService {
  private readonly endpoint = '/positions';

  constructor(private apiService: MockApiService) {}

  /**
   * Get all positions
   * @returns An Observable of Position array
   */
  getPositions(): Observable<Position[]> {
    return this.apiService.get<Position[]>(this.endpoint);
  }

  /**
   * Get a specific position by ID
   * @param id The position ID
   * @returns An Observable of Position
   */
  getPositionById(id: string): Observable<Position> {
    return this.apiService.get<Position>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new position
   * @param position The position to create
   * @returns An Observable of the created Position
   */
  createPosition(position: Omit<Position, 'id' | 'currentPrice' | 'pnl' | 'pnlPercentage'>): Observable<Position> {
    return this.apiService.post<Position>(this.endpoint, position);
  }

  /**
   * Update an existing position
   * @param id The position ID
   * @param position The updated position data
   * @returns An Observable of the updated Position
   */
  updatePosition(id: string, position: Partial<Position>): Observable<Position> {
    return this.apiService.put<Position>(`${this.endpoint}/${id}`, position);
  }

  /**
   * Delete a position
   * @param id The position ID
   * @returns An Observable of the operation result
   */
  deletePosition(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Get positions summary (total P&L, etc.)
   * @returns An Observable of the positions summary
   */
  getPositionsSummary(): Observable<PositionsSummary> {
    return this.apiService.get<PositionsSummary>(`${this.endpoint}/summary`);
  }
}
