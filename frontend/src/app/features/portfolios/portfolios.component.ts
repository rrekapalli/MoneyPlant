import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DataViewModule } from 'primeng/dataview';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';

import { PortfolioApiService } from '../../services/apis/portfolio.api';
import { PortfolioDto } from '../../services/entities/portfolio.entities';

@Component({
  selector: 'app-portfolios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    DataViewModule,
    CardModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ProgressBarModule,
    TooltipModule,
    FormsModule
  ],
  templateUrl: './portfolios.component.html',
  styleUrls: ['./portfolios.component.scss']
})
export class PortfoliosComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  portfolios: PortfolioDto[] = [];
  filteredPortfolios: PortfolioDto[] = [];
  loading = false;
  error: string | null = null;
  
  // Search and filter properties
  searchText = '';
  selectedRiskProfile: string | null = null;
  layout: 'list' | 'grid' = 'list';
  
  // Sorting properties
  sortField: string = 'name';
  sortOrder: number = 1;
  
  // Risk profile options for filter
  riskProfileOptions = [
    { label: 'Conservative', value: 'CONSERVATIVE' },
    { label: 'Moderate', value: 'MODERATE' },
    { label: 'Aggressive', value: 'AGGRESSIVE' }
  ];

  constructor(private portfolioApiService: PortfolioApiService) {}

  ngOnInit(): void {
    // Check if user has a valid token
    if (!this.hasValidToken()) {
      this.goToLogin();
      return;
    }
    
    this.loadPortfolios();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }
    
    try {
      // Decode the JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return false;
    }
  }

  loadPortfolios(): void {
    this.loading = true;
    this.error = null;
    
    this.portfolioApiService.getPortfolios()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data) => {
          this.portfolios = data;
          this.applyFilters();
        },
        error: (error) => {
          console.error('Error loading portfolios:', error);
          if (error.status === 401) {
            this.error = 'Authentication expired. Please log in again.';
            // Clear invalid token
            localStorage.removeItem('auth_token');
          } else {
            this.error = 'Failed to load portfolios. Please try again.';
          }
        }
      });
  }

  // Computed properties for summary cards
  get totalPortfolios(): number {
    return this.portfolios.length;
  }

  get activePortfolios(): number {
    return this.portfolios.filter(p => p.isActive).length;
  }

  get conservativePortfolios(): number {
    return this.portfolios.filter(p => p.riskProfile === 'CONSERVATIVE').length;
  }

  get moderatePortfolios(): number {
    return this.portfolios.filter(p => p.riskProfile === 'MODERATE').length;
  }

  get aggressivePortfolios(): number {
    return this.portfolios.filter(p => p.riskProfile === 'AGGRESSIVE').length;
  }

  // Search and filtering methods
  onSearchChange(): void {
    this.applyFilters();
  }

  onRiskProfileChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedRiskProfile = null;
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.portfolios];

    // Apply search filter
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase();
      filtered = filtered.filter(portfolio =>
        portfolio.name.toLowerCase().includes(searchLower) ||
        portfolio.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply risk profile filter
    if (this.selectedRiskProfile) {
      filtered = filtered.filter(portfolio =>
        portfolio.riskProfile === this.selectedRiskProfile
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[this.sortField as keyof PortfolioDto];
      let bValue: any = b[this.sortField as keyof PortfolioDto];

      if (this.sortField === 'inceptionDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return -1 * this.sortOrder;
      if (aValue > bValue) return 1 * this.sortOrder;
      return 0;
    });

    this.filteredPortfolios = filtered;
  }

  onSortChange(field: string): void {
    if (this.sortField === field) {
      this.sortOrder = this.sortOrder === 1 ? -1 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }
    this.applyFilters();
  }

  // Action methods
  createPortfolio(): void {
    console.log('Create portfolio clicked');
    // TODO: Implement portfolio creation
  }

  selectPortfolio(portfolio: PortfolioDto): void {
    console.log('Select portfolio:', portfolio);
    // TODO: Navigate to portfolio details
  }

  editPortfolio(portfolio: PortfolioDto): void {
    console.log('Edit portfolio:', portfolio);
    // TODO: Implement portfolio editing
  }

  configurePortfolio(portfolio: PortfolioDto): void {
    console.log('Configure portfolio:', portfolio);
    // TODO: Implement portfolio configuration
  }

  viewPortfolioData(portfolio: PortfolioDto): void {
    console.log('View portfolio data:', portfolio);
    // TODO: Navigate to portfolio data view
  }

  viewPortfolioInsights(portfolio: PortfolioDto): void {
    console.log('View portfolio insights:', portfolio);
    // TODO: Navigate to portfolio insights
  }

  goToLogin(): void {
    window.location.href = '/login';
  }

  // Utility methods
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }

  getRiskProfileLabel(riskProfile: string): string {
    const labels: { [key: string]: string } = {
      'CONSERVATIVE': 'Low Risk',
      'MODERATE': 'Medium Risk',
      'AGGRESSIVE': 'High Risk'
    };
    return labels[riskProfile] || riskProfile;
  }
}