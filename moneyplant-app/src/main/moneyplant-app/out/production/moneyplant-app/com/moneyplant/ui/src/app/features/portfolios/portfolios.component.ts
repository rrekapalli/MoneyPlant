import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-portfolios',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    CardModule
  ],
  templateUrl: './portfolios.component.html',
  styleUrl: './portfolios.component.scss'
})
export class PortfoliosComponent implements OnInit {
  portfolios: any[] = [];
  selectedPortfolio: any = null;
  loading = false;

  constructor() {}

  ngOnInit() {
    // Initialize with mock data
    this.loadPortfolios();
  }

  loadPortfolios() {
    this.loading = true;
    // Simulate API call with timeout
    setTimeout(() => {
      this.portfolios = [
        {
          id: '1',
          name: 'Long-term Investments',
          description: 'Portfolio for long-term growth investments',
          value: 125000,
          returnRate: 8.5,
          lastUpdated: new Date()
        },
        {
          id: '2',
          name: 'Dividend Portfolio',
          description: 'Stocks selected for dividend income',
          value: 75000,
          returnRate: 4.2,
          lastUpdated: new Date()
        },
        {
          id: '3',
          name: 'Tech Growth',
          description: 'High-growth technology companies',
          value: 95000,
          returnRate: 12.7,
          lastUpdated: new Date()
        }
      ];
      this.loading = false;
    }, 1000);
  }

  selectPortfolio(portfolio: any) {
    this.selectedPortfolio = portfolio;
  }

  createPortfolio() {
    console.log('Create portfolio');
    // Implementation for creating a new portfolio would go here
  }

  editPortfolio(portfolio: any) {
    console.log('Edit portfolio', portfolio);
    // Implementation for editing a portfolio would go here
  }

  deletePortfolio(portfolio: any) {
    console.log('Delete portfolio', portfolio);
    // Implementation for deleting a portfolio would go here
  }
}