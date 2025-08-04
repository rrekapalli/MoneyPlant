import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Stock } from '../entities/stock';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly endpoint = '/api/v1/stock';

  constructor(private apiService: ApiService) {}

  /**
   * Get all stocks
   * @returns An Observable of Stock array
   */
  getAllStocks(): Observable<Stock[]> {
    return this.apiService.get<Stock[]>(this.endpoint);
  }

  /**
   * Get a specific stock by ID
   * @param id The stock ID
   * @returns An Observable of Stock
   */
  getStockById(id: string): Observable<Stock> {
    return this.apiService.get<Stock>(`${this.endpoint}/${id}`);
  }

  /**
   * Get a specific stock by symbol
   * @param symbol The stock symbol
   * @returns An Observable of Stock
   */
  getStockBySymbol(symbol: string): Observable<Stock> {
    return this.apiService.get<Stock>(`${this.endpoint}/symbol/${symbol}`);
  }

  /**
   * Create a new stock
   * @param stock The stock to create
   * @returns An Observable of the created Stock
   */
  createStock(stock: Stock): Observable<Stock> {
    return this.apiService.post<Stock>(this.endpoint, stock);
  }
}