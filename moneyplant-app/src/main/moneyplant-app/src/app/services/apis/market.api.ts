import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { MarketData } from '../entities/market-data';
import { MarketSummary } from '../entities/market-summary';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private readonly endpoint = '/market';

  constructor(private apiService: MockApiService) {}

  /**
   * Get market summary data (indices)
   * @returns An Observable of MarketSummary array
   */
  getMarketSummary(): Observable<MarketSummary[]> {
    return this.apiService.get<MarketSummary[]>(`${this.endpoint}/summary`);
  }

  /**
   * Get top gainers in the market
   * @param limit Optional limit on the number of results
   * @returns An Observable of MarketData array
   */
  getTopGainers(limit: number = 10): Observable<MarketData[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(`${this.endpoint}/gainers`, params);
  }

  /**
   * Get top losers in the market
   * @param limit Optional limit on the number of results
   * @returns An Observable of MarketData array
   */
  getTopLosers(limit: number = 10): Observable<MarketData[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(`${this.endpoint}/losers`, params);
  }

  /**
   * Get most active stocks in the market
   * @param limit Optional limit on the number of results
   * @returns An Observable of MarketData array
   */
  getMostActive(limit: number = 10): Observable<MarketData[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.apiService.get<MarketData[]>(`${this.endpoint}/active`, params);
  }

  /**
   * Search for stocks by symbol or name
   * @param query The search query
   * @returns An Observable of MarketData array
   */
  searchStocks(query: string): Observable<MarketData[]> {
    const params = new HttpParams().set('q', query);
    return this.apiService.get<MarketData[]>(`${this.endpoint}/search`, params);
  }

  /**
   * Get detailed data for a specific stock
   * @param symbol The stock symbol
   * @returns An Observable of MarketData
   */
  getStockDetails(symbol: string): Observable<MarketData> {
    return this.apiService.get<MarketData>(`${this.endpoint}/stocks/${symbol}`);
  }
}
