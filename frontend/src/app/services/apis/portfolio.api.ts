import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { PortfolioDto, PortfolioCreateRequest, PortfolioUpdateRequest, PortfolioPatchRequest } from '../entities/portfolio.entities';

@Injectable({
  providedIn: 'root'
})
export class PortfolioApiService extends ApiService {
  
  /**
   * Get all portfolios
   */
  getPortfolios(): Observable<PortfolioDto[]> {
    return this.get<PortfolioDto[]>('/api/v1/portfolio');
  }

  /**
   * Get a specific portfolio by ID
   */
  getPortfolio(id: number): Observable<PortfolioDto> {
    return this.get<PortfolioDto>(`/api/v1/portfolio/${id}`);
  }

  /**
   * Create a new portfolio
   */
  createPortfolio(request: PortfolioCreateRequest): Observable<PortfolioDto> {
    return this.post<PortfolioDto>('/api/v1/portfolio', request);
  }

  /**
   * Update a portfolio
   */
  updatePortfolio(id: number, request: PortfolioUpdateRequest): Observable<PortfolioDto> {
    return this.put<PortfolioDto>(`/api/v1/portfolio/${id}`, request);
  }

  /**
   * Partially update a portfolio
   */
  patchPortfolio(id: number, request: PortfolioPatchRequest): Observable<PortfolioDto> {
    return this.patch<PortfolioDto>(`/api/v1/portfolio/${id}`, request);
  }

  /**
   * Delete a portfolio
   */
  deletePortfolio(id: number): Observable<void> {
    return this.delete<void>(`/api/v1/portfolio/${id}`);
  }
}
