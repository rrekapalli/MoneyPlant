import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Index, IndexCreateDto, IndexResponseDto } from '../entities/indices';

@Injectable({
  providedIn: 'root'
})
export class IndicesService {
  private readonly endpoint = '/api/v1/index';

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
   * Gets all indices
   * @returns An Observable of index responses array
   */
  getAllIndices(): Observable<IndexResponseDto[]> {
    return this.apiService.get<IndexResponseDto[]>(this.endpoint);
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
}