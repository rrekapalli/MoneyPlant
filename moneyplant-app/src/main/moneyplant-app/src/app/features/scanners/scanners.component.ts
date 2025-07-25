import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-scanners',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TableModule,
    CardModule,
    TabsModule
  ],
  templateUrl: './scanners.component.html',
  styleUrl: './scanners.component.scss'
})
export class ScannersComponent implements OnInit {
  scanners: any[] = [];
  predefinedScanners: any[] = [];
  customScanners: any[] = [];
  selectedScanner: any = null;
  loading = false;

  // Define tabs for the new p-tabs component
  tabs = [
    { label: 'All Scanners', value: 'all' },
    { label: 'Predefined Scanners', value: 'predefined' },
    { label: 'Custom Scanners', value: 'custom' }
  ];
  activeTab = 'all';

  constructor() {}

  ngOnInit() {
    // Initialize with mock data
    this.loadScanners();
  }

  loadScanners() {
    this.loading = true;
    // Simulate API call with timeout
    setTimeout(() => {
      this.predefinedScanners = [
        {
          id: '1',
          name: 'Oversold Stocks',
          description: 'Stocks with RSI below 30',
          category: 'Technical',
          lastRun: new Date(Date.now() - 3600000), // 1 hour ago
          results: 12
        },
        {
          id: '2',
          name: 'Earnings Surprises',
          description: 'Stocks that beat earnings expectations',
          category: 'Fundamental',
          lastRun: new Date(Date.now() - 86400000), // 1 day ago
          results: 8
        },
        {
          id: '3',
          name: 'Volume Breakouts',
          description: 'Stocks with unusual volume',
          category: 'Technical',
          lastRun: new Date(Date.now() - 7200000), // 2 hours ago
          results: 5
        }
      ];

      this.customScanners = [
        {
          id: '4',
          name: 'My Growth Scanner',
          description: 'High growth stocks with low debt',
          category: 'Custom',
          lastRun: new Date(Date.now() - 172800000), // 2 days ago
          results: 3
        },
        {
          id: '5',
          name: 'Dividend Champions',
          description: 'Stocks with consistent dividend growth',
          category: 'Custom',
          lastRun: new Date(Date.now() - 259200000), // 3 days ago
          results: 7
        }
      ];

      this.scanners = [...this.predefinedScanners, ...this.customScanners];
      this.loading = false;
    }, 1000);
  }

  runScanner(scanner: any) {
    console.log('Running scanner', scanner);
    // Implementation for running a scanner would go here
    scanner.lastRun = new Date();
  }

  viewResults(scanner: any) {
    console.log('Viewing results for scanner', scanner);
    this.selectedScanner = scanner;
    // Implementation for viewing scanner results would go here
  }

  createScanner() {
    console.log('Create scanner');
    // Implementation for creating a new scanner would go here
  }

  editScanner(scanner: any) {
    console.log('Edit scanner', scanner);
    // Implementation for editing a scanner would go here
  }

  deleteScanner(scanner: any) {
    console.log('Delete scanner', scanner);
    // Implementation for deleting a scanner would go here
  }
}
