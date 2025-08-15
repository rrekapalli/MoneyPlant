import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Index, IndexCreateDto, IndexResponseDto } from '../entities/indices';
import { IndexHistoricalData } from '../entities/index-historical-data';
import { IndicesDto } from '../entities/indices-websocket';

@Injectable({
  providedIn: 'root'
})
export class IndicesService {
  private readonly endpoint = '/api/v1/index';
  private readonly publicEndpoint = '/api/public/indices';
  private readonly stockEndpoint = '/api/v1/indices';

  constructor(private apiService: ApiService) {}

  /**
   * Creates a new index
   * @param indexToCreate The index data to create
   * @returns An Observable of the created index response
   */
  createIndex(indexToCreate: IndexCreateDto): Observable<IndexResponseDto> {
    return this.apiService.post<IndexResponseDto>(this.endpoint, indexToCreate);
  }

  /**
   * Gets all indices (public endpoint - no authentication required)
   * @returns An Observable of index responses array
   */
  getAllIndices(): Observable<IndexResponseDto[]> {
    return this.apiService.get<IndexResponseDto[]>(this.publicEndpoint);
  }

  /**
   * Gets an index by ID
   * @param id The ID of the index to retrieve
   * @returns An Observable of the index response
   */
  getIndexById(id: number): Observable<IndexResponseDto> {
    return this.apiService.get<IndexResponseDto>(`${this.endpoint}/${id}`);
  }

  /**
   * Gets an index by symbol
   * @param symbol The symbol of the index to retrieve
   * @returns An Observable of the index response
   */
  getIndexBySymbol(symbol: string): Observable<IndexResponseDto> {
    return this.apiService.get<IndexResponseDto>(`${this.endpoint}/symbol/${symbol}`);
  }

  /**
   * Gets an index by name
   * @param name The name of the index to retrieve
   * @returns An Observable of the index response
   */
  getIndexByName(name: string): Observable<IndexResponseDto> {
    return this.apiService.get<IndexResponseDto>(`${this.endpoint}/name/${name}`);
  }

  /**
   * Gets an index by key category
   * @param category The key category of the index to retrieve
   * @returns An Observable of the index response
   */
  getIndexByKeyCategory(category: string): Observable<IndexResponseDto> {
    return this.apiService.get<IndexResponseDto>(`${this.endpoint}/category/${category}`);
  }

  /**
   * Gets previous day's indices data for a specific index
   * @param indexName The name of the index to retrieve previous day's data for
   * @returns An Observable of the indices data for the previous day
   */
  getPreviousDayIndexData(indexName: string): Observable<IndicesDto> {
    // Convert index name to URL-friendly format (replace spaces with hyphens)
    const urlFriendlyIndexName = indexName.replace(/\s+/g, '-').toLowerCase();
    return this.apiService.get<IndicesDto>(`${this.stockEndpoint}/${urlFriendlyIndexName}/previous-day`);
  }

  /**
   * Gets historical data for a given index name
   * @param indexName The name of the index to retrieve historical data for
   * @returns An Observable of index historical data array
   */
  getIndexHistoricalData(indexName: string): Observable<IndexHistoricalData[]> {
    return this.apiService.get<IndexHistoricalData[]>(`${this.endpoint}/${indexName}/historical-data`);
  }
}