import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { NseHistoricalData } from '../entities/nse-historical-data';
import { NseHistoricalDataId } from '../entities/nse-historical-data-id';

@Injectable({
  providedIn: 'root'
})
export class NseHistoricalDataService {
  private readonly endpoint = '/api/v1/nse-historical-data';

  constructor(private apiService: ApiService) {}

  /**
   * Get all NSE historical data
   * @returns An Observable of NseHistoricalData array
   */
  getAllNseHistoricalData(): Observable<NseHistoricalData[]> {
    return this.apiService.get<NseHistoricalData[]>(this.endpoint);
  }

  /**
   * Get NSE historical data by symbol
   * @param symbol The equity symbol
   * @returns An Observable of NseHistoricalData array for the specified symbol
   */
  getNseHistoricalDataBySymbol(symbol: string): Observable<NseHistoricalData[]> {
    return this.apiService.get<NseHistoricalData[]>(`${this.endpoint}/symbol/${symbol}`);
  }

  /**
   * Get NSE historical data by symbol and date
   * @param symbol The equity symbol
   * @param date The date in ISO format (YYYY-MM-DD)
   * @returns An Observable of NseHistoricalData
   */
  getNseHistoricalDataBySymbolAndDate(symbol: string, date: string): Observable<NseHistoricalData> {
    return this.apiService.get<NseHistoricalData>(`${this.endpoint}/symbol/${symbol}/date/${date}`);
  }

  /**
   * Create a new NSE historical data entry
   * @param nseHistoricalData The NSE historical data to create
   * @returns An Observable of the created NseHistoricalData
   */
  createNseHistoricalData(nseHistoricalData: NseHistoricalData): Observable<NseHistoricalData> {
    return this.apiService.post<NseHistoricalData>(this.endpoint, nseHistoricalData);
  }

  /**
   * Update an existing NSE historical data entry
   * @param id The composite ID (symbol and date)
   * @param nseHistoricalData The updated NSE historical data
   * @returns An Observable of the updated NseHistoricalData
   */
  updateNseHistoricalData(id: NseHistoricalDataId, nseHistoricalData: Partial<NseHistoricalData>): Observable<NseHistoricalData> {
    return this.apiService.put<NseHistoricalData>(`${this.endpoint}/symbol/${id.symbol}/date/${id.date}`, nseHistoricalData);
  }

  /**
   * Delete an NSE historical data entry
   * @param id The composite ID (symbol and date)
   * @returns An Observable of the operation result
   */
  deleteNseHistoricalData(id: NseHistoricalDataId): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/symbol/${id.symbol}/date/${id.date}`);
  }
}