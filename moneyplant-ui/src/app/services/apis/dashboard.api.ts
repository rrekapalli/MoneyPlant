import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.base';
import { MockApiService } from './mock-api.service';

// Define the dashboard data interface
export interface DashboardDataRow {
  id: string;
  assetCategory: string;
  month: string;
  market: string;
  totalValue: number;
  riskValue?: number;
  returnValue?: number;
  description?: string;
}

// Define API response interfaces for different widget types
export interface AssetAllocationData {
  name: string;
  value: number;
  percentage: number;
}

export interface MonthlyIncomeExpensesData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface RiskReturnData {
  assetCategory: string;
  risk: number;
  return: number;
  marketCap: number;
}

export interface InvestmentDistributionData {
  country: string;
  region: string;
  value: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly endpoint = '/dashboard';

  constructor(private apiService: MockApiService) {}

  /**
   * Get raw dashboard data with optional filtering
   * @param filters Optional filters to apply
   * @returns An Observable of DashboardDataRow array
   */
  getDashboardData(filters?: any[]): Observable<DashboardDataRow[]> {
    let params = new HttpParams();
    if (filters && filters.length > 0) {
      params = params.set('filters', JSON.stringify(filters));
    }
    return this.apiService.get<DashboardDataRow[]>(`${this.endpoint}/data`, params);
  }

  /**
   * Get asset allocation data for pie chart
   * @param filters Optional filters to apply
   * @returns An Observable of AssetAllocationData array
   */
  getAssetAllocation(filters?: any[]): Observable<AssetAllocationData[]> {
    let params = new HttpParams();
    if (filters && filters.length > 0) {
      params = params.set('filters', JSON.stringify(filters));
    }
    return this.apiService.get<AssetAllocationData[]>(`${this.endpoint}/asset-allocation`, params);
  }

  /**
   * Get monthly income vs expenses data for bar chart
   * @param filters Optional filters to apply
   * @returns An Observable of MonthlyIncomeExpensesData array
   */
  getMonthlyIncomeExpenses(filters?: any[]): Observable<MonthlyIncomeExpensesData[]> {
    let params = new HttpParams();
    if (filters && filters.length > 0) {
      params = params.set('filters', JSON.stringify(filters));
    }
    return this.apiService.get<MonthlyIncomeExpensesData[]>(`${this.endpoint}/monthly-income-expenses`, params);
  }

  /**
   * Get risk vs return analysis data for scatter chart
   * @param filters Optional filters to apply
   * @returns An Observable of RiskReturnData array
   */
  getRiskReturnAnalysis(filters?: any[]): Observable<RiskReturnData[]> {
    let params = new HttpParams();
    if (filters && filters.length > 0) {
      params = params.set('filters', JSON.stringify(filters));
    }
    return this.apiService.get<RiskReturnData[]>(`${this.endpoint}/risk-return-analysis`, params);
  }

  /**
   * Get investment distribution data for map chart
   * @param filters Optional filters to apply
   * @returns An Observable of InvestmentDistributionData array
   */
  getInvestmentDistribution(filters?: any[]): Observable<InvestmentDistributionData[]> {
    let params = new HttpParams();
    if (filters && filters.length > 0) {
      params = params.set('filters', JSON.stringify(filters));
    }
    return this.apiService.get<InvestmentDistributionData[]>(`${this.endpoint}/investment-distribution`, params);
  }

  /**
   * Get metric tiles data
   * @param filters Optional filters to apply
   * @returns An Observable of any object
   */
  getMetricTiles(filters?: any[]): Observable<any> {
    let params = new HttpParams();
    if (filters && filters.length > 0) {
      params = params.set('filters', JSON.stringify(filters));
    }
    return this.apiService.get<any>(`${this.endpoint}/metrics`, params);
  }
} 