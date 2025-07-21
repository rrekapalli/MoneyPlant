import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { Holding } from '../entities/holding';
import { HoldingGroup } from '../entities/holding-group';
import { MockApiService } from './mock-api.service';

@Injectable({
  providedIn: 'root'
})
export class HoldingsService {
  private readonly endpoint = '/holdings';

  constructor(private apiService: MockApiService) {}

  /**
   * Get all holding groups
   * @returns An Observable of HoldingGroup array
   */
  getHoldingGroups(): Observable<HoldingGroup[]> {
    return this.apiService.get<HoldingGroup[]>(this.endpoint);
  }

  /**
   * Get a specific holding group by ID
   * @param id The holding group ID
   * @returns An Observable of HoldingGroup
   */
  getHoldingGroupById(id: string): Observable<HoldingGroup> {
    return this.apiService.get<HoldingGroup>(`${this.endpoint}/${id}`);
  }

  /**
   * Create a new holding group
   * @param holdingGroup The holding group to create
   * @returns An Observable of the created HoldingGroup
   */
  createHoldingGroup(holdingGroup: Omit<HoldingGroup, 'id' | 'totalValue' | 'dailyChange'>): Observable<HoldingGroup> {
    return this.apiService.post<HoldingGroup>(this.endpoint, holdingGroup);
  }

  /**
   * Update an existing holding group
   * @param id The holding group ID
   * @param holdingGroup The updated holding group data
   * @returns An Observable of the updated HoldingGroup
   */
  updateHoldingGroup(id: string, holdingGroup: Partial<HoldingGroup>): Observable<HoldingGroup> {
    return this.apiService.put<HoldingGroup>(`${this.endpoint}/${id}`, holdingGroup);
  }

  /**
   * Delete a holding group
   * @param id The holding group ID
   * @returns An Observable of the operation result
   */
  deleteHoldingGroup(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  /**
   * Add a holding to a holding group
   * @param groupId The holding group ID
   * @param holding The holding to add
   * @returns An Observable of the updated HoldingGroup
   */
  addHolding(groupId: string, holding: Omit<Holding, 'value' | 'change'>): Observable<HoldingGroup> {
    return this.apiService.post<HoldingGroup>(`${this.endpoint}/${groupId}/holdings`, holding);
  }

  /**
   * Update a holding in a holding group
   * @param groupId The holding group ID
   * @param symbol The symbol of the holding to update
   * @param holding The updated holding data
   * @returns An Observable of the updated HoldingGroup
   */
  updateHolding(groupId: string, symbol: string, holding: Partial<Holding>): Observable<HoldingGroup> {
    return this.apiService.put<HoldingGroup>(`${this.endpoint}/${groupId}/holdings/${symbol}`, holding);
  }

  /**
   * Remove a holding from a holding group
   * @param groupId The holding group ID
   * @param symbol The symbol of the holding to remove
   * @returns An Observable of the updated HoldingGroup
   */
  removeHolding(groupId: string, symbol: string): Observable<HoldingGroup> {
    return this.apiService.delete<HoldingGroup>(`${this.endpoint}/${groupId}/holdings/${symbol}`);
  }
}
